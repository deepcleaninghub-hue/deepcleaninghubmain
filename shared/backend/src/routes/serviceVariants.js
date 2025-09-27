const express = require('express');
const { supabase } = require('../config/database');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all service variants
// @route   GET /api/service-variants
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { service_id, category } = req.query;
    
    let query = supabase
      .from('service_variants')
      .select(`
        *,
        services (
          id,
          title,
          category,
          pricing_type,
          unit_measure
        )
      `)
      .eq('is_active', true);

    // Filter by service_id
    if (service_id) {
      query = query.eq('service_id', service_id);
    }

    // Filter by category
    if (category) {
      query = query.eq('services.category', category);
    }

    const { data: variants, error } = await query
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching service variants:', error);
      return res.status(500).json({
        success: false,
        error: 'Error fetching service variants'
      });
    }

    res.json({
      success: true,
      count: variants?.length || 0,
      data: variants || []
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
// @route   GET /api/service-variants/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: variant, error } = await supabase
      .from('service_variants')
      .select(`
        *,
        services (
          id,
          title,
          category,
          pricing_type,
          unit_measure
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching service variant:', error);
      return res.status(404).json({
        success: false,
        error: 'Service variant not found'
      });
    }

    res.json({
      success: true,
      data: variant
    });
  } catch (error) {
    console.error('Error in get service variant:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new service variant
// @route   POST /api/service-variants
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      id,
      service_id,
      title,
      description,
      price,
      duration,
      features,
      pricing_type,
      unit_price,
      unit_measure,
      min_measurement,
      max_measurement,
      measurement_step,
      measurement_placeholder,
      display_order
    } = req.body;

    const { data: variant, error } = await supabase
      .from('service_variants')
      .insert([{
        id,
        service_id,
        title,
        description,
        price,
        duration,
        features: features || [],
        pricing_type,
        unit_price,
        unit_measure,
        min_measurement,
        max_measurement,
        measurement_step,
        measurement_placeholder,
        display_order: display_order || 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating service variant:', error);
      return res.status(400).json({
        success: false,
        error: 'Error creating service variant'
      });
    }

    res.status(201).json({
      success: true,
      data: variant
    });
  } catch (error) {
    console.error('Error in create service variant:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update service variant
// @route   PUT /api/service-variants/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: variant, error } = await supabase
      .from('service_variants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service variant:', error);
      return res.status(400).json({
        success: false,
        error: 'Error updating service variant'
      });
    }

    res.json({
      success: true,
      data: variant
    });
  } catch (error) {
    console.error('Error in update service variant:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete service variant
// @route   DELETE /api/service-variants/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('service_variants')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting service variant:', error);
      return res.status(400).json({
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
