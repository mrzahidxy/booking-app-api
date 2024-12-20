import { Router } from "express";
import authRoutes from "./auth";
import restaurantRoutes from "./restaurant";
import { hotelRoutes } from "./hotel";
import { roleMenuPermissionRoutes } from "./role-permission";
import userRoutes from "./user";


const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use('/restaurants', restaurantRoutes)
rootRouter.use('/hotels', hotelRoutes)
rootRouter.use('/role-permission', roleMenuPermissionRoutes)
rootRouter.use('/users', userRoutes)

export default rootRouter
