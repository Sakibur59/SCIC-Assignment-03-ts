"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.getGoogleAuthURL = exports.googleLogin = void 0;
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = require("../models/UserModel");
const PatientModel_1 = require("../models/PatientModel");
const DoctorModel_1 = require("../models/DoctorModel");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
const generateToken = (id, role) => {
    const secret = process.env.JWT_SECRET || 'default_secret';
    return jsonwebtoken_1.default.sign({ id, role }, secret, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};
const googleLogin = async (req, res) => {
    try {
        const { credential, id_token, userInfo, role } = req.body;
        console.log('📥 Google login request received');
        let payload = null;
        if (id_token) {
            try {
                console.log('🔐 Verifying id_token...');
                const ticket = await client.verifyIdToken({
                    idToken: id_token,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
                console.log('✅ id_token verified successfully');
            }
            catch (error) {
                console.log('❌ id_token verification failed:', error);
            }
        }
        // Fallback: use userInfo from frontend
        if (!payload && userInfo) {
            console.log('📱 Using userInfo from frontend as fallback');
            payload = {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                sub: userInfo.sub || userInfo.id || 'google_' + Date.now(),
            };
        }
        // Final fallback: use credential
        if (!payload && credential) {
            console.log('🔄 Trying to get user info from credential...');
            try {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${credential}` },
                });
                const data = await userInfoResponse.json();
                payload = {
                    email: data.email,
                    name: data.name,
                    picture: data.picture,
                    sub: data.sub || data.id || 'google_' + Date.now(),
                };
            }
            catch (error) {
                console.error('❌ Failed to get user info from credential:', error);
            }
        }
        if (!payload || !payload.email) {
            console.error('❌ Could not get user email from any source');
            res.status(400).json({
                success: false,
                message: 'Could not get user information from Google',
            });
            return;
        }
        const { email, name, picture, sub } = payload;
        let user = await UserModel_1.UserModel.findByEmail(email);
        if (!user) {
            const userRole = role || 'patient';
            user = await UserModel_1.UserModel.create({
                name: name || 'Google User',
                email: email,
                password: sub + Math.random().toString(36).slice(-8),
                role: userRole,
                profilePicture: picture || '',
                phone: '',
                address: '',
            });
            if (userRole === 'patient') {
                await PatientModel_1.PatientModel.create({
                    userId: user._id,
                    dateOfBirth: new Date('2000-01-01'),
                });
            }
            else if (userRole === 'doctor') {
                await DoctorModel_1.DoctorModel.create({
                    userId: user._id,
                    specialization: 'General Medicine',
                    experience: 0,
                    education: ['MBBS'],
                    consultationFee: 500,
                    availability: [],
                });
            }
        }
        const token = generateToken(user._id.toString(), user.role);
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            success: true,
            data: {
                token,
                user: userWithoutPassword,
            },
        });
    }
    catch (error) {
        console.error('❌ Google login error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Google login failed',
        });
    }
};
exports.googleLogin = googleLogin;
const getGoogleAuthURL = async (req, res) => {
    try {
        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'openid',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            prompt: 'consent',
        });
        res.status(200).json({
            success: true,
            url: url,
        });
    }
    catch (error) {
        console.error('Google auth URL error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to generate auth URL',
        });
    }
};
exports.getGoogleAuthURL = getGoogleAuthURL;
const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            res.status(400).json({
                success: false,
                message: 'Authorization code is required',
            });
            return;
        }
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);
        const userInfoResponse = await client.request({
            url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
        });
        const googleUser = userInfoResponse.data;
        let user = await UserModel_1.UserModel.findByEmail(googleUser.email);
        if (!user) {
            user = await UserModel_1.UserModel.create({
                name: googleUser.name || googleUser.given_name || 'Google User',
                email: googleUser.email,
                password: Math.random().toString(36).slice(-8),
                role: 'patient',
                profilePicture: googleUser.picture || '',
                phone: '',
                address: '',
            });
            await PatientModel_1.PatientModel.create({
                userId: user._id,
                dateOfBirth: new Date('2000-01-01'),
            });
        }
        const token = generateToken(user._id.toString(), user.role);
        const { password: _, ...userWithoutPassword } = user;
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
    }
    catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message || 'Google login failed')}`);
    }
};
exports.googleCallback = googleCallback;
