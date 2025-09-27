const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all service bookings (admin view)
// @route   GET /api/admin/bookings
// @access  Private/Admin
router.get('/', [protect, admin], async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('service_bookings')
      .select(`
        *,
        services (
          id,
          title,
          description,
          category
        ),
        mobile_users (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching admin bookings:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings'
      });
    }

    res.json({
      success: true,
      data: bookings || []
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single service booking (admin view)
// @route   GET /api/admin/bookings/:id
// @access  Private/Admin
router.get('/:id', [protect, admin], async (req, res) => {
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
        mobile_users (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching admin booking:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new service booking (admin)
// @route   POST /api/admin/bookings
// @access  Private/Admin
router.post('/', [
  protect,
  admin,
  [
    body('user_id').notEmpty().withMessage('User ID is required'),
    body('service_id').notEmpty().withMessage('Service ID is required'),
    body('booking_date').isISO8601().withMessage('Valid booking date is required'),
    body('booking_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid booking time is required (HH:MM format)'),
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
      user_id,
      service_id,
      service_variant_id,
      booking_date,
      booking_time,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      service_address,
      special_instructions,
      total_amount,
      priority = 'medium',
      admin_notes,
      payment_method = 'pending'
    } = req.body;

    // Check if service exists
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, title, category')
      .eq('id', service_id)
      .eq('is_active', true)
      .single();

    if (serviceError || !service) {
      return res.status(400).json({
        success: false,
        error: 'Service not found or inactive'
      });
    }

    // Create booking
    const bookingData = {
      user_id,
      service_id,
      service_variant_id: service_variant_id || null,
      booking_date,
      booking_time,
      duration_minutes,
      status: 'scheduled',
      customer_name,
      customer_email,
      customer_phone: customer_phone || null,
      service_address,
      special_instructions: special_instructions || null,
      total_amount,
      priority,
      admin_notes: admin_notes || null,
      payment_status: 'pending',
      payment_method,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: booking, error: bookingError } = await supabase
      .from('service_bookings')
      .insert([bookingData])
      .select(`
        *,
        services (
          id,
          title,
          description,
          category
        ),
        mobile_users (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .single();

    if (bookingError) {
      console.error('Error creating admin booking:', bookingError);
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
  } catch (error) {
    console.error('Error creating admin booking:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update service booking (admin)
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
router.put('/:id', [
  protect,
  admin,
  [
    body('booking_date').optional().isISO8601().withMessage('Valid booking date is required'),
    body('booking_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid booking time is required (HH:MM format)'),
    body('duration_minutes').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('customer_name').optional().notEmpty().withMessage('Customer name cannot be empty'),
    body('customer_email').optional().isEmail().withMessage('Valid email is required'),
    body('service_address').optional().notEmpty().withMessage('Service address cannot be empty'),
    body('special_instructions').optional().isString().withMessage('Special instructions must be a string'),
    body('status').optional().isIn(['scheduled', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
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
    // Check if booking exists
    const { data: existingBooking, error: fetchError } = await supabase
      .from('service_bookings')
      .select('id, status')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingBooking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
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
      .select(`
        *,
        services (
          id,
          title,
          description,
          category
        ),
        mobile_users (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating admin booking:', updateError);
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
    console.error('Error updating admin booking:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update booking status (admin)
// @route   PATCH /api/admin/bookings/:id/status
// @access  Private/Admin
router.patch('/:id/status', [
  protect,
  admin,
  [
    body('status').isIn(['scheduled', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('notes').optional().isString().withMessage('Notes must be a string')
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
    const { status, notes } = req.body;

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.admin_notes = notes;
    }

    const { data: booking, error: updateError } = await supabase
      .from('service_bookings')
      .update(updateData)
      .eq('id', req.params.id)
      .select(`
        *,
        services (
          id,
          title,
          description,
          category
        ),
        mobile_users (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating booking status:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update booking status'
      });
    }

    res.json({
      success: true,
      data: booking,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete service booking (admin)
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
router.delete('/:id', [protect, admin], async (req, res) => {
  try {
    const { data: booking, error: fetchError } = await supabase
      .from('service_bookings')
      .select('id, status')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Only allow deletion of cancelled bookings
    if (booking.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Can only delete cancelled bookings'
      });
    }

    const { error: deleteError } = await supabase
      .from('service_bookings')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      console.error('Error deleting booking:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete booking'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
