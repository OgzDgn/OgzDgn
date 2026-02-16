import Redis from "ioredis";
import { env } from "../config/env";

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: false,
  maxRetriesPerRequest: 2,
  enableAutoPipelining: true
});

redis.on("connect", () => {
  // eslint-disable-next-line no-console
  console.log("[redis] connected");
});

redis.on("error", (error) => {
  // eslint-disable-next-line no-console
  console.error("[redis] error", error.message);
});
