const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
<<<<<<< HEAD
=======
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const whatsappCloudService = require('../services/whatsappCloudService');
>>>>>>> refs/remotes/origin/main

const router = express.Router();

// @desc    Test database connection
// @route   GET /api/service-bookings/test
// @access  Public
router.get('/test', async (req, res) => {
  try {
    // Test if service_bookings table exists
    const { data: testData, error: testError } = await supabase
      .from('service_bookings')
      .select('count')
      .limit(1);
    
    console.log('Service bookings table test:', { testData, testError });
    
    res.json({
      success: true,
      message: 'Database connection test',
      data: { testData, testError }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: 'Database test failed',
      details: error.message
    });
  }
});

<<<<<<< HEAD
=======
// @desc    Test WhatsApp service
// @route   GET /api/service-bookings/test-whatsapp
// @access  Public
router.get('/test-whatsapp', async (req, res) => {
  try {
    // Try WhatsApp Cloud API first
    const cloudStatus = whatsappCloudService.getStatus();
    
    if (cloudStatus.configured) {
      console.log('📱 Testing WhatsApp Cloud API...');
      const testResult = await whatsappCloudService.testConnection();
      
      return res.json({
        success: testResult.success,
        message: testResult.message || 'WhatsApp Cloud API test completed',
        status: cloudStatus,
        testResult,
        provider: 'whatsapp-cloud-api'
      });
    }

    // Fallback to Twilio if Cloud API not configured
    const twilioStatus = whatsappService.getStatus();
    
    if (!twilioStatus.configured) {
      return res.status(400).json({
        success: false,
        message: 'No WhatsApp service configured (neither Cloud API nor Twilio)',
        status: { cloud: cloudStatus, twilio: twilioStatus }
      });
    }

    console.log('📱 Testing WhatsApp Twilio...');
    const testResult = await whatsappService.testConnection();
    
    res.json({
      success: testResult.success,
      message: testResult.message || 'WhatsApp Twilio test completed',
      status: twilioStatus,
      testResult,
      provider: 'twilio'
    });
  } catch (error) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({
      success: false,
      error: 'WhatsApp test failed',
      details: error.message
    });
  }
});

>>>>>>> refs/remotes/origin/main
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
    console.error('Service booking token verification error:', error);
    res.status(401).json({ error: 'Token verification failed' });
  }
};

// @desc    Get user's service bookings
// @route   GET /api/service-bookings
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
<<<<<<< HEAD
    const { data: bookings, error } = await supabase
=======
    // Get parent bookings (including single-day bookings)
    const { data: parentBookings, error: parentError } = await supabase
>>>>>>> refs/remotes/origin/main
      .from('service_bookings')
      .select(`
        *,
        services (
          id,
          title,
          description,
          category
        )
      `)
      .eq('user_id', req.user.id)
<<<<<<< HEAD
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
=======
      .is('parent_booking_id', null)
      .order('booking_date', { ascending: false });

    if (parentError) {
      console.error('Error fetching parent bookings:', parentError);
>>>>>>> refs/remotes/origin/main
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings'
      });
    }

<<<<<<< HEAD
    res.json({
      success: true,
      data: bookings
=======
    // For each parent booking, get child bookings if it's multi-day
    const bookingsWithChildren = await Promise.all(
      parentBookings.map(async (parentBooking) => {
        if (parentBooking.is_multi_day) {
          const { data: childBookings, error: childError } = await supabase
            .from('service_bookings')
            .select('id, booking_date, booking_time, status')
            .eq('parent_booking_id', parentBooking.id)
            .order('booking_date', { ascending: true });

          if (childError) {
            console.error('Error fetching child bookings:', childError);
            return parentBooking;
          }

          return {
            ...parentBooking,
            allBookingDates: [
              { date: parentBooking.booking_date, time: parentBooking.booking_time, bookingId: parentBooking.id },
              ...childBookings.map(child => ({
                date: child.booking_date,
                time: child.booking_time,
                bookingId: child.id
              }))
            ],
            totalDays: childBookings.length + 1
          };
        }
        return parentBooking;
      })
    );

    res.json({
      success: true,
      data: bookingsWithChildren
>>>>>>> refs/remotes/origin/main
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user's scheduled service bookings
// @route   GET /api/service-bookings/scheduled
// @access  Private
router.get('/scheduled', verifyToken, async (req, res) => {
  try {
<<<<<<< HEAD
    const { data: bookings, error } = await supabase
=======
    // Get all scheduled bookings (both parent and child)
    const { data: allBookings, error: bookingsError } = await supabase
>>>>>>> refs/remotes/origin/main
      .from('service_bookings')
      .select(`
        *,
        services (
          id,
          title,
          description,
          category
        ),
        service_variants (
          id,
          title,
          duration,
          price
        )
      `)
      .eq('user_id', req.user.id)
      .eq('status', 'scheduled')
      .order('booking_date', { ascending: true });

<<<<<<< HEAD
    if (error) {
      console.error('Error fetching scheduled bookings:', error);
=======
    if (bookingsError) {
      console.error('Error fetching scheduled bookings:', bookingsError);
>>>>>>> refs/remotes/origin/main
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch scheduled bookings'
      });
    }

    res.json({
      success: true,
<<<<<<< HEAD
      data: bookings
=======
      data: allBookings
>>>>>>> refs/remotes/origin/main
    });
  } catch (error) {
    console.error('Error fetching scheduled bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user's completed service bookings
// @route   GET /api/service-bookings/completed
// @access  Private
router.get('/completed', verifyToken, async (req, res) => {
  try {
<<<<<<< HEAD
    const { data: bookings, error } = await supabase
=======
    // Get all completed bookings (both parent and child)
    const { data: allBookings, error: bookingsError } = await supabase
>>>>>>> refs/remotes/origin/main
      .from('service_bookings')
      .select(`
        *,
        services (
          id,
          title,
          description,
          category
        ),
        service_variants (
          id,
          title,
          duration,
          price
        )
      `)
      .eq('user_id', req.user.id)
      .eq('status', 'completed')
      .order('booking_date', { ascending: false });

<<<<<<< HEAD
    if (error) {
      console.error('Error fetching completed bookings:', error);
=======
    if (bookingsError) {
      console.error('Error fetching completed bookings:', bookingsError);
>>>>>>> refs/remotes/origin/main
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch completed bookings'
      });
    }

    res.json({
      success: true,
<<<<<<< HEAD
      data: bookings
=======
      data: allBookings
>>>>>>> refs/remotes/origin/main
    });
  } catch (error) {
    console.error('Error fetching completed bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

<<<<<<< HEAD
=======
// @desc    Get booking groups for a user
// @route   GET /api/service-bookings/groups
// @access  Private
router.get('/groups', verifyToken, async (req, res) => {
  try {
    console.log('Fetching booking groups for user:', req.user.id);
    
    const { data: bookingGroups, error } = await supabase
      .from('booking_groups')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    console.log('Booking groups query result:', { bookingGroups, error });

    if (error) {
      console.error('Error fetching booking groups:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch booking groups',
        details: error.message
      });
    }

    res.json({
      success: true,
      data: bookingGroups || []
    });
  } catch (error) {
    console.error('Error fetching booking groups:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message
    });
  }
});

>>>>>>> refs/remotes/origin/main
// @desc    Get single service booking
// @route   GET /api/service-bookings/:id
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { data: booking, error } = await supabase
      .from('service_bookings')
      .select(`
        *,
        services (
          id,
          title,
          description,
          category
        ),
        service_variants (
          id,
          title,
          duration,
          price
        )
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

<<<<<<< HEAD
=======
    // If it's a multi-day booking, get all related dates
    if (booking.is_multi_day) {
      const { data: childBookings, error: childError } = await supabase
        .from('service_bookings')
        .select('id, booking_date, booking_time, status')
        .eq('parent_booking_id', booking.id)
        .order('booking_date', { ascending: true });

      if (!childError && childBookings) {
        booking.allBookingDates = [
          { date: booking.booking_date, time: booking.booking_time, bookingId: booking.id },
          ...childBookings.map(child => ({
            date: child.booking_date,
            time: child.booking_time,
            bookingId: child.id
          }))
        ];
        booking.totalDays = childBookings.length + 1;
      }
    }

>>>>>>> refs/remotes/origin/main
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new service booking
// @route   POST /api/service-bookings
// @access  Private
router.post('/', [
  verifyToken,
  [
    body('service_id').notEmpty().withMessage('Service ID is required'),
<<<<<<< HEAD
    body('booking_date').isISO8601().withMessage('Valid booking date is required'),
    body('booking_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid booking time is required (HH:MM format)'),
=======
    body('booking_date').optional().isISO8601().withMessage('Valid booking date is required'),
    body('booking_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid booking time is required (HH:MM format)'),
    body('booking_dates').optional().isArray().withMessage('Booking dates must be an array'),
    body('booking_dates.*.date').optional().isISO8601().withMessage('Each booking date must be valid'),
    body('booking_dates.*.time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Each booking time must be valid (HH:MM format)'),
>>>>>>> refs/remotes/origin/main
    body('duration_minutes').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('customer_name').notEmpty().withMessage('Customer name is required'),
    body('customer_email').isEmail().withMessage('Valid email is required'),
    body('service_address').notEmpty().withMessage('Service address is required'),
    body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number')
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
    const {
      service_id,
      booking_date,
      booking_time,
<<<<<<< HEAD
=======
      booking_dates,
>>>>>>> refs/remotes/origin/main
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      service_address,
      special_instructions,
      total_amount,
      payment_method = 'pending'
    } = req.body;

<<<<<<< HEAD
=======
    // Determine if this is a multi-day booking
    const isMultiDay = booking_dates && booking_dates.length > 1;
    const datesToProcess = isMultiDay ? booking_dates : [{ date: booking_date, time: booking_time }];

    // Validate that we have at least one date
    if (!isMultiDay && (!booking_date || !booking_time)) {
      return res.status(400).json({
        success: false,
        error: 'Either single booking_date/booking_time or booking_dates array is required'
      });
    }

    if (isMultiDay && (!booking_dates || booking_dates.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'booking_dates array is required for multi-day bookings'
      });
    }

    // If booking_dates is provided but empty, treat as single day booking
    if (booking_dates && booking_dates.length === 0 && (!booking_date || !booking_time)) {
      return res.status(400).json({
        success: false,
        error: 'Either single booking_date/booking_time or non-empty booking_dates array is required'
      });
    }

>>>>>>> refs/remotes/origin/main
    // Check if service variant exists
    console.log('🔍 DEBUG: Looking for service variant with ID:', service_id);
    const { data: serviceVariant, error: serviceError } = await supabase
      .from('service_variants')
      .select(`
        id, title, duration, price,
        services (
          id,
          title,
          category
        )
      `)
      .eq('id', service_id)
      .eq('is_active', true)
      .single();

    console.log('Service variant query result:', { serviceVariant, serviceError });

    if (serviceError || !serviceVariant) {
      console.log('Service variant not found or inactive. Error:', serviceError);
      return res.status(400).json({
        success: false,
        error: 'Service variant not found or inactive'
      });
    }

<<<<<<< HEAD
    // Create booking
    const bookingData = {
      user_id: req.user.id,
      service_id: serviceVariant.services.id, // Use the main service ID
      service_variant_id: service_id, // Use the service variant ID
      booking_date,
      booking_time,
      duration_minutes,
      status: 'scheduled',
      customer_name,
      customer_email,
      customer_phone: customer_phone || req.user.phone,
      service_address,
      special_instructions: special_instructions || null,
      total_amount,
      payment_status: 'pending',
      payment_method,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating booking with data:', bookingData);

    const { data: booking, error: bookingError } = await supabase
      .from('service_bookings')
      .insert([bookingData])
      .select('*')
      .single();

    console.log('Booking creation result:', { booking, bookingError });

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create booking'
      });
    }

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Service booking created successfully'
    });
=======
    // Use new booking group system
    if (isMultiDay) {
      // Create booking group for multi-day bookings
      const { data: groupId, error: groupError } = await supabase
        .rpc('create_booking_group', {
          p_user_id: req.user.id,
          p_group_name: `${serviceVariant.services.title} - ${datesToProcess.length} Days`,
          p_service_id: serviceVariant.services.id,
          p_service_variant_id: service_id,
          p_booking_dates: JSON.stringify(datesToProcess),
          p_duration_minutes: duration_minutes,
          p_customer_name: customer_name,
          p_customer_email: customer_email,
          p_customer_phone: customer_phone || req.user.phone,
          p_service_address: service_address,
          p_special_instructions: special_instructions || null,
          p_total_amount: total_amount,
          p_payment_method: payment_method
        });

      if (groupError) {
        console.error('Error creating booking group:', groupError);
        console.error('Group error details:', JSON.stringify(groupError, null, 2));
        return res.status(500).json({
          success: false,
          error: 'Failed to create booking group',
          details: groupError.message || 'Unknown error'
        });
      }

      // Get the created booking group with all dates
      const { data: bookingGroup, error: fetchError } = await supabase
        .rpc('get_booking_group_with_dates', { p_group_id: groupId });

      if (fetchError) {
        console.error('Error fetching booking group:', fetchError);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch booking group details'
        });
      }

      const responseData = {
        ...bookingGroup[0],
        isMultiDay: true,
        totalDays: datesToProcess.length,
        allBookingDates: bookingGroup[0].booking_dates || []
      };

      // Send confirmation email for multi-day booking
      setImmediate(async () => {
        try {
          console.log('📧 Sending multi-day booking confirmation email...');
          
          const emailData = {
            customerName: customer_name,
            customerEmail: customer_email,
            customerPhone: customer_phone || req.user.phone || '',
            orderId: groupId.slice(-8),
            orderDate: new Date().toLocaleDateString(),
            serviceDate: 'Multiple dates',
            serviceTime: 'Multiple times',
            totalAmount: total_amount,
            services: [{
              name: serviceVariant.title || 'Service',
              price: serviceVariant.price || total_amount
            }],
            address: {
              street_address: service_address.split(',')[0]?.trim() || service_address,
              city: service_address.split(',')[1]?.trim() || '',
              postal_code: service_address.split(',')[2]?.trim() || '',
              country: service_address.split(',')[3]?.trim() || ''
            },
            specialInstructions: special_instructions || '',
            isMultiDay: true,
            allBookingDates: responseData.allBookingDates || []
          };

          const emailResults = await emailService.sendOrderConfirmationEmails(emailData);
          console.log('📧 Multi-day email results:', emailResults);

          // Send WhatsApp notification
          try {
            if (whatsappCloudService.getStatus().configured) {
              const whatsappResults = await whatsappCloudService.sendOrderConfirmationWhatsApp(emailData);
              console.log('📱 WhatsApp Cloud API results:', whatsappResults);
            } else if (whatsappService.getStatus().configured) {
              const whatsappResults = await whatsappService.sendOrderConfirmationWhatsApp(emailData);
              console.log('📱 WhatsApp Twilio results:', whatsappResults);
            }
          } catch (whatsappError) {
            console.error('❌ Failed to send WhatsApp notification:', whatsappError);
          }
        } catch (emailError) {
          console.error('❌ Failed to send confirmation emails:', emailError);
        }
      });

      res.status(201).json({
        success: true,
        data: responseData,
        message: `Multi-day booking group created with ${datesToProcess.length} days`
      });

    } else {
      // Single day booking - create normally
      const bookingData = {
        user_id: req.user.id,
        service_id: serviceVariant.services.id,
        service_variant_id: service_id,
        booking_date: datesToProcess[0].date,
        booking_time: datesToProcess[0].time,
        duration_minutes,
        status: 'scheduled',
        customer_name,
        customer_email,
        customer_phone: customer_phone || req.user.phone,
        service_address,
        special_instructions: special_instructions || null,
        total_amount: total_amount,
        payment_status: 'pending',
        payment_method,
        is_multi_day: false,
        is_group_booking: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdBooking, error: bookingError } = await supabase
        .from('service_bookings')
        .insert([bookingData])
        .select('*')
        .single();

      if (bookingError) {
        console.error('Error creating single booking:', bookingError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create booking'
        });
      }

      const responseData = {
        ...createdBooking,
        isMultiDay: false,
        totalDays: 1,
        allBookingDates: [{
          date: createdBooking.booking_date,
          time: createdBooking.booking_time,
          bookingId: createdBooking.id
        }]
      };

      // Send confirmation email for single booking
      setImmediate(async () => {
        try {
          console.log('📧 Sending single booking confirmation email...');
          
          const emailData = {
            customerName: customer_name,
            customerEmail: customer_email,
            customerPhone: customer_phone || req.user.phone || '',
            orderId: createdBooking.id.slice(-8),
            orderDate: new Date().toLocaleDateString(),
            serviceDate: createdBooking.booking_date,
            serviceTime: createdBooking.booking_time,
            totalAmount: total_amount,
            services: [{
              name: serviceVariant.title || 'Service',
              price: serviceVariant.price || total_amount
            }],
            address: {
              street_address: service_address.split(',')[0]?.trim() || service_address,
              city: service_address.split(',')[1]?.trim() || '',
              postal_code: service_address.split(',')[2]?.trim() || '',
              country: service_address.split(',')[3]?.trim() || ''
            },
            specialInstructions: special_instructions || '',
            isMultiDay: false,
            allBookingDates: responseData.allBookingDates
          };

          const emailResults = await emailService.sendOrderConfirmationEmails(emailData);
          console.log('📧 Single booking email results:', emailResults);

          // Send WhatsApp notification
          try {
            if (whatsappCloudService.getStatus().configured) {
              const whatsappResults = await whatsappCloudService.sendOrderConfirmationWhatsApp(emailData);
              console.log('📱 WhatsApp Cloud API results:', whatsappResults);
            } else if (whatsappService.getStatus().configured) {
              const whatsappResults = await whatsappService.sendOrderConfirmationWhatsApp(emailData);
              console.log('📱 WhatsApp Twilio results:', whatsappResults);
            }
          } catch (whatsappError) {
            console.error('❌ Failed to send WhatsApp notification:', whatsappError);
          }
        } catch (emailError) {
          console.error('❌ Failed to send confirmation emails:', emailError);
        }
      });

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Single day booking created successfully'
      });
    }
>>>>>>> refs/remotes/origin/main
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update service booking
// @route   PUT /api/service-bookings/:id
// @access  Private
router.put('/:id', [
  verifyToken,
  [
    body('booking_date').optional().isISO8601().withMessage('Valid booking date is required'),
    body('booking_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid booking time is required (HH:MM format)'),
    body('duration_minutes').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('customer_name').optional().notEmpty().withMessage('Customer name cannot be empty'),
    body('customer_email').optional().isEmail().withMessage('Valid email is required'),
    body('service_address').optional().notEmpty().withMessage('Service address cannot be empty'),
    body('special_instructions').optional().isString().withMessage('Special instructions must be a string'),
    body('status').optional().isIn(['scheduled', 'completed']).withMessage('Invalid status')
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
    // Check if booking exists and belongs to user
    const { data: existingBooking, error: fetchError } = await supabase
      .from('service_bookings')
      .select('id, status')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingBooking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Only allow updates if booking is not completed
    if (existingBooking.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update completed booking'
      });
    }

    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: booking, error: updateError } = await supabase
      .from('service_bookings')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select(`
        *,
        services (
          id,
          title,
          description,
          category
        ),
        service_variants (
          id,
          title,
          duration,
          price
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update booking'
      });
    }

    res.json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Cancel service booking
// @route   DELETE /api/service-bookings/:id
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;

    // Check if booking exists and belongs to user
    const { data: existingBooking, error: fetchError } = await supabase
      .from('service_bookings')
      .select(`
        *,
        services (
          id,
          title,
          category
        ),
        service_variants (
          id,
          title,
          price,
          duration
        )
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingBooking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Only allow cancellation if booking is not completed
    if (existingBooking.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel completed booking'
      });
    }

<<<<<<< HEAD
    // Update status to cancelled instead of deleting
    const { data: booking, error: updateError } = await supabase
=======
    // Cancel all related bookings if it's a multi-day booking
    let bookingsToCancel = [req.params.id];
    
    if (existingBooking.is_multi_day) {
      // If this is a parent booking, cancel all children
      const { data: childBookings } = await supabase
        .from('service_bookings')
        .select('id')
        .eq('parent_booking_id', req.params.id);
      
      if (childBookings) {
        bookingsToCancel = [req.params.id, ...childBookings.map(child => child.id)];
      }
    } else if (existingBooking.parent_booking_id) {
      // If this is a child booking, cancel the parent and all siblings
      const { data: parentBooking } = await supabase
        .from('service_bookings')
        .select('id')
        .eq('id', existingBooking.parent_booking_id)
        .single();
      
      if (parentBooking) {
        const { data: siblingBookings } = await supabase
          .from('service_bookings')
          .select('id')
          .eq('parent_booking_id', existingBooking.parent_booking_id);
        
        bookingsToCancel = [
          existingBooking.parent_booking_id,
          ...(siblingBookings || []).map(sibling => sibling.id)
        ];
      }
    }

    // Update status to cancelled for all related bookings
    const { data: cancelledBookings, error: updateError } = await supabase
>>>>>>> refs/remotes/origin/main
      .from('service_bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
<<<<<<< HEAD
      .eq('id', req.params.id)
=======
      .in('id', bookingsToCancel)
>>>>>>> refs/remotes/origin/main
      .eq('user_id', req.user.id)
      .select(`
        *,
        services (
          id,
          title,
          category
        ),
        service_variants (
          id,
          title,
          price,
          duration
        )
<<<<<<< HEAD
      `)
      .single();
=======
      `);
>>>>>>> refs/remotes/origin/main

    if (updateError) {
      console.error('Error cancelling booking:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel booking'
      });
    }

    // Send cancellation notifications (async, don't wait for response)
    setImmediate(async () => {
      try {
        const emailService = require('../services/emailService');
<<<<<<< HEAD
=======
        const whatsappService = require('../services/whatsappService');
>>>>>>> refs/remotes/origin/main
        
        // Prepare booking data for notifications
        const bookingData = {
          customerName: req.user.name || req.user.email,
          customerEmail: req.user.email,
          customerPhone: req.user.phone || 'Not provided',
<<<<<<< HEAD
          orderId: `BOOKING-${booking.id}`,
=======
          orderId: `BOOKING-${existingBooking.id}`,
>>>>>>> refs/remotes/origin/main
          orderDate: new Date(existingBooking.created_at).toLocaleDateString(),
          serviceDate: new Date(existingBooking.service_date || existingBooking.booking_date).toLocaleDateString(),
          serviceTime: existingBooking.service_time || 'Not specified',
          totalAmount: existingBooking.total_amount || existingBooking.service_variants?.price || 0,
          services: [{
            name: existingBooking.services?.title || existingBooking.service_variants?.title || 'Service Booking',
            price: `€${existingBooking.total_amount || existingBooking.service_variants?.price || 0}`
          }],
          address: existingBooking.service_address || {
            street_address: 'Not provided',
            city: 'Not provided',
            postal_code: 'Not provided',
            country: 'Not provided'
          },
          cancellationReason: reason || 'Cancelled by user',
          cancelledBy: 'Customer'
        };

        // Send cancellation notifications
        await emailService.sendCancellationEmails(bookingData);
<<<<<<< HEAD
=======
        
        // Send WhatsApp notification to admin
        try {
          console.log('📱 Sending cancellation WhatsApp notification...');
          
          // Try WhatsApp Cloud API first
          if (whatsappCloudService.getStatus().configured) {
            console.log('📱 Using WhatsApp Cloud API for cancellation...');
            const whatsappResults = await whatsappCloudService.sendCancellationWhatsApp(bookingData);
            console.log('📱 Cancellation WhatsApp Cloud API results:', whatsappResults);
          } else if (whatsappService.getStatus().configured) {
            console.log('📱 Using WhatsApp Twilio for cancellation...');
            const whatsappResults = await whatsappService.sendCancellationWhatsApp(bookingData);
            console.log('📱 Cancellation WhatsApp Twilio results:', whatsappResults);
          } else {
            console.log('⚠️ No WhatsApp service configured for cancellation');
          }
        } catch (whatsappError) {
          console.error('❌ Failed to send cancellation WhatsApp notification:', whatsappError);
        }
        
>>>>>>> refs/remotes/origin/main
        console.log('✅ Booking cancellation notifications sent successfully');
      } catch (notificationError) {
        console.error('❌ Error sending booking cancellation notifications:', notificationError);
        // Don't fail the cancellation if notifications fail
      }
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

<<<<<<< HEAD
=======
// @desc    Get a specific booking group with all dates
// @route   GET /api/service-bookings/groups/:groupId
// @access  Private
router.get('/groups/:groupId', verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    const { data: bookingGroup, error } = await supabase
      .rpc('get_booking_group_with_dates', { p_group_id: groupId });

    if (error) {
      console.error('Error fetching booking group:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch booking group'
      });
    }

    if (!bookingGroup || bookingGroup.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking group not found'
      });
    }

    res.json({
      success: true,
      data: bookingGroup[0]
    });
  } catch (error) {
    console.error('Error fetching booking group:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update booking group status
// @route   PUT /api/service-bookings/groups/:groupId/status
// @access  Private
router.put('/groups/:groupId/status', [
  verifyToken,
  [
    body('status').isIn(['scheduled', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
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
    const { groupId } = req.params;
    const { status } = req.body;

    // Update the booking group status
    const { data: updatedGroup, error: groupError } = await supabase
      .from('booking_groups')
      .update({ status })
      .eq('id', groupId)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (groupError) {
      console.error('Error updating booking group status:', groupError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update booking group status'
      });
    }

    // Update all individual bookings in the group
    const { error: bookingsError } = await supabase
      .from('service_bookings')
      .update({ status })
      .eq('group_id', groupId);

    if (bookingsError) {
      console.error('Error updating individual bookings:', bookingsError);
      // Don't fail the request, just log the error
    }

    res.json({
      success: true,
      data: updatedGroup,
      message: 'Booking group status updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking group status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Cancel booking group
// @route   DELETE /api/service-bookings/groups/:groupId
// @access  Private
router.delete('/groups/:groupId', [
  verifyToken,
  [
    body('reason').optional().isString().withMessage('Cancellation reason must be a string')
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
    const { groupId } = req.params;
    const { reason } = req.body;

    // Get the booking group details before cancelling
    const { data: bookingGroup, error: fetchError } = await supabase
      .rpc('get_booking_group_with_dates', { p_group_id: groupId });

    if (fetchError || !bookingGroup || bookingGroup.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking group not found'
      });
    }

    // Update booking group status to cancelled
    const { error: groupError } = await supabase
      .from('booking_groups')
      .update({ 
        status: 'cancelled',
        cancellation_reason: reason || 'Cancelled by user',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', groupId)
      .eq('user_id', req.user.id);

    if (groupError) {
      console.error('Error cancelling booking group:', groupError);
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel booking group'
      });
    }

    // Update all individual bookings in the group to cancelled
    const { error: bookingsError } = await supabase
      .from('service_bookings')
      .update({ 
        status: 'cancelled',
        cancellation_reason: reason || 'Cancelled by user',
        cancelled_at: new Date().toISOString()
      })
      .eq('group_id', groupId);

    if (bookingsError) {
      console.error('Error cancelling individual bookings:', bookingsError);
      // Don't fail the request, just log the error
    }

    // Send cancellation notifications
    setImmediate(async () => {
      try {
        const bookingData = {
          customerName: bookingGroup[0].customer_name,
          customerEmail: bookingGroup[0].customer_email,
          customerPhone: bookingGroup[0].customer_phone || '',
          orderId: groupId.slice(-8),
          serviceTitle: bookingGroup[0].service_title,
          totalAmount: bookingGroup[0].total_amount,
          address: {
            street_address: bookingGroup[0].service_address.split(',')[0]?.trim() || bookingGroup[0].service_address,
            city: bookingGroup[0].service_address.split(',')[1]?.trim() || '',
            postal_code: bookingGroup[0].service_address.split(',')[2]?.trim() || '',
            country: bookingGroup[0].service_address.split(',')[3]?.trim() || ''
          },
          cancellationReason: reason || 'Cancelled by user',
          cancelledBy: 'Customer',
          isMultiDay: true,
          allBookingDates: bookingGroup[0].booking_dates || []
        };

        await emailService.sendCancellationEmails(bookingData);
        
        // Send WhatsApp notification
        try {
          if (whatsappCloudService.getStatus().configured) {
            await whatsappCloudService.sendCancellationWhatsApp(bookingData);
          } else if (whatsappService.getStatus().configured) {
            await whatsappService.sendCancellationWhatsApp(bookingData);
          }
        } catch (whatsappError) {
          console.error('❌ Failed to send cancellation WhatsApp notification:', whatsappError);
        }
      } catch (notificationError) {
        console.error('❌ Error sending booking group cancellation notifications:', notificationError);
      }
    });

    res.json({
      success: true,
      message: 'Booking group cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking group:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

>>>>>>> refs/remotes/origin/main
module.exports = router;
