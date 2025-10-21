import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { PDFToMarkdownConverter } from './converter';

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Convert PDF Buffer to Markdown
async function convertPDFBuffer(
  buffer: Buffer,
  preserveFormatting: boolean = false
): Promise<{ markdown: string; metadata: any }> {
  const data = await pdfParse(buffer);
  const converter = new PDFToMarkdownConverter();

  // Extract text content
  const { text, info } = data;
  let markdown = '';

  // Add document metadata as front matter
  markdown += '---\n';
  if (info.Title) markdown += `title: ${info.Title}\n`;
  if (info.Author) markdown += `author: ${info.Author}\n`;
  if (info.Subject) markdown += `subject: ${info.Subject}\n`;
  if (info.CreationDate) markdown += `date: ${info.CreationDate}\n`;
  markdown += '---\n\n';

  // Process the text content
  let processedText = text;

  if (preserveFormatting) {
    // Basic formatting without accessing private methods
    processedText = text
      .replace(/\n{4,}/g, '\n\n\n')
      .replace(/^[\s]*[•\-\*]\s+(.+)$/gm, '- $1')
      .replace(/^[\s]*(\d+)[.)]\s+(.+)$/gm, '$1. $2');
  } else {
    // Simple cleanup
    processedText = text.replace(/\n{3,}/g, '\n\n');
  }

  markdown += processedText;

  return {
    markdown,
    metadata: {
      title: info.Title || 'Untitled',
      author: info.Author || 'Unknown',
      pages: data.numpages,
      size: buffer.length,
    },
  };
}

// Routes
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.post('/api/convert', upload.single('pdf'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const preserveFormatting = req.body.preserveFormatting === 'true';
    const { markdown, metadata } = await convertPDFBuffer(
      req.file.buffer,
      preserveFormatting
    );

    // Get original filename without extension
    const originalName = req.file.originalname.replace(/\.pdf$/i, '');

    res.json({
      success: true,
      markdown,
      metadata,
      filename: `${originalName}.md`,
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      error: 'Failed to convert PDF',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  PDF to Markdown Converter - Web Server               ║
╚════════════════════════════════════════════════════════╝

Server is running on: http://localhost:${PORT}

Features:
  - Upload PDF files through web interface
  - Convert to Markdown format
  - Download converted files
  - Maximum file size: 10MB

Press Ctrl+C to stop the server
  `);
});
