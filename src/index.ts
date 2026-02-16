import { app } from "./app";
import { env } from "./config/env";
import { redis } from "./lib/redis";

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] server started on port ${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`[api] received ${signal}, shutting down...`);

  server.close(async () => {
    await redis.quit();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
