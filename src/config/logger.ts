// logger.ts
import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, errors, splat } = winston.format;

// custom levels including 'http'
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "gray",
});

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level}: ${stack || message}`;
});

const baseFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  splat(),
  logFormat,
);

const consoleFormat = combine(colorize({ all: true }), baseFormat);

// const dailyRotate = new (winston.transports as any).DailyRotateFile({
//   dirname: "logs", // same folder
//   filename: "app-%DATE%.log", // one file per day
//   datePattern: "YYYY-MM-DD",
//   zippedArchive: true,
//   maxSize: "20m",
//   maxFiles: "14d", // keep 14 days of logs
//   level: "debug", // include EVERYTHING
// });

export const logger = winston.createLogger({
  levels,
  format: baseFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// For HTTP logging (express)
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
