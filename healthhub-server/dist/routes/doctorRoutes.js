"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctorController_1 = require("../controllers/doctorController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/search', doctorController_1.searchDoctors);
router.get('/', doctorController_1.getDoctors);
router.get('/user/:userId', doctorController_1.getDoctorByUserId);
router.get('/specialization/:specialization', doctorController_1.getDoctorsBySpecialization);
router.get('/:id', doctorController_1.getDoctor);
// Protected routes
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('doctor'), doctorController_1.updateDoctor);
exports.default = router;
