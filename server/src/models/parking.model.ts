import mongoose, { Schema } from "mongoose";

const parkingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    hours: {
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
    },
    ratePerHour: {
      type: Number,
      required: true,
    },
    totalSpots: {
      type: Number,
      required: true,
    },
    availableSpots: {
      type: Number,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    slots: [
      {
        type: Schema.Types.ObjectId,
        ref: "Slot",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Parking = mongoose.model("Parking", parkingSchema);

export default Parking;
