import mongoose, { Schema } from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to User collection
      required: true,
    },
    slot: {
      type: Schema.Types.ObjectId,
      ref: "Slot", // Reference to Slot collection
      required: true,
    },
    parking: {
      type: Schema.Types.ObjectId,
      ref: "Parking", // Reference to Parking collection
      required: true,
    },
    reservationTime: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["active", "completed", "upcoming", "cancelled"],
      default: "upcoming",
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
