import express from 'express';
import { getDoctor, getDoctors, getDoctorsBySpecialization, searchDoctors, updateDoctor } from '../controllers/doctorController';
import { authorize, protect } from '../middleware/auth';


const router = express.Router();

router.get('/', getDoctors);
router.get('/search', searchDoctors);
router.get('/specialization/:specialization', getDoctorsBySpecialization);
router.get('/:id', getDoctor);
router.put('/:id', protect, authorize('doctor'), updateDoctor);

export default router;