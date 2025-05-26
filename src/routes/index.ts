import { Router } from "express";
import authRoutes from "./auth";
import restaurantRoutes from "./restaurant";
import { hotelRoutes } from "./hotel";
import { roleMenuPermissionRoutes } from "./role-permission";
import userRoutes from "./user";
import reviewRoutes from "./review";
import { ImageRoutes } from "./image";
import { bookingRoute } from "./booking";
import notificationRoutes from "./notification";


const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use('/restaurants', restaurantRoutes)
rootRouter.use('/hotels', hotelRoutes)
rootRouter.use('/role-permission', roleMenuPermissionRoutes)
rootRouter.use('/users', userRoutes)
rootRouter.use('/reviews', reviewRoutes)
rootRouter.use('/images', ImageRoutes)
rootRouter.use('/bookings', bookingRoute)
rootRouter.use('/notifications', notificationRoutes)

export default rootRouter
