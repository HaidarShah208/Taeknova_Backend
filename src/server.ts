import "reflect-metadata";
import { createApp } from "./app";
import { env } from "@config/env";
import { AppDataSource } from "@database/data-source";

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  const app = createApp();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
