import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@common/utils/jwt";
import { UserRepository } from "@modules/users/user.repository";

export class AuthService {
  constructor(private readonly userRepository = new UserRepository()) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email.toLowerCase(), true);
    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    if (!user.isActive) throw new ApiError(StatusCodes.FORBIDDEN, "User account is inactive");

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");

    const payload = { id: user.id, role: user.role };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findById(payload.id);
    if (!user || !user.isActive) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }

    return {
      accessToken: signAccessToken({ id: user.id, role: user.role }),
      refreshToken: signRefreshToken({ id: user.id, role: user.role }),
    };
  }
}
