import express, { Express} from "express";
import morgan from "morgan";
import { PORT } from "./secret";
import rootRouter from "./routes";
import cors from 'cors'
import { errorMiddleware } from "./middleware/error";
import { healthCheck } from "./controllers/healthCheck";
import logger from "./utils/logger";
import { raw } from "body-parser";
import { stripeWebhook } from "./controllers/payment";
import swaggerUi from 'swagger-ui-express';
import { specs } from './config';
import requestLogger from './middleware/requestLogger';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app: Express = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.post(
  "/api/payments/webhook",
  raw({ type: "application/json" }),   // <— gives you Buffer in req.body
  stripeWebhook
);

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Morgan setup
app.use(morgan("dev", {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
}));

app.use(express.json())

// Request logging middleware
app.use(requestLogger);

// Configure CORS based on environment
if (process.env.NODE_ENV === 'production') {
  // In production, you should specify your actual frontend domain(s)
  app.use(cors({ 
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
} else {
  // In development, allow all origins
  app.use(cors({ origin: '*' }));
}

app.use("/api", rootRouter);

app.use(errorMiddleware)

app.get("/health", healthCheck);

const server = app.listen(PORT, () => {
  console.log(`The app listening on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});