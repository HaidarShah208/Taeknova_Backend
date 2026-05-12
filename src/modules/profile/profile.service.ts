import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { UserRepository } from "@modules/users/user.repository";
import { UploadService } from "@modules/uploads/upload.service";

export class ProfileService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly uploadService = new UploadService(),
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, payload: { fullName?: string }) {
    if (payload.fullName) {
      await this.userRepository.updatePartial(userId, { fullName: payload.fullName });
    }
    return this.getProfile(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByIdWithPassword(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new ApiError(StatusCodes.UNAUTHORIZED, "Current password is incorrect");
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.updatePasswordHash(userId, passwordHash);
  }

  async uploadAvatar(userId: string, fileBuffer: Buffer) {
    const uploaded = await this.uploadService.uploadAvatar(fileBuffer);
    await this.userRepository.updatePartial(userId, { avatarUrl: uploaded.secure_url });
    return this.getProfile(userId);
  }
}
