/**
 * Example usage of the PDF to Markdown converter
 */

import { PDFToMarkdownConverter } from '../src/converter';
import * as path from 'path';

async function main() {
  const converter = new PDFToMarkdownConverter();

  // Example 1: Convert a single PDF file
  console.log('Example 1: Converting a single PDF file');
  try {
    const markdown = await converter.convert('sample.pdf', {
      outputPath: 'output.md',
      preserveFormatting: false,
    });
    console.log('Conversion successful!');
    console.log(`Generated ${markdown.length} characters of markdown`);
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n---\n');

  // Example 2: Convert with formatting preservation
  console.log('Example 2: Converting with formatting preservation');
  try {
    const markdown = await converter.convert('sample.pdf', {
      outputPath: 'output-formatted.md',
      preserveFormatting: true,
    });
    console.log('Conversion successful with formatting!');
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n---\n');

  // Example 3: Convert without saving to file
  console.log('Example 3: Converting without saving');
  try {
    const markdown = await converter.convert('sample.pdf');
    console.log('Conversion successful!');
    console.log('First 200 characters:');
    console.log(markdown.substring(0, 200));
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n---\n');

  // Example 4: Batch convert multiple files
  console.log('Example 4: Batch converting multiple files');
  try {
    const pdfFiles = ['file1.pdf', 'file2.pdf', 'file3.pdf'];
    await converter.convertMultiple(pdfFiles, 'output-directory', {
      preserveFormatting: false,
    });
    console.log('Batch conversion successful!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };
