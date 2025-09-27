const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware to verify JWT token
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
      .select('id, email, first_name, last_name, is_active')
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

// Get user's cart items
router.get('/items', verifyToken, async (req, res) => {
  try {
    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', req.user.id)
      .order('added_at', { ascending: false });

    if (cartError) {
      console.error('Error fetching cart items:', cartError);
      return res.status(500).json({ error: 'Failed to fetch cart items' });
    }

    // Get service variant details for each cart item
    const itemsWithServices = await Promise.all(
      (cartItems || []).map(async (item) => {
        const { data: serviceVariant, error: serviceError } = await supabase
          .from('service_variants')
          .select(`
            id, title, description, image, price, duration, features,
            services (
              id,
              title,
              category
            )
          `)
          .eq('id', item.service_id)
          .single();

        if (serviceError || !serviceVariant) {
          return {
            ...item,
            service: null
          };
        }

        // Format service variant data
        const service = {
          id: serviceVariant.id,
          title: serviceVariant.title,
          description: serviceVariant.description,
          image: serviceVariant.image || '',
          category: serviceVariant.services?.category || 'General',
          price: serviceVariant.price,
          duration: serviceVariant.duration,
          features: serviceVariant.features || []
        };

        return {
          ...item,
          service
        };
      })
    );

    res.json({ success: true, data: itemsWithServices });
  } catch (error) {
    console.error('Error in get cart items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to cart
router.post('/items', verifyToken, async (req, res) => {
  try {
    const { service_id, quantity = 1, user_inputs = {}, calculated_price } = req.body;

    if (!service_id) {
      return res.status(400).json({ error: 'Service ID is required' });
    }

    // Get service variant details
    const { data: serviceVariant, error: serviceError } = await supabase
      .from('service_variants')
      .select(`
        *,
        services (
          id,
          title,
          category
        )
      `)
      .eq('id', service_id)
      .single();

    if (serviceError || !serviceVariant) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Calculate price for house moving services
    let finalCalculatedPrice = calculated_price;
    if (serviceVariant.service_id === 'house-moving' && user_inputs.area && user_inputs.distance) {
      const area = parseFloat(user_inputs.area);
      const distance = parseFloat(user_inputs.distance);
      const rate = serviceVariant.unit_price || 20; // Default rate
      
      // House moving calculation: (area * rate) + (distance * 0.5) + 19% VAT
      const labour = area * rate;
      const transport = distance * 0.5;
      const subtotal = labour + transport;
      const tax = subtotal * 0.19;
      finalCalculatedPrice = subtotal + tax;
      
      console.log('House moving calculation:', {
        area,
        distance,
        rate,
        labour,
        transport,
        subtotal,
        tax,
        total: finalCalculatedPrice
      });
    }

    // Calculate price for office moving services
    if (serviceVariant.service_id === 'office-moving' && user_inputs.items && user_inputs.distance) {
      const items = parseFloat(user_inputs.items);
      const distance = parseFloat(user_inputs.distance);
      const rate = serviceVariant.unit_price || 90; // Default rate
      
      // Office moving calculation: (items * rate) + (distance * 0.5) + 19% VAT
      const labour = items * rate;
      const transport = distance * 0.5;
      const subtotal = labour + transport;
      const tax = subtotal * 0.19;
      finalCalculatedPrice = subtotal + tax;
      
      console.log('Office moving calculation:', {
        items,
        distance,
        rate,
        labour,
        transport,
        subtotal,
        tax,
        total: finalCalculatedPrice
      });
    }

    // Use service variant data
    const service = {
      id: serviceVariant.id,
      title: serviceVariant.title,
      description: serviceVariant.description,
      image: serviceVariant.image || '',
      category: serviceVariant.services?.category || 'General',
      price: serviceVariant.price,
      duration: serviceVariant.duration,
      features: serviceVariant.features || []
    };

    // Check if item already exists in cart
    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('service_id', service_id)
      .single();

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      const priceToUse = finalCalculatedPrice || calculated_price || service.price;
      const totalPrice = priceToUse * newQuantity;

      const { data, error } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          calculated_price: totalPrice,
          user_inputs: { ...existingItem.user_inputs, ...user_inputs },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating cart item:', error);
        return res.status(500).json({ error: 'Failed to update cart item' });
      }

      return res.json({ success: true, data, message: 'Cart item updated' });
    } else {
      // Add new item
      const priceToUse = finalCalculatedPrice || calculated_price || service.price;
      const totalPrice = priceToUse * quantity;

      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: req.user.id,
          service_id: service.id,
          service_title: service.title,
          service_price: service.price,
          service_duration: service.duration,
          service_category: service.category,
          quantity,
          calculated_price: totalPrice,
          user_inputs
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding cart item:', error);
        return res.status(500).json({ error: 'Failed to add item to cart' });
      }

      res.json({ success: true, data, message: 'Item added to cart' });
    }
  } catch (error) {
    console.error('Error in add to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update cart item quantity
router.put('/items/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, user_inputs } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // Get current item
    const { data: currentItem, error: currentError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (currentError || !currentItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const calculatedPrice = currentItem.service_price * quantity;

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity,
        calculated_price: calculatedPrice,
        user_inputs: user_inputs || currentItem.user_inputs,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cart item:', error);
      return res.status(500).json({ error: 'Failed to update cart item' });
    }

    res.json({ success: true, data, message: 'Cart item updated' });
  } catch (error) {
    console.error('Error in update cart item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove item from cart
router.delete('/items/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error removing cart item:', error);
      return res.status(500).json({ error: 'Failed to remove cart item' });
    }

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error in remove cart item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear entire cart
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error clearing cart:', error);
      return res.status(500).json({ error: 'Failed to clear cart' });
    }

    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Error in clear cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cart summary (total items, total price)
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity, calculated_price')
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error fetching cart summary:', error);
      return res.status(500).json({ error: 'Failed to fetch cart summary' });
    }

    const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = data.reduce((sum, item) => sum + (item.calculated_price || 0), 0);

    res.json({
      success: true,
      data: {
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error in cart summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
