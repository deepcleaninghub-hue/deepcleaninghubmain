const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');

const router = express.Router();

<<<<<<< HEAD
// @desc    Mobile user sign up (alias for signup)
// @route   POST /api/mobile-auth/register
// @access  Public
router.post('/register', [
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required')
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
    const { email, password, firstName, lastName, phone } = req.body;
=======
// Debug endpoint to test what's being received
router.post('/debug', (req, res) => {
  console.log('=== DEBUG ENDPOINT ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  res.json({
    success: true,
    received: req.body,
    headers: req.headers
  });
});

// @desc    Mobile user sign up (alias for signup)
// @route   POST /api/mobile-auth/register
// @access  Public
router.post('/register', async (req, res) => {
  console.log('=== REGISTER REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  try {
    const { email, password, first_name, last_name, phone, address } = req.body;
>>>>>>> refs/remotes/origin/main

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('mobile_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create mobile user
    const { data: user, error } = await supabase
      .from('mobile_users')
      .insert([{
        email,
        password: hashedPassword,
<<<<<<< HEAD
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
=======
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        address: address,
>>>>>>> refs/remotes/origin/main
        email_verified: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
<<<<<<< HEAD
      .select('id, email, first_name, last_name, phone, email_verified, is_active, created_at')
=======
      .select('id, email, first_name, last_name, phone, address, email_verified, is_active, created_at')
>>>>>>> refs/remotes/origin/main
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error creating user account'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'mobile' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
<<<<<<< HEAD
=======
          address: user.address,
>>>>>>> refs/remotes/origin/main
          is_verified: user.is_verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Mobile user sign up
// @route   POST /api/mobile-auth/signup
// @access  Public
router.post('/signup', [
<<<<<<< HEAD
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required')
  ]
=======
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('address').notEmpty().withMessage('Address is required')
>>>>>>> refs/remotes/origin/main
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  try {
<<<<<<< HEAD
    const { email, password, firstName, lastName, phone } = req.body;
=======
    const { email, password, first_name, last_name, phone, address } = req.body;
>>>>>>> refs/remotes/origin/main

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('mobile_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create mobile user
    const { data: user, error } = await supabase
      .from('mobile_users')
      .insert([{
        email,
        password: hashedPassword,
<<<<<<< HEAD
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
=======
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        address: address,
>>>>>>> refs/remotes/origin/main
        email_verified: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
<<<<<<< HEAD
      .select('id, email, first_name, last_name, phone, email_verified, is_active, created_at')
=======
      .select('id, email, first_name, last_name, phone, address, email_verified, is_active, created_at')
>>>>>>> refs/remotes/origin/main
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error creating user account'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'mobile' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
<<<<<<< HEAD
=======
          address: user.address,
>>>>>>> refs/remotes/origin/main
          is_verified: user.is_verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Mobile user sign in (alias for signin)
// @route   POST /api/mobile-auth/login
// @access  Public
router.post('/login', [
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
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
    const { email, password } = req.body;

    // Check if user exists
    const { data: user, error } = await supabase
      .from('mobile_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'mobile' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last login
    await supabase
      .from('mobile_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    res.json({
      success: true,
      message: 'Sign in successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
<<<<<<< HEAD
=======
          address: user.address,
>>>>>>> refs/remotes/origin/main
          is_verified: user.is_verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Mobile user sign in
// @route   POST /api/mobile-auth/signin
// @access  Public
router.post('/signin', [
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
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
    const { email, password } = req.body;

    // Check if user exists
    const { data: user, error } = await supabase
      .from('mobile_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'mobile' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last login
    await supabase
      .from('mobile_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    res.json({
      success: true,
      message: 'Sign in successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
<<<<<<< HEAD
=======
          address: user.address,
>>>>>>> refs/remotes/origin/main
          is_verified: user.is_verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get mobile user profile
// @route   GET /api/mobile-auth/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'mobile') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type'
      });
    }

    // Get user data
    const { data: user, error } = await supabase
      .from('mobile_users')
      .select('id, email, first_name, last_name, phone, is_verified, created_at, last_login')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update mobile user profile
// @route   PUT /api/mobile-auth/profile
// @access  Private
router.put('/profile', [
  [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
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
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'mobile') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type'
      });
    }

<<<<<<< HEAD
    const { firstName, lastName, phone } = req.body;
=======
    const { first_name, last_name, phone } = req.body;
>>>>>>> refs/remotes/origin/main
    const updateData = {
      updated_at: new Date().toISOString()
    };

<<<<<<< HEAD
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
=======
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
>>>>>>> refs/remotes/origin/main
    if (phone !== undefined) updateData.phone = phone;

    // Update user data
    const { data: user, error } = await supabase
      .from('mobile_users')
      .update(updateData)
      .eq('id', decoded.id)
      .select('id, email, first_name, last_name, phone, is_verified, created_at, last_login')
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error updating profile'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Change mobile user password
// @route   PUT /api/mobile-auth/change-password
// @access  Private
router.put('/change-password', [
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'mobile') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type'
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const { data: user, error: userError } = await supabase
      .from('mobile_users')
      .select('password')
      .eq('id', decoded.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    const { error } = await supabase
      .from('mobile_users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', decoded.id);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error updating password'
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
