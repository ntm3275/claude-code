import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';

export interface ConversionOptions {
  outputPath?: string;
  preserveFormatting?: boolean;
}

export class PDFToMarkdownConverter {
  /**
   * Convert a PDF file to Markdown format
   * @param pdfPath - Path to the PDF file
   * @param options - Conversion options
   * @returns The markdown content as a string
   */
  async convert(pdfPath: string, options: ConversionOptions = {}): Promise<string> {
    try {
      // Read the PDF file
      const dataBuffer = fs.readFileSync(pdfPath);

      // Parse the PDF
      const data = await pdfParse(dataBuffer);

      // Extract text content
      let markdownContent = this.convertToMarkdown(data, options);

      // Save to file if output path is specified
      if (options.outputPath) {
        this.saveMarkdown(markdownContent, options.outputPath);
      }

      return markdownContent;
    } catch (error) {
      throw new Error(`Failed to convert PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert PDF data to Markdown format
   * @param data - Parsed PDF data
   * @param options - Conversion options
   * @returns Markdown formatted string
   */
  private convertToMarkdown(data: any, options: ConversionOptions): string {
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

    if (options.preserveFormatting) {
      // Preserve more of the original formatting
      processedText = this.preserveFormatting(text);
    } else {
      // Basic formatting
      processedText = this.basicFormatting(text);
    }

    markdown += processedText;

    return markdown;
  }

  /**
   * Apply basic formatting to the text
   * @param text - Raw text from PDF
   * @returns Formatted text
   */
  private basicFormatting(text: string): string {
    let formatted = text;

    // Remove excessive blank lines (more than 2 consecutive)
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    // Try to detect headings (lines that are all caps or end without punctuation)
    const lines = formatted.split('\n');
    const processedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) return line;

      // Detect potential headings
      if (
        trimmedLine.length > 0 &&
        trimmedLine.length < 100 &&
        (trimmedLine === trimmedLine.toUpperCase() ||
        (!trimmedLine.match(/[.!?]$/) && index < lines.length - 1 && !lines[index + 1].trim()))
      ) {
        return `## ${trimmedLine}\n`;
      }

      return line;
    });

    return processedLines.join('\n');
  }

  /**
   * Preserve more formatting from the original PDF
   * @param text - Raw text from PDF
   * @returns Formatted text with preserved structure
   */
  private preserveFormatting(text: string): string {
    let formatted = text;

    // Preserve line breaks but clean up excessive spacing
    formatted = formatted.replace(/\n{4,}/g, '\n\n\n');

    // Detect and format lists
    formatted = formatted.replace(/^[\s]*[•\-\*]\s+(.+)$/gm, '- $1');
    formatted = formatted.replace(/^[\s]*(\d+)[.)]\s+(.+)$/gm, '$1. $2');

    // Detect potential code blocks (lines with consistent indentation)
    const lines = formatted.split('\n');
    let inCodeBlock = false;
    const processedLines = lines.map((line) => {
      const leadingSpaces = line.match(/^(\s+)/)?.[1].length || 0;

      if (leadingSpaces >= 4 && line.trim()) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          return '```\n' + line;
        }
        return line;
      } else if (inCodeBlock && !line.trim()) {
        return line;
      } else if (inCodeBlock) {
        inCodeBlock = false;
        return '```\n' + line;
      }

      return line;
    });

    // Close any open code block
    if (inCodeBlock) {
      processedLines.push('```');
    }

    return processedLines.join('\n');
  }

  /**
   * Save markdown content to a file
   * @param content - Markdown content
   * @param outputPath - Path to save the file
   */
  private saveMarkdown(content: string, outputPath: string): void {
    const dir = path.dirname(outputPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, content, 'utf-8');
  }

  /**
   * Convert multiple PDF files to Markdown
   * @param pdfPaths - Array of PDF file paths
   * @param outputDir - Directory to save the markdown files
   * @param options - Conversion options
   */
  async convertMultiple(
    pdfPaths: string[],
    outputDir: string,
    options: ConversionOptions = {}
  ): Promise<void> {
    for (const pdfPath of pdfPaths) {
      const baseName = path.basename(pdfPath, path.extname(pdfPath));
      const outputPath = path.join(outputDir, `${baseName}.md`);

      await this.convert(pdfPath, { ...options, outputPath });
      console.log(`Converted: ${pdfPath} -> ${outputPath}`);
    }
  }
}
