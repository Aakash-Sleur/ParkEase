import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import parkingRoutes from "./parking.routes";
import uploadRoutes from "./upload.routes";
import reservationsRoutes from "./reservations.routes";

const router = Router();

export default (): Router => {
  authRoutes(router);
  userRoutes(router);
  parkingRoutes(router);
  uploadRoutes(router);
  reservationsRoutes(router);
  return router;
};
