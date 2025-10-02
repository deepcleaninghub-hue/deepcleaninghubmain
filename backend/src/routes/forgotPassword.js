const express = require('express');
const { supabase } = require('../config/database');
const emailService = require('../services/emailService');
const crypto = require('crypto');

const router = express.Router();

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Clean expired OTPs (older than 10 minutes)
const cleanExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) { // 10 minutes
      otpStore.delete(email);
    }
  }
};

// @desc    Send forgot password OTP
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const timestamp = Date.now();

    // Store OTP with timestamp
    otpStore.set(email.toLowerCase().trim(), {
      otp,
      timestamp,
      userId: user.id
    });

    // Clean expired OTPs
    cleanExpiredOTPs();

    // Send OTP via email
    try {
      const emailContent = {
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Password Reset Code</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .otp-box { background: white; padding: 30px; margin: 20px 0; border-radius: 10px; text-align: center; }
              .otp-code { font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Code</h1>
                <p>Deep Cleaning Hub</p>
              </div>
              
              <div class="content">
                <h2>Hello ${user.name},</h2>
                <p>You requested to reset your password. Use the verification code below to proceed:</p>
                
                <div class="otp-box">
                  <h3>Your Verification Code</h3>
                  <div class="otp-code">${otp}</div>
                  <p>This code will expire in 10 minutes.</p>
                </div>
                
                <p>If you didn't request this password reset, please ignore this email.</p>
                <p>For security reasons, do not share this code with anyone.</p>
              </div>
              
              <div class="footer">
                <p>Deep Cleaning Hub<br>
                Professional Cleaning Services</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Password Reset Code - Deep Cleaning Hub

Hello ${user.name},

You requested to reset your password. Use the verification code below to proceed:

Your Verification Code: ${otp}

This code will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.

For security reasons, do not share this code with anyone.

Best regards,
Deep Cleaning Hub Team
        `
      };

      const emailResult = await emailService.sendEmail(
        email,
        'Password Reset Code - Deep Cleaning Hub',
        emailContent.html,
        emailContent.text
      );

      if (!emailResult.success) {
        console.error('Failed to send OTP email:', emailResult.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification code. Please try again.'
        });
      }

      console.log(`OTP sent to ${email}: ${otp}`); // Log for development

      res.json({
        success: true,
        message: 'Verification code sent to your email address'
      });

    } catch (emailError) {
      console.error('Email service error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification code. Please try again.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const emailKey = email.toLowerCase().trim();
    const storedData = otpStore.get(emailKey);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Check if OTP is expired (10 minutes)
    const now = Date.now();
    if (now - storedData.timestamp > 10 * 60 * 1000) {
      otpStore.delete(emailKey);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // OTP is valid, mark as verified
    storedData.verified = true;
    otpStore.set(emailKey, storedData);

    res.json({
      success: true,
      message: 'Verification code verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const timestamp = Date.now();

    // Store new OTP
    otpStore.set(email.toLowerCase().trim(), {
      otp,
      timestamp,
      userId: user.id
    });

    // Send new OTP via email
    try {
      const emailContent = {
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>New Password Reset Code</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .otp-box { background: white; padding: 30px; margin: 20px 0; border-radius: 10px; text-align: center; }
              .otp-code { font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Password Reset Code</h1>
                <p>Deep Cleaning Hub</p>
              </div>
              
              <div class="content">
                <h2>Hello ${user.name},</h2>
                <p>Here's your new verification code to reset your password:</p>
                
                <div class="otp-box">
                  <h3>Your New Verification Code</h3>
                  <div class="otp-code">${otp}</div>
                  <p>This code will expire in 10 minutes.</p>
                </div>
                
                <p>If you didn't request this password reset, please ignore this email.</p>
              </div>
              
              <div class="footer">
                <p>Deep Cleaning Hub<br>
                Professional Cleaning Services</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
New Password Reset Code - Deep Cleaning Hub

Hello ${user.name},

Here's your new verification code to reset your password:

Your New Verification Code: ${otp}

This code will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.

Best regards,
Deep Cleaning Hub Team
        `
      };

      const emailResult = await emailService.sendEmail(
        email,
        'New Password Reset Code - Deep Cleaning Hub',
        emailContent.html,
        emailContent.text
      );

      if (!emailResult.success) {
        console.error('Failed to resend OTP email:', emailResult.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to resend verification code. Please try again.'
        });
      }

      console.log(`OTP resent to ${email}: ${otp}`); // Log for development

      res.json({
        success: true,
        message: 'New verification code sent to your email address'
      });

    } catch (emailError) {
      console.error('Email service error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to resend verification code. Please try again.'
      });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required'
      });
    }

    const emailKey = email.toLowerCase().trim();
    const storedData = otpStore.get(emailKey);

    if (!storedData || !storedData.verified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Check if OTP is still valid (10 minutes)
    const now = Date.now();
    if (now - storedData.timestamp > 10 * 60 * 1000) {
      otpStore.delete(emailKey);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Hash the new password
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', storedData.userId);

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update password. Please try again.'
      });
    }

    // Remove OTP from store
    otpStore.delete(emailKey);

    console.log(`Password reset successful for user: ${email}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
