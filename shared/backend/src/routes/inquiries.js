const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { protect, admin } = require('../middleware/auth');
const sendInquiryEmail = require('../utils/email');

const router = express.Router();

// @desc    Submit customer inquiry
// @route   POST /api/inquiries
// @access  Public
router.post('/', [
  [
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('customerEmail').isEmail().withMessage('Valid email is required'),
    body('customerPhone').notEmpty().withMessage('Phone number is required'),
    body('services').isArray().withMessage('Services must be an array'),
    body('services.*.id').notEmpty().withMessage('Service ID is required'),
    body('services.*.name').notEmpty().withMessage('Service name is required'),
    body('services.*.price').notEmpty().withMessage('Service price is required'),
    body('message').optional().isString().withMessage('Message must be a string'),
    body('preferredDate').optional().isISO8601().withMessage('Preferred date must be valid'),
    body('serviceArea').optional().isString().withMessage('Service area must be a string')
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
    const inquiryData = {
      customer_name: req.body.customerName,
      customer_email: req.body.customerEmail,
      customer_phone: req.body.customerPhone,
      services: req.body.services,
      total_amount: req.body.services.reduce((total, service) => {
        const price = parseFloat(service.price.replace('From €', ''));
        return total + price;
      }, 0),
      message: req.body.message || '',
      preferred_date: req.body.preferredDate || null,
      service_area: req.body.serviceArea || '',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert inquiry into database
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert([inquiryData])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error submitting inquiry'
      });
    }

    // Send email notification to admin
    try {
      await sendInquiryEmail({
        inquiryId: inquiry.id,
        customerName: inquiry.customer_name,
        customerEmail: inquiry.customer_email,
        customerPhone: inquiry.customer_phone,
        services: inquiry.services,
        totalAmount: inquiry.total_amount,
        message: inquiry.message,
        preferredDate: inquiry.preferred_date,
        serviceArea: inquiry.service_area
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: {
        inquiryId: inquiry.id,
        status: inquiry.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get all inquiries (Admin only)
// @route   GET /api/inquiries
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error fetching inquiries'
      });
    }

    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single inquiry (Admin only)
// @route   GET /api/inquiries/:id
// @access  Private/Admin
router.get('/:id', [protect, admin], async (req, res) => {
  try {
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update inquiry status (Admin only)
// @route   PUT /api/inquiries/:id/status
// @access  Private/Admin
router.put('/:id/status', [
  protect,
  admin,
  [
    body('status').isIn(['pending', 'contacted', 'confirmed', 'completed', 'cancelled'])
      .withMessage('Invalid status')
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
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .update({ 
        status: req.body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add admin notes to inquiry (Admin only)
// @route   PUT /api/inquiries/:id/notes
// @access  Private/Admin
router.put('/:id/notes', [
  protect,
  admin,
  [
    body('notes').notEmpty().withMessage('Notes are required')
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
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .update({ 
        admin_notes: req.body.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get inquiry statistics (Admin only)
// @route   GET /api/inquiries/stats/overview
// @access  Private/Admin
router.get('/stats/overview', [protect, admin], async (req, res) => {
  try {
    // Get total inquiries
    const { count: totalInquiries } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    // Get inquiries by status
    const { data: statusStats } = await supabase
      .from('inquiries')
      .select('status');

    // Get inquiries by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: recentInquiries } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Calculate status distribution
    const statusDistribution = {};
    if (statusStats) {
      statusStats.forEach(inquiry => {
        statusDistribution[inquiry.status] = (statusDistribution[inquiry.status] || 0) + 1;
      });
    }

    res.json({
      success: true,
      data: {
        totalInquiries: totalInquiries || 0,
        recentInquiries: recentInquiries || 0,
        statusDistribution,
        averageResponseTime: '2-4 hours' // This could be calculated from actual data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get inquiries by date range (Admin only)
// @route   GET /api/inquiries/stats/date-range
// @access  Private/Admin
router.get('/stats/date-range', [protect, admin], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error fetching inquiries'
      });
    }

    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
