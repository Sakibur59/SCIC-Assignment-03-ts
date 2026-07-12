import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel';
import { PatientModel } from '../models/PatientModel';
import { DoctorModel } from '../models/DoctorModel';
import dotenv from 'dotenv';

dotenv.config();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ✅ Google Login with Token (Direct - Updated)
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { credential, id_token, userInfo, role } = req.body;

    console.log('📥 Google login request received');
    console.log('🔑 Has credential:', !!credential);
    console.log('🔑 Has id_token:', !!id_token);
    console.log('👤 User info:', userInfo);

    // ✅ Try to verify with id_token first, then fallback to credential
    let payload: any = null;

    if (id_token) {
      try {
        console.log('🔐 Verifying id_token...');
        const ticket = await client.verifyIdToken({
          idToken: id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
        console.log('✅ id_token verified successfully');
      } catch (error) {
        console.log('❌ id_token verification failed:', error);
      }
    }

    // ✅ Fallback: use userInfo from frontend
    if (!payload && userInfo) {
      console.log('📱 Using userInfo from frontend as fallback');
      payload = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub || userInfo.id || 'google_' + Date.now(),
      };
    }

    // ✅ Final fallback: use credential to get user info
    if (!payload && credential) {
      console.log('🔄 Trying to get user info from credential...');
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${credential}`,
          },
        });
        const data = await userInfoResponse.json();
        console.log('👤 User info from credential:', data);
        payload = {
          email: data.email,
          name: data.name,
          picture: data.picture,
          sub: data.sub || data.id || 'google_' + Date.now(),
        };
      } catch (error) {
        console.error('❌ Failed to get user info from credential:', error);
      }
    }

    if (!payload || !payload.email) {
      console.error('❌ Could not get user email from any source');
      return res.status(400).json({
        success: false,
        message: 'Could not get user information from Google',
      });
    }

    const { email, name, picture, sub } = payload;

    console.log('👤 User data:', { email, name, picture });

    // ✅ Check if user exists
    let user = await UserModel.findByEmail(email);

    if (!user) {
      // ✅ Create new user with selected role
      const userRole = role || 'patient';
      user = await UserModel.create({
        name: name || 'Google User',
        email: email,
        password: sub + Math.random().toString(36).slice(-8),
        role: userRole,
        profilePicture: picture || '',
        phone: '',
        address: '',
      });

      // ✅ Create role-specific profile
      if (userRole === 'patient') {
        await PatientModel.create({
          userId: user._id!,
          dateOfBirth: new Date('2000-01-01'),
        });
      } else if (userRole === 'doctor') {
        await DoctorModel.create({
          userId: user._id!,
          specialization: 'General Medicine',
          experience: 0,
          education: ['MBBS'],
          consultationFee: 500,
          availability: [],
        });
      }
    }

    // ✅ Generate JWT
    const token = generateToken(user._id!.toString(), user.role);

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error: any) {
    console.error('❌ Google login error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Google login failed',
    });
  }
};

// ✅ Google Auth URL
export const getGoogleAuthURL = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Google auth URL error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate auth URL',
    });
  }
};

// ✅ Google Callback
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required',
      });
    }

    const { tokens } = await client.getToken(code as string);
    client.setCredentials(tokens);

    const userInfoResponse = await client.request({
      url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
    });

    const googleUser = userInfoResponse.data;

    let user = await UserModel.findByEmail(googleUser.email);

    if (!user) {
      user = await UserModel.create({
        name: googleUser.name || googleUser.given_name || 'Google User',
        email: googleUser.email,
        password: Math.random().toString(36).slice(-8),
        role: 'patient',
        profilePicture: googleUser.picture || '',
        phone: '',
        address: '',
      });

      await PatientModel.create({
        userId: user._id!,
        dateOfBirth: new Date('2000-01-01'),
      });
    }

    const token = generateToken(user._id!.toString(), user.role);

    const { password: _, ...userWithoutPassword } = user;

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/google/callback?token=${token}&user=${encodeURIComponent(
        JSON.stringify(userWithoutPassword)
      )}`
    );
  } catch (error: any) {
    console.error('Google callback error:', error);
    res.redirect(
      `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(
        error.message || 'Google login failed'
      )}`
    );
  }
};