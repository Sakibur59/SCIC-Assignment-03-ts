import express from 'express';
import {
  getDoctors,
  getDoctor,
  getDoctorsBySpecialization,
  updateDoctor,
} from '../controllers/doctorController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/:id', getDoctor);
router.put('/:id', protect, authorize('doctor'), updateDoctor);

export default router;