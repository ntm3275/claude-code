import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

export interface ResizeOptions {
  width?: number;
  height?: number;
  outputPath?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format?: 'jpeg' | 'png' | 'webp' | 'tiff' | 'avif';
  quality?: number;
  maintainAspectRatio?: boolean;
}

export interface ImageInfo {
  format: string;
  width: number;
  height: number;
  size: number;
}

export class ImageResizer {
  /**
   * Resize an image file
   * @param inputPath - Path to the input image file
   * @param options - Resize options
   * @returns Information about the resized image
   */
  async resize(inputPath: string, options: ResizeOptions = {}): Promise<ImageInfo> {
    try {
      // Check if input file exists
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
      }

      // Get input image metadata
      const metadata = await sharp(inputPath).metadata();

      // Set default values
      const {
        width,
        height,
        outputPath,
        fit = 'inside',
        format,
        quality = 80,
        maintainAspectRatio = true,
      } = options;

      // Validate dimensions
      if (!width && !height) {
        throw new Error('At least one dimension (width or height) must be specified');
      }

      // Create sharp instance
      let image = sharp(inputPath);

      // Apply resize
      const resizeOptions: any = {
        fit: maintainAspectRatio ? fit : 'fill',
      };

      if (width) resizeOptions.width = width;
      if (height) resizeOptions.height = height;

      image = image.resize(resizeOptions);

      // Determine output format
      const outputFormat = format || this.getFormatFromPath(outputPath) || metadata.format || 'jpeg';

      // Apply format-specific options
      switch (outputFormat) {
        case 'jpeg':
          image = image.jpeg({ quality });
          break;
        case 'png':
          image = image.png({ quality });
          break;
        case 'webp':
          image = image.webp({ quality });
          break;
        case 'tiff':
          image = image.tiff({ quality });
          break;
        case 'avif':
          image = image.avif({ quality });
          break;
      }

      // Generate output path if not specified
      const finalOutputPath = outputPath || this.generateOutputPath(inputPath, width, height, outputFormat);

      // Ensure output directory exists
      const outputDir = path.dirname(finalOutputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Save the resized image
      await image.toFile(finalOutputPath);

      // Get output image info
      const outputMetadata = await sharp(finalOutputPath).metadata();
      const stats = fs.statSync(finalOutputPath);

      return {
        format: outputMetadata.format || outputFormat,
        width: outputMetadata.width || 0,
        height: outputMetadata.height || 0,
        size: stats.size,
      };
    } catch (error) {
      throw new Error(`Failed to resize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Resize multiple images
   * @param inputPaths - Array of input image paths
   * @param outputDir - Directory to save resized images
   * @param options - Resize options
   */
  async resizeMultiple(
    inputPaths: string[],
    outputDir: string,
    options: ResizeOptions = {}
  ): Promise<void> {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const inputPath of inputPaths) {
      try {
        const baseName = path.basename(inputPath, path.extname(inputPath));
        const ext = options.format || path.extname(inputPath).slice(1) || 'jpg';
        const outputPath = path.join(outputDir, `${baseName}_resized.${ext}`);

        const info = await this.resize(inputPath, { ...options, outputPath });
        console.log(`Resized: ${inputPath} -> ${outputPath}`);
        console.log(`  Dimensions: ${info.width}x${info.height}, Size: ${this.formatFileSize(info.size)}`);
      } catch (error) {
        console.error(`Failed to resize ${inputPath}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  /**
   * Get supported image formats
   * @returns Array of supported format extensions
   */
  getSupportedFormats(): string[] {
    return ['jpeg', 'jpg', 'png', 'webp', 'tiff', 'tif', 'avif', 'gif', 'svg', 'heif', 'heic'];
  }

  /**
   * Get format from file path
   * @param filePath - File path
   * @returns Format or undefined
   */
  private getFormatFromPath(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    const ext = path.extname(filePath).slice(1).toLowerCase();
    if (ext === 'jpg') return 'jpeg';
    if (ext === 'tif') return 'tiff';
    return ext as any;
  }

  /**
   * Generate output path for resized image
   * @param inputPath - Input image path
   * @param width - Target width
   * @param height - Target height
   * @param format - Output format
   * @returns Generated output path
   */
  private generateOutputPath(inputPath: string, width?: number, height?: number, format?: string): string {
    const dir = path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const ext = format || path.extname(inputPath).slice(1) || 'jpg';

    const dimensions = [];
    if (width) dimensions.push(`w${width}`);
    if (height) dimensions.push(`h${height}`);
    const dimensionStr = dimensions.length > 0 ? `_${dimensions.join('x')}` : '_resized';

    return path.join(dir, `${baseName}${dimensionStr}.${ext}`);
  }

  /**
   * Format file size to human-readable string
   * @param bytes - File size in bytes
   * @returns Formatted string
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
