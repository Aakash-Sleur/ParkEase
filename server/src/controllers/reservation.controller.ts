import { Request, Response } from "express";
import mongoose from "mongoose"; // Import mongoose to use ObjectId
import Slot, { TimeSlot } from "../models/slot.model"; // Assuming this is your slot model
import Reservation from "../models/reservation.model";
import { AuthenticatedRequest } from "../middleware/jwt";
import Parking from "../models/parking.model";

export async function createReservation(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req; // User ID from the JWT middleware
    const { slotId, parkingId, start, end, price } = req.body;

    if (!slotId || !parkingId || !start || !end || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const startD = new Date(start);
    const endD = new Date(end);

    if (isNaN(startD.getTime()) || isNaN(endD.getTime())) {
      return res.status(400).json({ message: "Invalid start or end date" });
    }

    if (startD >= endD) {
      return res
        .status(400)
        .json({ message: "Start time must be before end time" });
    }

    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a valid number greater than zero" });
    }

    // Find the slot by its ID
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Check if there's already a reserved time overlapping
    const overlappingSlot = slot.timing.find(
      (ts) => startD < ts.end && endD > ts.start && ts.isReserved
    );

    if (overlappingSlot) {
      return res
        .status(400)
        .json({ message: "This time slot is already reserved" });
    }

    const newTimeSlot = {
      start: startD,
      end: endD,
      isReserved: true,
      reservedBy: id,
    };

    slot.timing.push(newTimeSlot);
    await slot.save();

    // Convert the string user ID to ObjectId
    const userId = new mongoose.Types.ObjectId(id as string);

    // Create the reservation entry in the reservations collection
    const newReservation = await Reservation.create({
      user: userId,
      slot: slotId,
      parking: parkingId,
      reservationTime: {
        start,
        end,
      },
      price: Number(price),
      status: "upcoming",
    });

    if (!newReservation) {
      return res.status(400).json({ message: "Failed to create reservation" });
    }

    return res.status(201).json({
      message: "Reservation created successfully",
      reservation: newReservation,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

export async function cancelReservation(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req;
    const { reservationId } = req.params;

    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status === "completed") {
      return res
        .status(400)
        .json({ message: "This reservation has already been completed" });
    }

    if (reservation.user.toString() !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const slot = await Slot.findById(reservation.slot);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // get the timing and unreserve the timing and reservedBy to null
    const timeSlotIndex = slot.timing.findIndex(
      (ts) =>
        new Date(ts.start).getTime() ===
          new Date(reservation.reservationTime.start).getTime() &&
        new Date(ts.end).getTime() ===
          new Date(reservation.reservationTime.end).getTime()
    );

    if (timeSlotIndex !== -1) {
      slot.timing[timeSlotIndex].isReserved = false;
      slot.timing[timeSlotIndex].reservedBy = null;
    }

    // Update the slot in the database
    await slot.save();

    // Update the reservation status to "cancelled"
    await Reservation.findByIdAndUpdate(
      reservationId,
      { status: "cancelled" },
      { new: true }
    );

    return res.status(200).json({ message: "Reservation cancelled" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

export async function getReservationsByUser(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { id } = req;

    if (!id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const reservations = await Reservation.find({ user: id })
      .populate({
        path: "parking",
        model: Parking,
      })
      .populate({
        path: "slot",
        model: Slot,
      });
    return res.status(200).json(reservations);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

export async function getReservationById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id)
      .populate("slot")
      .populate("parking");
    return res.status(200).json(reservation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}
