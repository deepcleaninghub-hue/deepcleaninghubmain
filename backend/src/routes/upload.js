const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = file.fieldname || 'general';
    const typeDir = path.join(uploadDir, type);
    
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    general: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
  };

  const fileType = file.fieldname || 'general';
  const allowedMimes = allowedTypes[fileType] || allowedTypes.general;

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private/Admin
router.post('/image', [protect, admin], upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Process image with sharp (resize, optimize)
    const imagePath = req.file.path;
    const processedImagePath = imagePath.replace(path.extname(imagePath), '_processed.jpg');

    await sharp(imagePath)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(processedImagePath);

    // Remove original file
    fs.unlinkSync(imagePath);

    // Generate public URL
    const publicUrl = `/uploads/image/${path.basename(processedImagePath)}`;

    res.json({
      success: true,
      message: 'Image uploaded and processed successfully',
      data: {
        filename: path.basename(processedImagePath),
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: publicUrl,
        path: processedImagePath
      }
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Error processing image: ' + error.message
    });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private/Admin
router.post('/images', [protect, admin], upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided'
      });
    }

    const processedImages = [];

    for (const file of req.files) {
      try {
        const imagePath = file.path;
        const processedImagePath = imagePath.replace(path.extname(imagePath), '_processed.jpg');

        await sharp(imagePath)
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(processedImagePath);

        // Remove original file
        fs.unlinkSync(imagePath);

        const publicUrl = `/uploads/image/${path.basename(processedImagePath)}`;

        processedImages.push({
          filename: path.basename(processedImagePath),
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: publicUrl,
          path: processedImagePath
        });
      } catch (error) {
        console.error(`Error processing image ${file.originalname}:`, error);
        // Continue with other files
      }
    }

    res.json({
      success: true,
      message: `${processedImages.length} images uploaded and processed successfully`,
      data: processedImages
    });
  } catch (error) {
    // Clean up files if error occurs
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error processing images: ' + error.message
    });
  }
});

// @desc    Upload document
// @route   POST /api/upload/document
// @access  Private/Admin
router.post('/document', [protect, admin], upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No document file provided'
      });
    }

    const publicUrl = `/uploads/document/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: publicUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Error uploading document: ' + error.message
    });
  }
});

// @desc    Upload service image
// @route   POST /api/upload/service-image
// @access  Private/Admin
router.post('/service-image', [protect, admin], upload.single('serviceImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No service image provided'
      });
    }

    // Process service image (specific dimensions for service cards)
    const imagePath = req.file.path;
    const processedImagePath = imagePath.replace(path.extname(imagePath), '_processed.jpg');

    await sharp(imagePath)
      .resize(400, 300, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(processedImagePath);

    // Remove original file
    fs.unlinkSync(imagePath);

    const publicUrl = `/uploads/service-image/${path.basename(processedImagePath)}`;

    res.json({
      success: true,
      message: 'Service image uploaded and processed successfully',
      data: {
        filename: path.basename(processedImagePath),
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: publicUrl,
        path: processedImagePath,
        dimensions: { width: 400, height: 300 }
      }
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Error processing service image: ' + error.message
    });
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:type/:filename
// @access  Private/Admin
router.delete('/:type/:filename', [protect, admin], async (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(uploadDir, type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: { filename, type }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error deleting file: ' + error.message
    });
  }
});

// @desc    Get upload statistics
// @route   GET /api/upload/stats
// @access  Private/Admin
router.get('/stats', [protect, admin], async (req, res) => {
  try {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      byType: {}
    };

    // Scan upload directory
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          scanDirectory(itemPath);
        } else if (stat.isFile()) {
          stats.totalFiles++;
          stats.totalSize += stat.size;

          const type = path.basename(dir);
          if (!stats.byType[type]) {
            stats.byType[type] = { count: 0, size: 0 };
          }
          stats.byType[type].count++;
          stats.byType[type].size += stat.size;
        }
      });
    };

    scanDirectory(uploadDir);

    res.json({
      success: true,
      data: {
        ...stats,
        totalSizeMB: Math.round((stats.totalSize / (1024 * 1024)) * 100) / 100,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error getting upload statistics: ' + error.message
    });
  }
});

module.exports = router;
