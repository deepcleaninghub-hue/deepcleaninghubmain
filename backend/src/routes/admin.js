const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', [protect, admin], async (req, res) => {
  try {
    // Get total inquiries
    const { count: totalInquiries } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    // Get total services
    const { count: totalServices } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true });

    // Get total blogs
    const { count: totalBlogs } = await supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true });

    // Get recent inquiries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: recentInquiries } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // Get inquiries by status
    const { data: statusStats } = await supabase
      .from('inquiries')
      .select('status');

    const statusDistribution = {};
    if (statusStats) {
      statusStats.forEach(inquiry => {
        statusDistribution[inquiry.status] = (statusDistribution[inquiry.status] || 0) + 1;
      });
    }

    // Get popular services
    const { data: popularServices } = await supabase
      .from('inquiries')
      .select('services');

    const serviceCounts = {};
    if (popularServices) {
      popularServices.forEach(inquiry => {
        inquiry.services.forEach(service => {
          serviceCounts[service.name] = (serviceCounts[service.name] || 0) + 1;
        });
      });
    }

    // Sort services by popularity
    const topServices = Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      data: {
        overview: {
          totalInquiries: totalInquiries || 0,
          totalServices: totalServices || 0,
          totalBlogs: totalBlogs || 0,
          recentInquiries: recentInquiries || 0
        },
        statusDistribution,
        topServices,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', [protect, admin], async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get inquiries in date range
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (inquiriesError) {
      return res.status(500).json({
        success: false,
        error: 'Error fetching inquiries'
      });
    }

    // Calculate daily statistics
    const dailyStats = {};
    inquiries.forEach(inquiry => {
      const date = inquiry.created_at.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { count: 0, revenue: 0 };
      }
      dailyStats[date].count++;
      dailyStats[date].revenue += inquiry.total_amount || 0;
    });

    // Convert to array and sort by date
    const dailyStatsArray = Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate totals
    const totalInquiries = inquiries.length;
    const totalRevenue = inquiries.reduce((sum, inquiry) => sum + (inquiry.total_amount || 0), 0);
    const averageRevenue = totalInquiries > 0 ? totalRevenue / totalInquiries : 0;

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        totalInquiries,
        totalRevenue,
        averageRevenue: Math.round(averageRevenue * 100) / 100,
        dailyStats: dailyStatsArray,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get admin users list
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', [protect, admin], async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, is_active, created_at, last_login, last_logout')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error fetching users'
      });
    }

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update admin user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', [
  protect,
  admin,
  [
    body('is_active').isBoolean().withMessage('is_active must be a boolean')
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
    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot deactivate your own account'
      });
    }

    const { data: user, error } = await supabase
      .from('admin_users')
      .update({ 
        is_active: req.body.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${req.body.is_active ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
router.get('/settings', [protect, admin], async (req, res) => {
  try {
    // This would typically come from a settings table
    // For now, return default settings
    const settings = {
      company: {
        name: 'Deep Cleaning Hub',
        email: 'info@deepcleaninghub.com',
        phone: '+49-16097044182',
        address: 'Germany',
        serviceAreas: ['Germany', 'Europe'],
        businessHours: 'Monday - Friday: 8:00 AM - 6:00 PM'
      },
      notifications: {
        emailNotifications: true,
        inquiryNotifications: true,
        systemNotifications: true
      },
      app: {
        version: '1.0.0',
        maintenanceMode: false,
        allowRegistrations: false
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
router.put('/settings', [
  protect,
  admin,
  [
    body('company.name').optional().isString().withMessage('Company name must be a string'),
    body('company.email').optional().isEmail().withMessage('Company email must be valid'),
    body('company.phone').optional().isString().withMessage('Company phone must be a string'),
    body('notifications.emailNotifications').optional().isBoolean().withMessage('Email notifications must be boolean'),
    body('app.maintenanceMode').optional().isBoolean().withMessage('Maintenance mode must be boolean')
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
    // In a real application, this would update a settings table
    // For now, just return success
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: req.body
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get system logs (basic implementation)
// @route   GET /api/admin/logs
// @access  Private/Admin
router.get('/logs', [protect, admin], async (req, res) => {
  try {
    // In a real application, this would fetch from a logs table
    // For now, return sample logs
    const logs = [
      {
        id: 1,
        level: 'info',
        message: 'System started successfully',
        timestamp: new Date().toISOString(),
        user: 'System'
      },
      {
        id: 2,
        level: 'info',
        message: 'Database connection established',
        timestamp: new Date().toISOString(),
        user: 'System'
      }
    ];

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Export data (basic implementation)
// @route   POST /api/admin/export
// @access  Private/Admin
router.post('/export', [
  protect,
  admin,
  [
    body('type').isIn(['inquiries', 'services', 'blogs', 'all']).withMessage('Invalid export type'),
    body('format').isIn(['json', 'csv']).withMessage('Invalid export format'),
    body('dateRange.startDate').optional().isISO8601().withMessage('Start date must be valid'),
    body('dateRange.endDate').optional().isISO8601().withMessage('End date must be valid')
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
    const { type, format, dateRange } = req.body;

    // In a real application, this would generate and return the actual export file
    // For now, return success message
    res.json({
      success: true,
      message: `Export of ${type} in ${format} format initiated`,
      data: {
        exportId: `export_${Date.now()}`,
        type,
        format,
        status: 'processing',
        estimatedTime: '2-5 minutes'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
