import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import { RegisterRoutes } from "./routes/routes"
import { errorHandler } from "./middleware/errorHandler"
import { notFoundHandler } from "./middleware/notFoundHandler"
import swaggerUi from "swagger-ui-express"
import { logger } from "./utils/logger"
import mongoose from "mongoose"
import config from "./config"

class App {
  public app: express.Application

  constructor() {
    this.app = express()
    this.configureMiddleware()
    this.configureRoutes()
    this.configureErrorHandling()
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet())
    this.app.use(cors())

    // Body parsing middleware
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))

    // Logging middleware
    this.app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }))

    // Swagger documentation
    this.app.use("/docs", swaggerUi.serve, async (_req: express.Request, res: express.Response) => {
      return res.send(swaggerUi.generateHTML(await import("./swagger.json")))
    })
  }

  private configureRoutes(): void {
    RegisterRoutes(this.app)
  }

  private configureErrorHandling(): void {
    this.app.use(notFoundHandler)
    this.app.use(errorHandler)
  }

  public async connectToDatabase(): Promise<void> {
    try {
      await mongoose.connect(config.database.url)
      logger.info("Connected to MongoDB")
    } catch (error) {
      logger.error("MongoDB connection error:", error)
      process.exit(1)
    }
  }

  public listen(): void {
    const port = config.server.port
    this.app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Swagger docs available at http://localhost:${port}/docs`)
    })
  }
}

export default App
