import { createClient, RedisClientType } from "redis";
import { logger } from "./logger";
import { configDotenv } from "dotenv";
configDotenv();

class RedisService {
  private static instance: RedisService;
  private static client: RedisClientType;

  private constructor() {
    RedisService.client = createClient({
      socket: {
        host:
          process.env.NODE_ENV === "prod" ? "redis" : process.env.REDIS_HOST,
        port:
          process.env.NODE_ENV === "prod"
            ? 6379
            : Number(process.env.REDIS_PORT),
      },
      password:
        process.env.NODE_ENV === "prod" ? undefined : process.env.REDIS_PASS,
    });

    RedisService.client.on("error", (err) => {
      logger.error("Redis Client Error", err);
    });

    RedisService.client.connect();
    logger.info("Connected to Redis");
  }

  public static getInstance(): RedisClientType {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.client;
  }
}

export const redisClient = RedisService.getInstance();
