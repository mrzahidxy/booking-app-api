import { Router } from "express";
import { login } from "./../controllers/auth";
import { signup } from "../controllers/auth";
import { asyncHandler } from "../exceptions/async-handler";

const authRoutes: Router = Router();

authRoutes.post("/signup", asyncHandler(signup));
authRoutes.post("/login", asyncHandler(login));

export default authRoutes;
