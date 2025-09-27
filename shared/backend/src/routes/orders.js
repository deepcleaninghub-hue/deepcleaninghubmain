const express = require('express');
const { supabase } = require('../config/database');

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

// @desc    Get user orders
// @route   GET /api/orders/user/:userId
// @access  Private
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify the user is requesting their own orders
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get orders for the user
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          service_id,
          quantity,
          price,
          services (
            id,
            title,
            description,
            image,
            category
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }

    res.json({
      success: true,
      data: orders || []
    });
  } catch (error) {
    console.error('Error in get user orders:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order with items
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          service_id,
          quantity,
          price,
          services (
            id,
            title,
            description,
            image,
            category
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error in get order by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, total_amount, delivery_address, special_instructions } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order items are required'
      });
    }

    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid total amount is required'
      });
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: req.user.id,
        total_amount,
        status: 'pending',
        delivery_address: delivery_address || req.user.address,
        special_instructions: special_instructions || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create order'
      });
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      service_id: item.service_id,
      quantity: item.quantity,
      price: item.price,
      created_at: new Date().toISOString()
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order creation
      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to create order items'
      });
    }

    // Get the complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          service_id,
          quantity,
          price,
          services (
            id,
            title,
            description,
            image,
            category
          )
        )
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete order:', fetchError);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: completeOrder || order
    });
  } catch (error) {
    console.error('Error in create order:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:orderId/status
// @access  Private
router.put('/:orderId/status', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required'
      });
    }

    // Update order status
    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or update failed'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error in update order status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
router.put('/:orderId/cancel', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    // Get order details before cancellation for notifications
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          services (
            name,
            price
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update order status to cancelled
    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        cancellation_reason: reason || 'Cancelled by user',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or cancellation failed'
      });
    }

    // Send cancellation notifications (async, don't wait for response)
    setImmediate(async () => {
      try {
        const emailService = require('../services/emailService');
        
        // Prepare order data for notifications
        const orderData = {
          customerName: req.user.name || req.user.email,
          customerEmail: req.user.email,
          customerPhone: req.user.phone || 'Not provided',
          orderId: order.id,
          orderDate: new Date(existingOrder.created_at).toLocaleDateString(),
          serviceDate: new Date(existingOrder.delivery_address?.service_date || existingOrder.created_at).toLocaleDateString(),
          serviceTime: existingOrder.delivery_address?.service_time || 'Not specified',
          totalAmount: existingOrder.total_amount,
          services: existingOrder.order_items?.map(item => ({
            name: item.services?.name || 'Service',
            price: `€${item.price}`
          })) || [],
          address: existingOrder.delivery_address || {
            street_address: 'Not provided',
            city: 'Not provided',
            postal_code: 'Not provided',
            country: 'Not provided'
          },
          cancellationReason: reason || 'Cancelled by user',
          cancelledBy: 'Customer'
        };

        // Send cancellation notifications
        await emailService.sendCancellationEmails(orderData);
        console.log('✅ Cancellation notifications sent successfully');
      } catch (notificationError) {
        console.error('❌ Error sending cancellation notifications:', notificationError);
        // Don't fail the cancellation if notifications fail
      }
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error in cancel order:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
