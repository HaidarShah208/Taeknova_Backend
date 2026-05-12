import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "@common/constants/roles";
import { ApiError } from "@common/exceptions/ApiError";
import {
  createSignedRefreshToken,
  signAccessToken,
  verifyRefreshToken,
} from "@common/utils/jwt";
import { RefreshTokenRepository } from "@modules/auth/refreshToken.repository";
import { UserRepository } from "@modules/users/user.repository";

export class AuthService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly refreshTokenRepository = new RefreshTokenRepository(),
  ) {}

  private async persistRefreshSession(userId: string, signed: ReturnType<typeof createSignedRefreshToken>) {
    const row = this.refreshTokenRepository.create({
      userId,
      jti: signed.jti,
      expiresAt: new Date(signed.expiresAtMs),
    });
    await this.refreshTokenRepository.save(row);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email.toLowerCase(), true);
    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    if (!user.isActive) throw new ApiError(StatusCodes.FORBIDDEN, "User account is inactive");

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");

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

  async register(fullName: string, email: string, password: string) {
    const normalized = email.toLowerCase();
    const existing = await this.userRepository.findByEmail(normalized);
    if (existing) throw new ApiError(StatusCodes.CONFLICT, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepository.create({
      fullName,
      email: normalized,
      passwordHash,
      role: UserRole.USER,
      isActive: true,
    });

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
}
