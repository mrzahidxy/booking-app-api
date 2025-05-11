import express, { Express} from "express";
import { PORT } from "../src/secret";
import rootRouter from "../src/routes";
import cors from 'cors'
import { errorMiddleware } from "../src/middleware/error";
import { healthCheck } from "../src/controllers/healthCheck";

const app: Express = express();
app.use(express.json());
app.use(cors({ origin: '*' }))


app.use("/api", rootRouter);

app.use(errorMiddleware)

app.get("/health", healthCheck);

app.listen(PORT, () => {
  console.log(`The app listening on port ${PORT}`);
});


//test
