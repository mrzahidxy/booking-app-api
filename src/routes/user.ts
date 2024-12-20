import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../exceptions/async-handler";
import { getUsers, updateUser } from "../controllers/user";
import checkPermission from "../middleware/check-permission";


const userRoutes: Router =  Router();


userRoutes.get("/",authMiddleware, checkPermission("GET_USER"), asyncHandler(getUsers));
userRoutes.put ("/:id",authMiddleware, checkPermission("UPDATE_USER"), asyncHandler(updateUser));

export default userRoutes