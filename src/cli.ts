#!/usr/bin/env node

import { Command } from 'commander';
import { PDFToMarkdownConverter } from './converter';
import * as path from 'path';
import * as fs from 'fs';

const program = new Command();

program
  .name('pdf2md')
  .description('Convert PDF files to Markdown format')
  .version('1.0.0');

program
  .command('convert')
  .description('Convert a PDF file to Markdown')
  .argument('<input>', 'Input PDF file path')
  .option('-o, --output <path>', 'Output markdown file path')
  .option('-p, --preserve', 'Preserve formatting from PDF', false)
  .action(async (input: string, options: any) => {
    try {
      const converter = new PDFToMarkdownConverter();

      // Resolve input path
      const inputPath = path.resolve(input);

      // Check if input file exists
      if (!fs.existsSync(inputPath)) {
        console.error(`Error: File not found: ${inputPath}`);
        process.exit(1);
      }

      // Determine output path
      let outputPath = options.output;
      if (!outputPath) {
        const baseName = path.basename(inputPath, path.extname(inputPath));
        outputPath = path.join(path.dirname(inputPath), `${baseName}.md`);
      } else {
        outputPath = path.resolve(outputPath);
      }

      console.log(`Converting: ${inputPath}`);
      console.log(`Output: ${outputPath}`);

      const markdown = await converter.convert(inputPath, {
        outputPath,
        preserveFormatting: options.preserve,
      });

      console.log('\n✓ Conversion completed successfully!');
      console.log(`Output file: ${outputPath}`);
      console.log(`Size: ${markdown.length} characters`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('batch')
  .description('Convert multiple PDF files to Markdown')
  .argument('<input-dir>', 'Directory containing PDF files')
  .option('-o, --output <dir>', 'Output directory for markdown files')
  .option('-p, --preserve', 'Preserve formatting from PDF', false)
  .action(async (inputDir: string, options: any) => {
    try {
      const converter = new PDFToMarkdownConverter();

      // Resolve input directory
      const inputPath = path.resolve(inputDir);

      // Check if input directory exists
      if (!fs.existsSync(inputPath)) {
        console.error(`Error: Directory not found: ${inputPath}`);
        process.exit(1);
      }

      // Get all PDF files in directory
      const files = fs.readdirSync(inputPath);
      const pdfFiles = files
        .filter((file) => file.toLowerCase().endsWith('.pdf'))
        .map((file) => path.join(inputPath, file));

      if (pdfFiles.length === 0) {
        console.log('No PDF files found in the directory.');
        process.exit(0);
      }

      // Determine output directory
      const outputDir = options.output
        ? path.resolve(options.output)
        : path.join(inputPath, 'markdown-output');

      console.log(`Found ${pdfFiles.length} PDF file(s)`);
      console.log(`Output directory: ${outputDir}\n`);

      await converter.convertMultiple(pdfFiles, outputDir, {
        preserveFormatting: options.preserve,
      });

      console.log('\n✓ Batch conversion completed successfully!');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// If no command is provided, show help
if (process.argv.length === 2) {
  program.help();
}

program.parse();
