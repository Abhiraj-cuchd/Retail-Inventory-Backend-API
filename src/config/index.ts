import dotenv from "dotenv"

dotenv.config()

const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
  },
  database: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/inventory-management",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  mail: {
    host: process.env.MAIL_HOST || "smtp.example.com",
    port: Number.parseInt(process.env.MAIL_PORT || "587", 10),
    user: process.env.MAIL_USER || "user@example.com",
    password: process.env.MAIL_PASSWORD || "password",
    from: process.env.MAIL_FROM || "noreply@example.com",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
    directory: process.env.LOG_DIR || "logs",
  },
}

export default config
