import express from 'express';
import {
  getDoctors,
  getDoctor,
  getDoctorByUserId,
  getDoctorsBySpecialization,
  updateDoctor,
  searchDoctors,
} from '../controllers/doctorController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/search', searchDoctors);
router.get('/', getDoctors);
router.get('/user/:userId', getDoctorByUserId);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/:id', getDoctor);

// Protected routes
router.put('/:id', protect, authorize('doctor'), updateDoctor);

export default router;