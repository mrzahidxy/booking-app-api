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
import specs from './config/swagger';

const app: Express = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.post(
  "/api/payments/webhook",
  raw({ type: "application/json" }),   // <— gives you Buffer in req.body
  stripeWebhook
);

// Morgan setup
app.use(morgan("dev", {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
}));

app.use(express.json())
app.use(cors({ origin: '*' }))


app.use("/api", rootRouter);

app.use(errorMiddleware)

app.get("/health", healthCheck);

app.listen(PORT, () => {
  console.log(`The app listening on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});


//test