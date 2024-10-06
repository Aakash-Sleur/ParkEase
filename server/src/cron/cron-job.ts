import cron from "node-cron";
import Reservation from "../models/reservation.model";
import Slot from "../models/slot.model";

// Helper function to get the current UTC time in milliseconds
const getCurrentUTCTime = (): number => {
  return new Date().getTime(); // Get current UTC time as timestamp
};

// Helper function to convert IST times to UTC
const convertISTToUTC = (date: Date): Date => {
  const utcDate = new Date(date.getTime() - 5.5 * 60 * 60 * 1000); // Subtract 5 hours and 30 minutes
  return utcDate;
};

// Cron job to check and update reservation statuses every 30 seconds
cron.schedule("*/15 * * * * *", async () => {
  try {
    const currentTime = getCurrentUTCTime(); // Get current UTC time
    console.log("Current UTC Time:", new Date(currentTime));

    // Fetch all reservations (not just upcoming)
    const allReservations = await Reservation.find();

    // Fetch all slot data in a batch for efficiency
    const slotIds = allReservations.map((r) => r.slot);
    const slots = await Slot.find({ _id: { $in: slotIds } });

    // Create a map for slot lookups
    const slotMap = new Map(slots.map((slot) => [slot._id.toString(), slot]));

    for (const reservation of allReservations) {
      const { start, end } = reservation.reservationTime;

      // Convert reservation start and end times (stored in IST) to UTC for comparison
      const reservationStartTimeUTC = convertISTToUTC(
        new Date(start)
      ).getTime();
      const reservationEndTimeUTC = convertISTToUTC(new Date(end)).getTime();

      // Get the slot associated with the reservation from the slotMap
      const slotData = slotMap.get(reservation.slot.toString());

      if (!slotData) {
        console.error(`Slot not found for reservation: ${reservation._id}`);
        continue;
      }

      // If current time is between the start and end time of the reservation
      if (
        currentTime >= reservationStartTimeUTC &&
        currentTime < reservationEndTimeUTC
      ) {
        if (reservation.status === "upcoming") {
          reservation.status = "active"; // Mark reservation as active
        }

        // Mark the slot as unavailable (reserved)
        if (slotData.isAvailable) {
          slotData.isAvailable = false;
        }

        // Mark the specific timeslot as reserved
        let slotModified = false; // Track if slot timing is modified
        for (const timeSlot of slotData.timing) {
          const timeSlotStartTimeUTC = convertISTToUTC(
            new Date(timeSlot.start)
          ).getTime();
          const timeSlotEndTimeUTC = convertISTToUTC(
            new Date(timeSlot.end)
          ).getTime();

          if (
            currentTime >= timeSlotStartTimeUTC &&
            currentTime < timeSlotEndTimeUTC
          ) {
            timeSlot.isReserved = true;
            timeSlot.reservedBy = reservation.user;
            slotModified = true;
          }
        }

        // Save slot if it was modified
        if (slotModified) {
          await slotData.save();
        }

        // Save the updated reservation status
        await reservation.save();
      }

      // If reservation is active and its end time has passed, mark it as completed
      if (
        reservation.status === "active" &&
        currentTime > reservationEndTimeUTC
      ) {
        reservation.status = "completed"; // Mark reservation as completed

        // Mark the slot as available again
        if (!slotData.isAvailable) {
          slotData.isAvailable = true;
        }

        // Unreserve the specific timeslot
        let slotModified = false; // Track if slot timing is modified
        for (const timeSlot of slotData.timing) {
          const timeSlotEndTimeUTC = convertISTToUTC(
            new Date(timeSlot.end)
          ).getTime();

          if (currentTime >= timeSlotEndTimeUTC && timeSlot.isReserved) {
            timeSlot.isReserved = false;
            timeSlot.reservedBy = null;
            slotModified = true;
          }
        }

        // Save slot if it was modified
        if (slotModified) {
          await slotData.save();
        }

        // Save the updated reservation status
        await reservation.save();
      }
    }

    console.log("Reservation and slot statuses updated at", new Date());
  } catch (error) {
    console.error("Error in reservation cron job:", error);
  }
});
