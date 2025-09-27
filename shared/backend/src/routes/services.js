const express = require('express');
const { supabase } = require('../config/database');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

<<<<<<< HEAD
// @desc    Get all services with their variants
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
=======
// @desc    Get all services for admin
// @route   GET /api/services/admin
// @access  Private/Admin
router.get('/admin', [protect, admin], async (req, res) => {
>>>>>>> refs/remotes/origin/main
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('services')
<<<<<<< HEAD
      .select(`
        *,
        service_variants (
          id,
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
          display_order,
          is_active
        )
      `)
      .eq('is_active', true);

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    const { data: services, error } = await query
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching services:', error);
=======
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin services:', error);
>>>>>>> refs/remotes/origin/main
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch services'
      });
    }

    // Filter out inactive variants and sort by display_order
    const processedServices = services.map(service => ({
      ...service,
      service_variants: service.service_variants
        .filter(variant => variant.is_active)
        .sort((a, b) => a.display_order - b.display_order)
    }));

    res.json({
      success: true,
<<<<<<< HEAD
      count: processedServices?.length || 0,
      data: processedServices || []
    });
  } catch (error) {
    console.error('Error in get services:', error);
=======
      data: services || []
    });
  } catch (error) {
    console.error('Error fetching admin services:', error);
>>>>>>> refs/remotes/origin/main
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

<<<<<<< HEAD
=======
// @desc    Get all services with their variants
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('services')
      .select(`
        *,
        service_variants (
          id,
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
          display_order,
          is_active
        )
      `)
      .eq('is_active', true);

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    const { data: services, error } = await query
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching services:', error);
      return res.status(500).json({
        success: false,
        error: 'Error fetching services'
      });
    }

    // Filter out inactive variants and sort by display_order
    const processedServices = services.map(service => ({
      ...service,
      service_variants: service.service_variants
        .filter(variant => variant.is_active)
        .sort((a, b) => a.display_order - b.display_order)
    }));

    res.json({
      success: true,
      count: processedServices?.length || 0,
      data: processedServices || []
    });
  } catch (error) {
    console.error('Error in get services:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

>>>>>>> refs/remotes/origin/main
// @desc    Get service by ID with variants
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        service_variants (
          id,
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
          display_order,
          is_active
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching service:', error);
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Filter out inactive variants and sort by display_order
    const processedService = {
      ...service,
      service_variants: service.service_variants
        .filter(variant => variant.is_active)
        .sort((a, b) => a.display_order - b.display_order)
    };

    res.json({
      success: true,
      data: processedService
    });
  } catch (error) {
    console.error('Error in get service by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get service variants by service ID
// @route   GET /api/services/:id/variants
// @access  Public
router.get('/:id/variants', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: variants, error } = await supabase
      .from('service_variants')
      .select('*')
      .eq('service_id', id)
      .eq('is_active', true)
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
// @route   GET /api/services/variants/:variantId
// @access  Public
router.get('/variants/:variantId', async (req, res) => {
  try {
    const { variantId } = req.params;
    
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
      .eq('id', variantId)
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

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      category,
      image_url,
      pricing_type,
      unit_measure,
      display_order
    } = req.body;

    const { data: service, error } = await supabase
      .from('services')
      .insert([{
        id,
        title,
        description,
        category,
        image_url,
        pricing_type,
        unit_measure,
        display_order: display_order || 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      return res.status(400).json({
        success: false,
        error: 'Error creating service'
      });
    }

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error in create service:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: service, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      return res.status(400).json({
        success: false,
        error: 'Error updating service'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error in update service:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;

    // First, deactivate all variants
    await supabase
      .from('service_variants')
      .update({ is_active: false })
      .eq('service_id', id);

    // Then deactivate the service
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting service:', error);
      return res.status(400).json({
        success: false,
        error: 'Error deleting service'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error in delete service:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;