const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all service variants (formerly service options)
// @route   GET /api/service-options
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, service_id } = req.query;
    
    let query = supabase
      .from('service_variants')
      .select(`
        *,
        services (
          id,
          title,
          category,
          image_url
        )
      `)
      .eq('is_active', true);

    // Filter by service_id (category)
    if (service_id) {
      query = query.eq('service_id', service_id);
    }

    // Filter by category
    if (category) {
      query = query.eq('services.category', category);
    }

    const { data: serviceVariants, error } = await query.order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching service variants:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // If table doesn't exist, return empty array instead of error
      if (error.message && error.message.includes('relation "service_variants" does not exist')) {
        console.log('Service variants table does not exist, returning empty array');
        return res.json({
          success: true,
          count: 0,
          data: []
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Error fetching service variants',
        details: error.message
      });
    }

    res.json({
      success: true,
      count: serviceVariants?.length || 0,
      data: serviceVariants || []
    });
  } catch (error) {
    console.error('Error in get service variants:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get service variant by ID
// @route   GET /api/service-options/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: serviceVariant, error } = await supabase
      .from('service_variants')
      .select(`
        *,
        services (
          id,
          title,
          category,
          description,
          image_url
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !serviceVariant) {
      return res.status(404).json({
        success: false,
        error: 'Service variant not found'
      });
    }

    res.json({
      success: true,
      data: serviceVariant
    });
  } catch (error) {
    console.error('Error in get service variant:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new service variant (Admin only)
// @route   POST /api/service-options
// @access  Private/Admin
router.post('/', [
  protect,
  admin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('service_id').notEmpty().withMessage('Service ID is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('duration').notEmpty().withMessage('Duration is required')
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
    // Check if service exists
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, title, category')
      .eq('id', req.body.service_id)
      .eq('is_active', true)
      .single();

    if (serviceError || !service) {
      return res.status(400).json({
        success: false,
        error: 'Service not found or inactive'
      });
    }

    const serviceVariantData = {
      ...req.body,
      features: req.body.features || [],
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: serviceVariant, error } = await supabase
      .from('service_variants')
      .insert([serviceVariantData])
      .select(`
        *,
        services (
          id,
          title,
          category,
          image_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating service variant:', error);
      return res.status(500).json({
        success: false,
        error: 'Error creating service variant'
      });
    }

    res.status(201).json({
      success: true,
      data: serviceVariant
    });
  } catch (error) {
    console.error('Error in create service variant:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update service variant (Admin only)
// @route   PUT /api/service-options/:id
// @access  Private/Admin
router.put('/:id', [protect, admin], async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: serviceVariant, error } = await supabase
      .from('service_variants')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        services (
          id,
          title,
          category,
          image_url
        )
      `)
      .single();

    if (error || !serviceVariant) {
      return res.status(404).json({
        success: false,
        error: 'Service variant not found'
      });
    }

    res.json({
      success: true,
      data: serviceVariant
    });
  } catch (error) {
    console.error('Error in update service variant:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete service variant (Admin only)
// @route   DELETE /api/service-options/:id
// @access  Private/Admin
router.delete('/:id', [protect, admin], async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('service_variants')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error deleting service variant'
      });
    }

    res.json({
      success: true,
      message: 'Service variant deleted successfully'
    });
  } catch (error) {
    console.error('Error in delete service variant:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
