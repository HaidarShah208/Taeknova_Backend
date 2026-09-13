// Vercel serverless entrypoint.
// Vercel doesn't run `npm run build` for src/*.ts on its own (that's what
// caused "Cannot find module '@config/env'" — the TS path aliases were never
// rewritten). This file boots the already-compiled `dist` output instead,
// where `tsc-alias` has already turned every `@alias/*` import into a plain
// relative path. `vercel.json` runs `npm run build` before deploying, and all
// requests are rewritten here so Express can still do its own routing.

const { AppDataSource } = require("../dist/database/data-source");
const { createApp } = require("../dist/app");

let appPromise;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      return createApp();
    })().catch((error) => {
      appPromise = undefined;
      throw error;
    });
  }
  return appPromise;
}

module.exports = async (req, res) => {
  try {
    const app = await getApp();
    app(req, res);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize backend", error);
    res.status(500).json({ success: false, message: "Service unavailable" });
  }
};
