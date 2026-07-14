"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleAuthController_1 = require("../controllers/googleAuthController");
const router = express_1.default.Router();
router.get('/auth-url', googleAuthController_1.getGoogleAuthURL);
router.get('/callback', googleAuthController_1.googleCallback);
router.post('/login', googleAuthController_1.googleLogin);
exports.default = router;
