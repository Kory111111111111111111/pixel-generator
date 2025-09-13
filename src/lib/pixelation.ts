export interface PixelationOptions {
  pixelSize: number;
  colorCount: number;
  algorithm: 'kmeans' | 'median-cut' | 'octree';
  dithering: boolean;
  legoEffect: boolean;
  gridSize?: number;
}

export interface PixelationResult {
  success: boolean;
  imageData?: string;
  error?: string;
}

/**
 * Convert an image to pixel art using Canvas API
 */
export async function convertToPixelArt(
  imageFile: File,
  options: PixelationOptions
): Promise<PixelationResult> {
  try {
    const imageUrl = URL.createObjectURL(imageFile);
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            URL.revokeObjectURL(imageUrl);
            resolve({
              success: false,
              error: 'Could not get canvas context'
            });
            return;
          }

          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Apply pixelation
          const pixelatedData = pixelateImageData(data, canvas.width, canvas.height, options);
          
          // Apply color reduction if needed
          const reducedData = options.colorCount < 256 ? 
            reduceColors(pixelatedData, options.colorCount, options.algorithm) : 
            pixelatedData;

          // Create new image data
          const newImageData = new ImageData(new Uint8ClampedArray(reducedData), canvas.width, canvas.height);
          ctx.putImageData(newImageData, 0, 0);

          // Convert to data URL
          const result = canvas.toDataURL('image/png');
          
          URL.revokeObjectURL(imageUrl);
          resolve({
            success: true,
            imageData: result
          });
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to pixelate image'
          });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve({
          success: false,
          error: 'Failed to load image'
        });
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pixelate image'
    };
  }
}

/**
 * Apply pixelation effect using Canvas API
 */
export async function applyPixelationEffect(
  imageFile: File,
  pixelSize: number,
  legoEffect: boolean = false,
  gridSize?: number
): Promise<PixelationResult> {
  try {
    const imageUrl = URL.createObjectURL(imageFile);
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            URL.revokeObjectURL(imageUrl);
            resolve({
              success: false,
              error: 'Could not get canvas context'
            });
            return;
          }

          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Apply pixelation
          const pixelatedData = pixelateImageData(data, canvas.width, canvas.height, {
            pixelSize,
            colorCount: 256,
            algorithm: 'kmeans',
            dithering: false,
            legoEffect,
            gridSize: gridSize || pixelSize
          });

          // Create new image data
          const newImageData = new ImageData(new Uint8ClampedArray(pixelatedData), canvas.width, canvas.height);
          ctx.putImageData(newImageData, 0, 0);

          // Convert to data URL
          const result = canvas.toDataURL('image/png');
          
          URL.revokeObjectURL(imageUrl);
          resolve({
            success: true,
            imageData: result
          });
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to apply pixelation effect'
          });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve({
          success: false,
          error: 'Failed to load image'
        });
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply pixelation effect'
    };
  }
}

/**
 * Pixelate image data
 */
function pixelateImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options: PixelationOptions
): Uint8ClampedArray {
  const pixelSize = options.pixelSize;
  const newData = new Uint8ClampedArray(data);
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // Get the average color of the pixel block
      const blockWidth = Math.min(pixelSize, width - x);
      const blockHeight = Math.min(pixelSize, height - y);
      
      let r = 0, g = 0, b = 0, a = 0;
      let pixelCount = 0;
      
      for (let by = 0; by < blockHeight; by++) {
        for (let bx = 0; bx < blockWidth; bx++) {
          const pixelIndex = ((y + by) * width + (x + bx)) * 4;
          r += data[pixelIndex];
          g += data[pixelIndex + 1];
          b += data[pixelIndex + 2];
          a += data[pixelIndex + 3];
          pixelCount++;
        }
      }
      
      // Calculate average color
      r = Math.round(r / pixelCount);
      g = Math.round(g / pixelCount);
      b = Math.round(b / pixelCount);
      a = Math.round(a / pixelCount);
      
      // Apply the average color to all pixels in the block
      for (let by = 0; by < blockHeight; by++) {
        for (let bx = 0; bx < blockWidth; bx++) {
          const pixelIndex = ((y + by) * width + (x + bx)) * 4;
          newData[pixelIndex] = r;
          newData[pixelIndex + 1] = g;
          newData[pixelIndex + 2] = b;
          newData[pixelIndex + 3] = a;
        }
      }
    }
  }
  
  return newData;
}

/**
 * Reduce colors using simple quantization
 */
function reduceColors(
  data: Uint8ClampedArray,
  colorCount: number,
  _algorithm: 'kmeans' | 'median-cut' | 'octree'
): Uint8ClampedArray {
  // Simple color reduction - group similar colors
  const newData = new Uint8ClampedArray(data);
  const step = Math.floor(256 / Math.sqrt(colorCount));
  
  for (let i = 0; i < data.length; i += 4) {
    newData[i] = Math.floor(data[i] / step) * step;     // R
    newData[i + 1] = Math.floor(data[i + 1] / step) * step; // G
    newData[i + 2] = Math.floor(data[i + 2] / step) * step; // B
    // Keep alpha unchanged
  }
  
  return newData;
}

/**
 * Convert File to base64 data URL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type must be JPEG, PNG, GIF, or WebP' };
  }
  
  return { valid: true };
}

/**
 * Get default pixelation options
 */
export function getDefaultPixelationOptions(): PixelationOptions {
  return {
    pixelSize: 8,
    colorCount: 16,
    algorithm: 'kmeans',
    dithering: true,
    legoEffect: false,
    gridSize: 8
  };
}
