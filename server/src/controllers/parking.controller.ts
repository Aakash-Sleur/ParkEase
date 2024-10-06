import { Request, Response } from "express";
import Parking from "../models/parking.model";
import Slot from "../models/slot.model";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middleware/jwt";
import Reservation from "../models/reservation.model";
import Review from "../models/review.model";

interface TimeSlot {
  start: string; // Changed to string to store time (e.g., "14:00")
  end: string; // Changed to string to store time (e.g., "15:00")
  isReserved: boolean;
  reservedBy: mongoose.Types.ObjectId | null;
}

export async function createLocation(req: Request, res: Response) {
  try {
    const {
      name,
      address,
      banner,
      description,
      hours,
      ratePerHour,
      totalSpots,
      availableSpots,
      tags,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !address ||
      !banner ||
      !description ||
      !hours ||
      !ratePerHour ||
      !totalSpots ||
      !availableSpots ||
      !tags
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const slotPromises = [];

    // Create slots for each parking spot
    for (let i = 0; i < totalSpots; i++) {
      const newSlot = new Slot({
        position: i + 1,
        timing: [],
      });

      slotPromises.push(newSlot.save());
    }

    const slots = await Promise.all(slotPromises);
    const slotIds = slots.map((slot) => slot._id);

    const newParking = await Parking.create({
      name,
      address,
      banner,
      description,
      hours,
      ratePerHour,
      totalSpots,
      availableSpots,
      tags,
      slots: slotIds,
    });

    return res.status(201).json(newParking);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getParkingById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const parking = await Parking.findById(id).populate({
      path: "slots",
      model: Slot,
    });
    return res.status(200).json(parking);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getParkings(req: Request, res: Response) {
  try {
    const parkings = await Parking.find();
    return res.status(200).json(parkings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateParking(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      banner,
      description,
      hours,
      ratePerHour,
      totalSpots,
      availableSpots,
      tags,
    } = req.body;

    const parking = await Parking.findByIdAndUpdate(
      id,
      {
        name,
        address,
        banner,
        description,
        hours,
        ratePerHour,
        totalSpots,
        availableSpots,
        tags,
      },
      { new: true }
    );

    return res.status(200).json(parking);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteParking(req: AuthenticatedRequest, res: Response) {
  try {
    const { isAdmin } = req;
    const { id } = req.params;

    console.log(isAdmin);

    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const parking = await Parking.findById(id);

    if (!parking) {
      return res.status(404).json({ message: "Parking not found" });
    }

    const parkingReservations = await Reservation.find({ parking: id });

    // Start a transaction (if your database supports it)
    // await YourDatabase.startTransaction();

    try {
      for (const reservation of parkingReservations) {
        await Reservation.findByIdAndDelete(reservation._id);
      }

      await Parking.findByIdAndDelete(id);

      // Commit the transaction (if a transaction was started)
      // await YourDatabase.commitTransaction();

      return res.status(200).json({ message: "Parking deleted successfully" });
    } catch (error) {
      // Rollback the transaction in case of an error (if a transaction was started)
      // await YourDatabase.rollbackTransaction();

      console.error("Error deleting parking lot:", error);
      return res.status(500).json({ message: "Failed to delete parking lot" });
    }
  } catch (error) {
    console.error("Error deleting parking lot:", error);
    return res.status(500).json({ message: "Failed to delete parking lot" });
  }
}

export async function addReview(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req;
    const { comment, rating } = req.body;
    const { parkingId } = req.params;

    const newReview = await Review.create({
      comment,
      rating,
      user: id,
      parking: parkingId,
    });

    const parking = await Parking.findById(parkingId);

    if (!parking) {
      return res.status(404).json({ message: "Parking not found" });
    }

    const totalReviews = await Review.countDocuments({ parking: parkingId });
    const totalRating = await Review.aggregate([
      {
        $match: { parking: new mongoose.Types.ObjectId(parkingId) },
      },
      {
        $group: {
          _id: null,
          totalRating: { $sum: "$rating" },
        },
      },
    ]);

    const averageRating =
      totalRating.length > 0 ? totalRating[0].totalRating / totalReviews : 0;

    await Parking.findByIdAndUpdate(parkingId, { rating: averageRating });

    return res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" + error });
  }
}

export async function getReviewsByParkingId(req: Request, res: Response) {
  try {
    const { parkingId } = req.params;
    const reviews = await Review.find({ parking: parkingId })
      .populate("user")
      .populate("parking");
    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
