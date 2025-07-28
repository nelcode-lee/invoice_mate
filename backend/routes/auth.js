const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
// Email service for verification
const { generateVerificationToken, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(1).max(100).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, name } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // For development: Auto-verify email
    // In production, you would enable email verification
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Development mode: Auto-verify email
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          emailVerified: true,
          emailToken: null,
          emailTokenExpires: null
        },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          createdAt: true
        }
      });
      
      res.status(201).json({
        message: 'Registration successful! Email auto-verified in development mode.',
        user,
        emailVerificationSent: false,
        developmentMode: true
      });
    } else {
      // Production mode: Send verification email
      const verificationToken = generateVerificationToken();
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          emailVerified: false,
          emailToken: verificationToken,
          emailTokenExpires: tokenExpires
        },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          createdAt: true
        }
      });
      
      // Send verification email
      const emailSent = await sendVerificationEmail(email, name, verificationToken);
      
      res.status(201).json({
        message: emailSent ? 'Registration successful! Please check your email to verify your account.' : 'Registration successful! Please check your email to verify your account.',
        user,
        emailVerificationSent: emailSent
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find user by token
    const user = await prisma.user.findUnique({
      where: { emailToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    // Check if token is expired
    if (user.emailTokenExpires && new Date() > user.emailTokenExpires) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailToken: null,
        emailTokenExpires: null
      }
    });

    res.json({ 
      message: 'Email verified successfully! You can now login to your account.' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailToken: verificationToken,
        emailTokenExpires: tokenExpires
      }
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, user.name, verificationToken);
    
    if (emailSent) {
      res.json({ message: 'Verification email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ 
        error: 'Please verify your email address before logging in',
        needsVerification: true 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // In development mode, auto-verify the user
    if (process.env.NODE_ENV === 'development') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailToken: null,
          emailTokenExpires: null
        }
      });

      return res.json({
        message: 'Email auto-verified in development mode',
        developmentMode: true
      });
    }

    // In production, send verification email
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailToken: verificationToken,
        emailTokenExpires: tokenExpires
      }
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.json({
      message: 'Verification email sent successfully',
      developmentMode: false
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router; 