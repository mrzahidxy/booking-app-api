import express from "express";
import morgan from "morgan";
import cors from "cors";
import { raw } from "body-parser";
import logger from "./utils/logger";
import rootRouter from "./routes";
import { errorMiddleware } from "./middleware/error";
import { healthCheck, liveCheck } from "./controllers/healthCheck";
import paymentWebhookRoutes from "./routes/payment-webhook";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

const app = express();

app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

app.get("/live", liveCheck);
app.get("/health", healthCheck);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api/payments/webhook", raw({ type: "application/json" }), paymentWebhookRoutes);

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/api", rootRouter);

app.use(errorMiddleware);

export default app;
