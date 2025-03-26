import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../exceptions/async-handler";
import { getUserById, getUsers, updateUser } from "../controllers/user";
import checkPermission from "../middleware/check-permission";


const userRoutes: Router =  Router();


userRoutes.get("/",authMiddleware, checkPermission("GET_USER"), asyncHandler(getUsers));
userRoutes.get ("/:id",authMiddleware, checkPermission("GET_USER"), asyncHandler(getUserById));
userRoutes.put ("/:id",authMiddleware, checkPermission("UPDATE_USER"), asyncHandler(updateUser));

export default userRoutes