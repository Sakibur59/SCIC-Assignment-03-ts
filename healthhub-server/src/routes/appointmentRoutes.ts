import express from 'express';
import { protect } from '../middleware/auth';
import { cancelAppointment, createAppointment, getMyAppointments, updateAppointmentStatus } from '../controllers/appointmentController';


const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/my', protect, getMyAppointments);
router.put('/:id/status', protect, updateAppointmentStatus);
router.put('/:id/cancel', protect, cancelAppointment);

export default router;