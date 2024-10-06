import express from "express";
import {
  cancelReservation,
  createReservation,
  getReservationById,
  getReservationsByUser,
} from "../controllers/reservation.controller";
import { verifyToken } from "../middleware/jwt";

const router = express.Router();

export default (mainRouter: express.Router) => {
  router.post(
    "/",
    //@ts-ignore
    verifyToken,
    createReservation
  );
  router.get(
    "/user",
    //@ts-ignore
    verifyToken,
    getReservationsByUser
  );
  router.get("/:id", getReservationById);
  router.delete(
    "/:reservationId",
    //@ts-ignore
    verifyToken,
    cancelReservation
  );

  mainRouter.use("/reservation", router);
};
