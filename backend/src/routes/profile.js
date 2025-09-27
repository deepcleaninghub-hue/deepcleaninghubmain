const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Middleware to verify JWT token and get user
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token and get user from mobile_users table
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from mobile_users table
    const { data: user, error } = await supabase
      .from('mobile_users')
      .select('id, email, first_name, last_name, phone, address, city, state, postal_code, country, date_of_birth, gender, profile_completion_percentage, is_active')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Token verification failed' });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    // Calculate profile completion percentage
    const profileFields = [
      'first_name', 'last_name', 'email', 'phone', 
      'address', 'city', 'state', 'postal_code', 
      'date_of_birth', 'gender'
    ];
    
    let completedFields = 0;
    profileFields.forEach(field => {
      if (req.user[field] && req.user[field] !== '') {
        completedFields++;
      }
    });
    
    const completionPercentage = Math.round((completedFields / profileFields.length) * 100);

    // Update profile completion percentage in database
    await supabase
      .from('mobile_users')
      .update({ 
        profile_completion_percentage: completionPercentage,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id);

    const profileData = {
      ...req.user,
      profile_completion_percentage: completionPercentage
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
router.put('/', [
  verifyToken,
  [
    body('first_name').optional().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('last_name').optional().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
    body('address').optional().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
    body('city').optional().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
    body('state').optional().isLength({ min: 2 }).withMessage('State must be at least 2 characters'),
    body('postal_code').optional().isLength({ min: 3 }).withMessage('Postal code must be at least 3 characters'),
    body('country').optional().isLength({ min: 2 }).withMessage('Country must be at least 2 characters'),
    body('date_of_birth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
    body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender value')
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  try {
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.is_active;
    delete updateData.email_verified;
    delete updateData.last_login;
    delete updateData.profile_completion_percentage;

    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== req.user.email) {
      const { data: existingUser, error: emailError } = await supabase
        .from('mobile_users')
        .select('id')
        .eq('email', updateData.email)
        .neq('id', req.user.id)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from('mobile_users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, email, first_name, last_name, phone, address, city, state, postal_code, country, date_of_birth, gender, profile_completion_percentage, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }

    // Calculate new profile completion percentage
    const profileFields = [
      'first_name', 'last_name', 'email', 'phone', 
      'address', 'city', 'state', 'postal_code', 
      'date_of_birth', 'gender'
    ];
    
    let completedFields = 0;
    profileFields.forEach(field => {
      if (updatedUser[field] && updatedUser[field] !== '') {
        completedFields++;
      }
    });
    
    const completionPercentage = Math.round((completedFields / profileFields.length) * 100);

    // Update profile completion percentage
    await supabase
      .from('mobile_users')
      .update({ 
        profile_completion_percentage: completionPercentage,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id);

    const profileData = {
      ...updatedUser,
      profile_completion_percentage: completionPercentage
    };

    res.json({
      success: true,
      data: profileData,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
router.put('/password', [
  verifyToken,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  try {
    const { current_password, new_password } = req.body;

    // Get current user with password
    const { data: user, error: userError } = await supabase
      .from('mobile_users')
      .select('password')
      .eq('id', req.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from('mobile_users')
      .update({ 
        password: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update password'
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Upload profile image
// @route   POST /api/profile/upload-image
// @access  Private
router.post('/upload-image', verifyToken, async (req, res) => {
  try {
    // This would typically handle file upload
    // For now, we'll just accept a base64 image URL
    const { image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }

    // Update profile image
    const { error } = await supabase
      .from('mobile_users')
      .update({ 
        profile_image: image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id);

    if (error) {
      console.error('Error updating profile image:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile image'
      });
    }

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      data: { profile_image: image_url }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
