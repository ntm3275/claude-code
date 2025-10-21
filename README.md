# PDF to Markdown Converter & Image Resizer

A collection of simple and efficient command-line tools for document and image processing.

## Tools Included

### 1. PDF to Markdown Converter
Convert PDF files to Markdown format with ease.

### 2. Image Resizer (with TIFF Support)
Resize images with support for various formats including TIFF.

## Features

### PDF to Markdown
- Convert single PDF files to Markdown
- Batch convert multiple PDF files
- Preserve formatting options
- Extract PDF metadata (title, author, date)
- Automatic heading detection
- List formatting support
- Code block detection

### Image Resizer
- Resize single or multiple images
- **TIFF file support** (input and output)
- Support for JPEG, PNG, WebP, AVIF, GIF, and more
- Maintain aspect ratio options
- Quality settings (1-100)
- Multiple fit modes (cover, contain, fill, inside, outside)
- Format conversion (e.g., TIFF → JPEG)

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

## Usage

### Command Line Interface

#### Convert a Single PDF File

```bash
# Basic conversion (output will be saved as input-file.md)
npm run dev -- convert path/to/file.pdf

# Specify output path
npm run dev -- convert path/to/file.pdf -o output.md

# Preserve formatting
npm run dev -- convert path/to/file.pdf -p
```

After building, you can also use:

```bash
node dist/cli.js convert path/to/file.pdf
```

#### Batch Convert Multiple PDF Files

```bash
# Convert all PDFs in a directory
npm run dev -- batch path/to/pdf-directory

# Specify output directory
npm run dev -- batch path/to/pdf-directory -o path/to/output

# Preserve formatting
npm run dev -- batch path/to/pdf-directory -p
```

### CLI Options

#### `convert` command

- `<input>`: Path to the PDF file (required)
- `-o, --output <path>`: Output markdown file path (optional)
- `-p, --preserve`: Preserve formatting from PDF (optional)

#### `batch` command

- `<input-dir>`: Directory containing PDF files (required)
- `-o, --output <dir>`: Output directory for markdown files (optional)
- `-p, --preserve`: Preserve formatting from PDF (optional)

### Programmatic API

You can also use the converter in your own Node.js/TypeScript projects:

```typescript
import { PDFToMarkdownConverter } from './src/converter';

const converter = new PDFToMarkdownConverter();

// Convert a single file
const markdown = await converter.convert('input.pdf', {
  outputPath: 'output.md',
  preserveFormatting: true
});

// Convert multiple files
await converter.convertMultiple(
  ['file1.pdf', 'file2.pdf'],
  'output-directory',
  { preserveFormatting: false }
);
```

## Output Format

The generated Markdown files include:

1. **Front Matter**: Document metadata (title, author, subject, date)
2. **Headings**: Automatically detected from PDF structure
3. **Paragraphs**: Regular text content
4. **Lists**: Bullet points and numbered lists
5. **Code Blocks**: Indented text sections

### Example Output

```markdown
---
title: Sample Document
author: John Doe
date: 2024-01-01
---

## Introduction

This is a sample PDF document converted to Markdown format.

## Features

- Feature 1
- Feature 2
- Feature 3

## Code Example

```
function hello() {
  console.log("Hello, World!");
}
```
```

## Development

### Project Structure

```
.
├── src/
│   ├── converter.ts    # Main converter class
│   ├── cli.ts          # CLI interface
│   └── index.ts        # Entry point
├── dist/               # Compiled JavaScript (generated)
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Run PDF converter CLI in development mode
- `npm run dev:image`: Run image resizer CLI in development mode
- `npm start`: Run the compiled PDF converter CLI

## Image Resizer

For detailed documentation on the image resizer, see [IMAGE-RESIZER.md](IMAGE-RESIZER.md).

### Quick Start

```bash
# Resize a single image
npm run dev:image -- resize photo.jpg --width 800

# Resize a TIFF file and convert to JPEG
npm run dev:image -- resize scan.tiff --width 1920 --format jpeg

# Batch resize all images in a directory
npm run dev:image -- batch ./photos --width 1024

# List supported formats
npm run dev:image -- formats
```

## How It Works

1. **PDF Parsing**: Uses `pdf-parse` library to extract text from PDF files
2. **Text Processing**: Analyzes the extracted text to detect structure
3. **Formatting**: Applies Markdown formatting based on detected patterns
4. **Output**: Saves the formatted content to a Markdown file

## Limitations

- Complex PDF layouts may not convert perfectly
- Images are not extracted (text only)
- Tables are converted to plain text
- Font styling (bold, italic) is not preserved
- Page breaks are not explicitly marked

## Troubleshooting

### "File not found" error

Make sure the PDF file path is correct and the file exists.

### "Failed to convert PDF" error

The PDF might be encrypted or corrupted. Try opening it in a PDF reader first.

### Missing dependencies

Run `npm install` to install all required dependencies.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
