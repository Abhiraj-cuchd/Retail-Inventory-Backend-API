import winston from "winston"
import path from "path"
import config from "../config"

const { combine, timestamp, printf, colorize } = winston.format

// Define log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

// Create the logger
export const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(timestamp(), logFormat),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join(config.logging.directory, "error.log"),
      level: "error",
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(config.logging.directory, "combined.log"),
    }),
  ],
})

// Create the log directory if it doesn't exist
import fs from "fs"
if (!fs.existsSync(config.logging.directory)) {
  fs.mkdirSync(config.logging.directory, { recursive: true })
}
