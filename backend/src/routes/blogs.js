const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all published blog posts
// @route   GET /api/blogs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error fetching blogs'
      });
    }

    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single blog post
// @route   GET /api/blogs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_published', true)
      .single();

    if (error || !blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get blogs by category
// @route   GET /api/blogs/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('category', req.params.category)
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error fetching blogs'
      });
    }

    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get cleaning tips
// @route   GET /api/blogs/tips/cleaning
// @access  Public
router.get('/tips/cleaning', async (req, res) => {
  try {
    const { data: tips, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('category', 'cleaning_tips')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error fetching cleaning tips'
      });
    }

    res.json({
      success: true,
      count: tips.length,
      data: tips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get industry insights
// @route   GET /api/blogs/insights/industry
// @access  Public
router.get('/insights/industry', async (req, res) => {
  try {
    const { data: insights, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('category', 'industry_insights')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error fetching industry insights'
      });
    }

    res.json({
      success: true,
      count: insights.length,
      data: insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Create new blog post (Admin only)
// @route   POST /api/blogs
// @access  Private/Admin
router.post('/', [
  protect,
  admin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').isIn(['cleaning_tips', 'industry_insights', 'company_news', 'general'])
      .withMessage('Invalid category'),
    body('excerpt').optional().isString().withMessage('Excerpt must be a string'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
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
    const blogData = {
      ...req.body,
      tags: req.body.tags || [],
      excerpt: req.body.excerpt || req.body.content.substring(0, 150) + '...',
      is_published: req.body.is_published !== undefined ? req.body.is_published : false,
      published_at: req.body.is_published ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: blog, error } = await supabase
      .from('blogs')
      .insert([blogData])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error creating blog post'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update blog post (Admin only)
// @route   PUT /api/blogs/:id
// @access  Private/Admin
router.put('/:id', [
  protect,
  admin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').isIn(['cleaning_tips', 'industry_insights', 'company_news', 'general'])
      .withMessage('Invalid category')
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
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // If publishing for the first time, set published_at
    if (req.body.is_published && !req.body.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { data: blog, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete blog post (Admin only)
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
router.delete('/:id', [protect, admin], async (req, res) => {
  try {
    // Soft delete - just mark as unpublished
    const { data: blog, error } = await supabase
      .from('blogs')
      .update({ 
        is_published: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get all blogs (including unpublished) - Admin only
// @route   GET /api/blogs/admin/all
// @access  Private/Admin
router.get('/admin/all', [protect, admin], async (req, res) => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Error fetching blogs'
      });
    }

    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Publish/Unpublish blog post (Admin only)
// @route   PUT /api/blogs/:id/publish
// @access  Private/Admin
router.put('/:id/publish', [
  protect,
  admin,
  [
    body('is_published').isBoolean().withMessage('is_published must be a boolean')
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
    const updateData = {
      is_published: req.body.is_published,
      updated_at: new Date().toISOString()
    };

    // Set published_at if publishing for the first time
    if (req.body.is_published) {
      updateData.published_at = new Date().toISOString();
    }

    const { data: blog, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: `Blog post ${req.body.is_published ? 'published' : 'unpublished'} successfully`,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
