import { Router } from "express";
import {
  getParkings,
  getParkingById,
  createLocation,
  updateParking,
  deleteParking,
  getReviewsByParkingId,
  addReview,
} from "../controllers/parking.controller";
import { verifyToken } from "../middleware/jwt";

const router = Router();

export default (mainRouter: Router) => {
  router.get("/", getParkings);
  router.get("/:id", getParkingById);
  router.get("/:parkingId/reviews", getReviewsByParkingId);
  router.post(
    "/:parkingId/reviews",
    //@ts-ignore
    verifyToken,
    addReview
  );
  router.post("/", createLocation);
  router.put("/:id", updateParking);
  router.delete(
    "/:id",
    //@ts-ignore
    verifyToken,
    deleteParking
  );
  mainRouter.use("/parking", router);
};
