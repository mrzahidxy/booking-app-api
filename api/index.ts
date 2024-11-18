import express, { Express} from "express";
import { PORT } from "../src/secret";
import rootRouter from "../src/routes";
import cors from 'cors'
import { errorMiddleware } from "../src/middleware/error";

const app: Express = express();
app.use(express.json());
app.use(cors({ origin: '*' }))


app.use("/api", rootRouter);

app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`The app listening on port ${PORT}`);
});
