import express, { Express} from "express";
import morgan from "morgan";
import { PORT } from "../src/secret";
import rootRouter from "../src/routes";
import cors from 'cors'
import { errorMiddleware } from "../src/middleware/error";
import { healthCheck } from "../src/controllers/healthCheck";
import logger from "../src/utils/logger";
import { raw } from "body-parser";
import { stripeWebhook } from "../src/controllers/payment";

const app: Express = express();

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
});
