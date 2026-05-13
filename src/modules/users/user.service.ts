import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "@common/exceptions/ApiError";
import { UserRole } from "@common/constants/roles";
import { UserRepository } from "@modules/users/user.repository";

export class UserService {
  constructor(private readonly userRepository = new UserRepository()) {}

  async createAdmin(payload: { fullName: string; email: string; password: string; role: UserRole }) {
    const existing = await this.userRepository.findByEmail(payload.email);
    if (existing) throw new ApiError(StatusCodes.CONFLICT, "Email already exists");

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await this.userRepository.create({
      fullName: payload.fullName,
      email: payload.email.toLowerCase(),
      passwordHash,
      role: payload.role,
    });
    return user;
  }

  async listAllUsers() {
    return this.userRepository.listAllUsers();
  }

  async deactivateUserById(id: string, actorUserId: string) {
    const user = await this.userRepository.findActiveUserById(id);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    if (user.id === actorUserId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot remove your own account");
    }

    if (user.role === UserRole.ADMIN) {
      const activeAdmins = await this.userRepository.countActiveAdmins();
      if (activeAdmins <= 1) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "At least one active admin account is required");
      }
    }

    await this.userRepository.setActive(user.id, false);
  }
}
