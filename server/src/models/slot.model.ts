import mongoose, { Schema } from "mongoose";

const timeSlotSchema = new Schema({
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  isReserved: {
    type: Boolean,
    default: false,
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

const slotSchema = new Schema(
  {
    position: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    timing: [timeSlotSchema], // Array of time slots
  },
  {
    timestamps: true,
  }
);

const Slot = mongoose.model("Slot", slotSchema);
export const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);

export default Slot;
