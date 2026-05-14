import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "@common/constants/roles";
import { ApiError } from "@common/exceptions/ApiError";
import { EmailService, isSmtpTransportConfigured } from "@common/services/email.service";
import {
  createSignedRefreshToken,
  signAccessToken,
  verifyRefreshToken,
} from "@common/utils/jwt";
import { env } from "@config/env";
import { RefreshTokenRepository } from "@modules/auth/refreshToken.repository";
import { UserRepository } from "@modules/users/user.repository";

const VERIFY_TOKEN_BYTES = 32;
const VERIFY_TOKEN_EXPIRY_HOURS = 24;

export type AuthUserDto = { id: string; email: string; fullName: string; role: UserRole };

export type RegisterResult =
  | {
      status: "pending_verification";
      message: string;
      email: string;
    }
  | {
      status: "authenticated";
      message: string;
      accessToken: string;
      refreshToken: string;
      user: AuthUserDto;
    };

export class AuthService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly refreshTokenRepository = new RefreshTokenRepository(),
    private readonly emailService = new EmailService(),
  ) {}

  private async persistRefreshSession(userId: string, signed: ReturnType<typeof createSignedRefreshToken>) {
    const row = this.refreshTokenRepository.create({
      userId,
      jti: signed.jti,
      expiresAt: new Date(signed.expiresAtMs),
    });
    await this.refreshTokenRepository.save(row);
  }

  private assertEmailVerifiedOrThrow(emailVerifiedAt: Date | null | undefined): void {
    if (!emailVerifiedAt) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Please verify your email. We sent a confirmation link to your inbox.",
      );
    }
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email.toLowerCase(), true);
    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    if (!user.isActive) throw new ApiError(StatusCodes.FORBIDDEN, "User account is inactive");

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");

    this.assertEmailVerifiedOrThrow(user.emailVerifiedAt);

    const payload = { id: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refresh = createSignedRefreshToken(payload);
    await this.persistRefreshSession(user.id, refresh);

    return {
      accessToken,
      refreshToken: refresh.token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async refresh(rawRefreshToken: string) {
    let decoded: ReturnType<typeof verifyRefreshToken>;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }

    const session = await this.refreshTokenRepository.findActiveByJti(decoded.jti);
    if (!session || session.userId !== decoded.id) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh session expired or revoked");
    }

    const user = await this.userRepository.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }

    this.assertEmailVerifiedOrThrow(user.emailVerifiedAt);

    await this.refreshTokenRepository.revokeByJti(decoded.jti);

    const payload = { id: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const nextRefresh = createSignedRefreshToken(payload);
    await this.persistRefreshSession(user.id, nextRefresh);

    return {
      accessToken,
      refreshToken: nextRefresh.token,
    };
  }

  async revokeRefreshToken(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;
    try {
      const decoded = verifyRefreshToken(rawRefreshToken);
      await this.refreshTokenRepository.revokeByJti(decoded.jti);
    } catch {
      /* ignore malformed tokens */
    }
  }

  async register(fullName: string, email: string, password: string): Promise<RegisterResult> {
    const normalized = email.toLowerCase();
    const existing = await this.userRepository.findByEmail(normalized);
    if (existing) throw new ApiError(StatusCodes.CONFLICT, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const smtpReady = isSmtpTransportConfigured();
    const token = smtpReady ? randomBytes(VERIFY_TOKEN_BYTES).toString("hex") : null;
    const expiresAt = smtpReady
      ? new Date(Date.now() + VERIFY_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
      : null;

    const user = await this.userRepository.create({
      fullName,
      email: normalized,
      passwordHash,
      role: UserRole.USER,
      isActive: true,
      emailVerifiedAt: smtpReady ? null : new Date(),
      emailVerificationToken: token,
      emailVerificationExpiresAt: expiresAt,
    });

    if (smtpReady && token && expiresAt) {
      const base = env.APP_ORIGIN.replace(/\/$/, "");
      const verifyUrl = `${base}/verify-email?token=${encodeURIComponent(token)}`;
      void this.emailService
        .sendVerifyEmailAddress({ to: user.email, fullName: user.fullName, verifyUrl })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[auth] Verification email failed", { userId: user.id, error: message });
        });

      return {
        status: "pending_verification",
        message: "Check your email to verify your account before signing in.",
        email: user.email,
      };
    }

    console.warn("[auth] SMTP not configured; new user marked as email-verified for local development.");

    const payload = { id: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refresh = createSignedRefreshToken(payload);
    await this.persistRefreshSession(user.id, refresh);

    return {
      status: "authenticated",
      message: "Account created",
      accessToken,
      refreshToken: refresh.token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async verifyEmailWithToken(rawToken: string): Promise<{ message: string }> {
    const token = rawToken.trim();
    if (!token) throw new ApiError(StatusCodes.BAD_REQUEST, "Verification token is required");

    const user = await this.userRepository.findByEmailVerificationToken(token);
    if (!user || !user.emailVerificationExpiresAt) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired verification link");
    }
    if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired verification link");
    }
    if (user.emailVerifiedAt) {
      return { message: "Email is already verified. You can sign in." };
    }

    await this.userRepository.markEmailVerified(user.id);
    return { message: "Your email has been verified. You can sign in." };
  }
}
