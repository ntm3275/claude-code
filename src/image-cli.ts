#!/usr/bin/env node

import { Command } from 'commander';
import { ImageResizer } from './resizer';
import * as path from 'path';
import * as fs from 'fs';

const program = new Command();

program
  .name('img-resize')
  .description('Resize images with support for various formats including TIFF')
  .version('1.0.0');

program
  .command('resize')
  .description('Resize an image file')
  .argument('<input>', 'Input image file path')
  .option('-w, --width <number>', 'Target width in pixels', parseInt)
  .option('-h, --height <number>', 'Target height in pixels', parseInt)
  .option('-o, --output <path>', 'Output image file path')
  .option('-f, --format <format>', 'Output format (jpeg, png, webp, tiff, avif)')
  .option('-q, --quality <number>', 'Quality (1-100)', parseInt, 80)
  .option('--fit <mode>', 'Fit mode (cover, contain, fill, inside, outside)', 'inside')
  .option('--no-aspect', 'Do not maintain aspect ratio')
  .action(async (input: string, options: any) => {
    try {
      const resizer = new ImageResizer();

      // Resolve input path
      const inputPath = path.resolve(input);

      // Check if input file exists
      if (!fs.existsSync(inputPath)) {
        console.error(`Error: File not found: ${inputPath}`);
        process.exit(1);
      }

      // Validate dimensions
      if (!options.width && !options.height) {
        console.error('Error: At least one dimension (--width or --height) must be specified');
        process.exit(1);
      }

      // Determine output path
      let outputPath = options.output;
      if (outputPath) {
        outputPath = path.resolve(outputPath);
      }

      console.log(`Resizing: ${inputPath}`);
      if (options.width) console.log(`  Width: ${options.width}px`);
      if (options.height) console.log(`  Height: ${options.height}px`);
      if (options.format) console.log(`  Format: ${options.format}`);
      console.log(`  Quality: ${options.quality}%`);
      console.log(`  Fit mode: ${options.fit}`);
      console.log(`  Maintain aspect ratio: ${options.aspect !== false}`);

      const info = await resizer.resize(inputPath, {
        width: options.width,
        height: options.height,
        outputPath,
        format: options.format,
        quality: options.quality,
        fit: options.fit,
        maintainAspectRatio: options.aspect !== false,
      });

      console.log('\n✓ Resize completed successfully!');
      console.log(`Output: ${outputPath || 'Generated path'}`);
      console.log(`Dimensions: ${info.width}x${info.height}`);
      console.log(`Format: ${info.format}`);
      console.log(`Size: ${(info.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('batch')
  .description('Resize multiple image files')
  .argument('<input-dir>', 'Directory containing image files')
  .option('-w, --width <number>', 'Target width in pixels', parseInt)
  .option('-h, --height <number>', 'Target height in pixels', parseInt)
  .option('-o, --output <dir>', 'Output directory for resized images')
  .option('-f, --format <format>', 'Output format (jpeg, png, webp, tiff, avif)')
  .option('-q, --quality <number>', 'Quality (1-100)', parseInt, 80)
  .option('--fit <mode>', 'Fit mode (cover, contain, fill, inside, outside)', 'inside')
  .option('--no-aspect', 'Do not maintain aspect ratio')
  .action(async (inputDir: string, options: any) => {
    try {
      const resizer = new ImageResizer();

      // Resolve input directory
      const inputPath = path.resolve(inputDir);

      // Check if input directory exists
      if (!fs.existsSync(inputPath)) {
        console.error(`Error: Directory not found: ${inputPath}`);
        process.exit(1);
      }

      // Validate dimensions
      if (!options.width && !options.height) {
        console.error('Error: At least one dimension (--width or --height) must be specified');
        process.exit(1);
      }

      // Get all image files in directory
      const files = fs.readdirSync(inputPath);
      const supportedFormats = resizer.getSupportedFormats();
      const imageFiles = files
        .filter((file) => {
          const ext = path.extname(file).slice(1).toLowerCase();
          return supportedFormats.includes(ext);
        })
        .map((file) => path.join(inputPath, file));

      if (imageFiles.length === 0) {
        console.log('No image files found in the directory.');
        console.log(`Supported formats: ${supportedFormats.join(', ')}`);
        process.exit(0);
      }

      // Determine output directory
      const outputDir = options.output
        ? path.resolve(options.output)
        : path.join(inputPath, 'resized');

      console.log(`Found ${imageFiles.length} image file(s)`);
      if (options.width) console.log(`Width: ${options.width}px`);
      if (options.height) console.log(`Height: ${options.height}px`);
      if (options.format) console.log(`Format: ${options.format}`);
      console.log(`Quality: ${options.quality}%`);
      console.log(`Output directory: ${outputDir}\n`);

      await resizer.resizeMultiple(imageFiles, outputDir, {
        width: options.width,
        height: options.height,
        format: options.format,
        quality: options.quality,
        fit: options.fit,
        maintainAspectRatio: options.aspect !== false,
      });

      console.log('\n✓ Batch resize completed successfully!');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('formats')
  .description('List supported image formats')
  .action(() => {
    const resizer = new ImageResizer();
    const formats = resizer.getSupportedFormats();
    console.log('Supported image formats:');
    formats.forEach((format) => {
      console.log(`  - ${format}`);
    });
  });

// If no command is provided, show help
if (process.argv.length === 2) {
  program.help();
}

program.parse();
