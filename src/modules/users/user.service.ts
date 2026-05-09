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
}
