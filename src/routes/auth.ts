import { Router } from "express";
import { login } from "./../contrrollers/auth";
import { signup } from "../contrrollers/auth";
import { errorHandler } from "../exceptions/error-handler";

const authRoutes: Router = Router();

authRoutes.post("/signup", errorHandler(signup));
authRoutes.post("/login", errorHandler(login));

export default authRoutes;
