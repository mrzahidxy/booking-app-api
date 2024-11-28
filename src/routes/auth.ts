import { Router } from "express";
import { login } from "./../controllers/auth";
import { signup } from "../controllers/auth";
import { errorHandler } from "../exceptions/error-handler";

const authRoutes: Router = Router();

authRoutes.post("/signup", errorHandler(signup));
authRoutes.post("/login", errorHandler(login));

export default authRoutes;
