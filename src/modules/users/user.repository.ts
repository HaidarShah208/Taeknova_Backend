import { Repository } from "typeorm";
import { AppDataSource } from "@database/data-source";
import { User } from "@modules/users/user.entity";
import { UserRole } from "@common/constants/roles";

export class UserRepository {
  private readonly repo: Repository<User> = AppDataSource.getRepository(User);

  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    return this.repo.findOne({
      where: { email },
      select: includePassword
        ? {
            id: true,
            email: true,
            fullName: true,
            passwordHash: true,
            role: true,
            isActive: true,
            emailVerifiedAt: true,
            createdAt: true,
            updatedAt: true,
          }
        : undefined,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.repo.findOne({
      where: { emailVerificationToken: token },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        emailVerifiedAt: true,
        emailVerificationToken: true,
        emailVerificationExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.repo.update(
      { id: userId },
      {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    );
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        passwordHash: true,
        role: true,
        isActive: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updatePartial(id: string, data: Partial<Pick<User, "fullName" | "avatarUrl">>): Promise<void> {
    await this.repo.update({ id }, data);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.repo.update({ id }, { passwordHash });
  }

  async listAllUsers(): Promise<User[]> {
    return this.repo.find({
      order: { createdAt: "DESC" },
    });
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await this.repo.update({ id }, { isActive });
  }

  async findActiveUserById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id, isActive: true } });
  }

  async countActiveAdmins(): Promise<number> {
    return this.repo.count({ where: { role: UserRole.ADMIN, isActive: true } });
  }
}
