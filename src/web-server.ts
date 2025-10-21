import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ImageResizer } from './resizer';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const outputDir = path.join(__dirname, '../output');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|tiff|tif|avif|heic|heif)$/i;
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/tiff',
      'image/avif',
      'image/heic',
      'image/heif'
    ];

    const extname = allowedExtensions.test(file.originalname.toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/');

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Serve uploaded and output files
app.use('/uploads', express.static(uploadsDir));
app.use('/output', express.static(outputDir));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Image Resizer API is running' });
});

// Get supported formats
app.get('/api/formats', (req: Request, res: Response) => {
  const resizer = new ImageResizer();
  const formats = resizer.getSupportedFormats();
  res.json({ formats });
});

// Upload and resize image
app.post('/api/resize', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { width, height, format, quality, fit, maintainAspectRatio } = req.body;

    // Validate dimensions
    if (!width && !height) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'At least one dimension (width or height) must be specified' });
    }

    const resizer = new ImageResizer();
    const outputFilename = `resized-${Date.now()}.${format || path.extname(req.file.filename).slice(1)}`;
    const outputPath = path.join(outputDir, outputFilename);

    const info = await resizer.resize(req.file.path, {
      width: width ? parseInt(width, 10) : undefined,
      height: height ? parseInt(height, 10) : undefined,
      outputPath,
      format: format || undefined,
      quality: quality ? parseInt(quality, 10) : 80,
      fit: fit || 'inside',
      maintainAspectRatio: maintainAspectRatio !== 'false',
    });

    // Clean up original uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      outputUrl: `/output/${outputFilename}`,
      info: {
        width: info.width,
        height: info.height,
        format: info.format,
        size: info.size,
      },
      originalFile: {
        name: req.file.originalname,
        size: req.file.size,
      }
    });
  } catch (error) {
    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Error resizing image:', error);
    res.status(500).json({
      error: 'Failed to resize image',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cleanup old files (older than 1 hour)
const cleanupOldFiles = () => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  [uploadsDir, outputDir].forEach(dir => {
    if (!fs.existsSync(dir)) return;

    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old file: ${filePath}`);
      }
    });
  });
};

// Run cleanup every 30 minutes
setInterval(cleanupOldFiles, 30 * 60 * 1000);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Image Resizer Web Server is running!`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📡 External: http://0.0.0.0:${PORT}`);
  console.log(`🖼️  Upload images and resize them through the web interface\n`);
});

export default app;
