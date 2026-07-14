"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appointmentController_1 = require("../controllers/appointmentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Patient only
router.post("/", auth_1.protect, (0, auth_1.authorize)("patient"), appointmentController_1.createAppointment);
// Patient/Doctor/Admin can view their appointments
router.get("/my", auth_1.protect, appointmentController_1.getMyAppointments);
// Patient/Doctor/Admin can view specific appointment
router.get("/:id", auth_1.protect, appointmentController_1.getAppointment);
// ✅ Patient/Doctor can update appointment (reschedule)
router.put("/:id", auth_1.protect, (0, auth_1.authorize)("patient", "doctor"), appointmentController_1.updateAppointment);
// ✅ Patient/Doctor can update status (confirm/complete/cancel)
router.put("/:id/status", auth_1.protect, (0, auth_1.authorize)("patient", "doctor"), appointmentController_1.updateAppointmentStatus);
// ✅ Patient/Doctor can cancel
router.put("/:id/cancel", auth_1.protect, (0, auth_1.authorize)("patient", "doctor"), appointmentController_1.cancelAppointment);
exports.default = router;
