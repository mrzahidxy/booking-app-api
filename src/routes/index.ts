import { Router } from "express";
import authRoutes from "./auth";
import restaurantRoutes from "./restaurant";
import { hotelRoutes } from "./hotel";


const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use('/restaurants', restaurantRoutes)
rootRouter.use('/hotels', hotelRoutes)

export default rootRouter
