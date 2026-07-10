import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/my', protect, getMyAppointments);
router.put('/:id/status', protect, updateAppointmentStatus);
router.put('/:id/cancel', protect, cancelAppointment);

export default router;