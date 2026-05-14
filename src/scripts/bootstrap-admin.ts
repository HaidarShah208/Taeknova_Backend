import "reflect-metadata";
import bcrypt from "bcrypt";
import { UserRole } from "@common/constants/roles";
import { AppDataSource } from "@database/data-source";
import { User } from "@modules/users/user.entity";

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value || !value.trim()) {
    throw new Error(`Missing ${name}. Set it in .env (see .env.example).`);
  }
  return value.trim();
}

async function main(): Promise<void> {
  const email = requireEnv("BOOTSTRAP_ADMIN_EMAIL", "admin@local.test").toLowerCase();
  const password = requireEnv("BOOTSTRAP_ADMIN_PASSWORD", "ChangeMe123!");
  const fullName = requireEnv("BOOTSTRAP_ADMIN_FULL_NAME", "Platform Admin");

  if (password.length < 8) {
    throw new Error("BOOTSTRAP_ADMIN_PASSWORD must be at least 8 characters.");
  }

  await AppDataSource.initialize();
  try {
    const repo = AppDataSource.getRepository(User);

    const existing = await repo.findOne({ where: { email } });

    if (existing) {
      if (existing.role === UserRole.ADMIN) {
        console.log(`Admin already exists for ${email}. No changes made.`);
        return;
      }
      throw new Error(
        `User ${email} exists with role ${existing.role}. Use another BOOTSTRAP_ADMIN_EMAIL or change role in DB.`,
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = repo.create({
      email,
      fullName,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    });
    await repo.save(user);

    console.log("Admin user created successfully.");
    console.log(`  Email:    ${email}`);
    console.log(`  Password: (the value you set in BOOTSTRAP_ADMIN_PASSWORD)`);
    console.log("Use these credentials with POST /api/v1/auth/login and open /admin in the app.");
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
