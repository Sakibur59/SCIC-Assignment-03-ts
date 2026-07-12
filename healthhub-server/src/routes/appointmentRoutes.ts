import express from "express";
import {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getAppointment,
  updateAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

// Patient only
router.post("/", protect, authorize("patient"), createAppointment);

// Patient/Doctor/Admin can view their appointments
router.get("/my", protect, getMyAppointments);

// Patient/Doctor/Admin can view specific appointment
router.get("/:id", protect, getAppointment);

// ✅ Patient/Doctor can update appointment (reschedule)
router.put("/:id", protect, authorize("patient", "doctor"), updateAppointment);

// ✅ Patient/Doctor can update status (confirm/complete/cancel)
router.put(
  "/:id/status",
  protect,
  authorize("patient", "doctor"),
  updateAppointmentStatus,
);

// ✅ Patient/Doctor can cancel
router.put(
  "/:id/cancel",
  protect,
  authorize("patient", "doctor"),
  cancelAppointment,
);

export default router;
