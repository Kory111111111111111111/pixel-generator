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
  algorithm: 'kmeans' | 'median-cut' | 'octree'
): Uint8ClampedArray {
  switch (algorithm) {
    case 'kmeans':
      return reduceColorsKMeans(data, colorCount);
    case 'median-cut':
      return reduceColorsMedianCut(data, colorCount);
    case 'octree':
      return reduceColorsOctree(data, colorCount);
    default:
      // Fallback to simple quantization
      return reduceColorsSimple(data, colorCount);
  }
}

/**
 * Simple quantization - group similar colors
 */
function reduceColorsSimple(data: Uint8ClampedArray, colorCount: number): Uint8ClampedArray {
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
 * K-means clustering for color reduction
 */
function reduceColorsKMeans(data: Uint8ClampedArray, colorCount: number): Uint8ClampedArray {
  // Extract unique colors
  const colors = new Map<string, number>();
  for (let i = 0; i < data.length; i += 4) {
    const color = `${data[i]},${data[i + 1]},${data[i + 2]}`;
    colors.set(color, (colors.get(color) || 0) + 1);
  }
  
  // Initialize centroids randomly
  const colorArray = Array.from(colors.keys()).map(c => c.split(',').map(Number));
  const centroids: number[][] = [];
  for (let i = 0; i < colorCount && i < colorArray.length; i++) {
    centroids.push([...colorArray[i % colorArray.length]]);
  }
  
  // K-means iterations
  for (let iter = 0; iter < 10; iter++) {
    const clusters: number[][][] = Array(colorCount).fill(null).map(() => []);
    
    // Assign colors to nearest centroid
    for (const color of colorArray) {
      let minDist = Infinity;
      let closestCentroid = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const dist = Math.sqrt(
          Math.pow(color[0] - centroids[i][0], 2) +
          Math.pow(color[1] - centroids[i][1], 2) +
          Math.pow(color[2] - centroids[i][2], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          closestCentroid = i;
        }
      }
      
      clusters[closestCentroid].push(color);
    }
    
    // Update centroids
    for (let i = 0; i < centroids.length; i++) {
      if (clusters[i].length > 0) {
        centroids[i] = [
          Math.round(clusters[i].reduce((sum, c) => sum + c[0], 0) / clusters[i].length),
          Math.round(clusters[i].reduce((sum, c) => sum + c[1], 0) / clusters[i].length),
          Math.round(clusters[i].reduce((sum, c) => sum + c[2], 0) / clusters[i].length)
        ];
      }
    }
  }
  
  // Map original colors to nearest centroids
  const newData = new Uint8ClampedArray(data);
  for (let i = 0; i < data.length; i += 4) {
    const color = [data[i], data[i + 1], data[i + 2]];
    let minDist = Infinity;
    let closestCentroid = centroids[0];
    
    for (const centroid of centroids) {
      const dist = Math.sqrt(
        Math.pow(color[0] - centroid[0], 2) +
        Math.pow(color[1] - centroid[1], 2) +
        Math.pow(color[2] - centroid[2], 2)
      );
      if (dist < minDist) {
        minDist = dist;
        closestCentroid = centroid;
      }
    }
    
    newData[i] = closestCentroid[0];
    newData[i + 1] = closestCentroid[1];
    newData[i + 2] = closestCentroid[2];
  }
  
  return newData;
}

/**
 * Median cut algorithm for color reduction
 */
function reduceColorsMedianCut(data: Uint8ClampedArray, colorCount: number): Uint8ClampedArray {
  // Extract unique colors with frequency
  const colorMap = new Map<string, { color: number[], count: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const color = `${data[i]},${data[i + 1]},${data[i + 2]}`;
    if (colorMap.has(color)) {
      colorMap.get(color)!.count++;
    } else {
      colorMap.set(color, { color: [data[i], data[i + 1], data[i + 2]], count: 1 });
    }
  }
  
  const colors = Array.from(colorMap.values());
  
  // Median cut algorithm
  const buckets = [colors];
  while (buckets.length < colorCount && buckets.some(b => b.length > 1)) {
    // Find bucket with largest range
    let maxRange = 0;
    let bucketIndex = 0;
    let splitChannel = 0;
    
    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (bucket.length <= 1) continue;
      
      // Calculate range for each channel
      const ranges = [0, 1, 2].map(channel => {
        const values = bucket.map(c => c.color[channel]);
        return Math.max(...values) - Math.min(...values);
      });
      
      const maxChannelRange = Math.max(...ranges);
      if (maxChannelRange > maxRange) {
        maxRange = maxChannelRange;
        bucketIndex = i;
        splitChannel = ranges.indexOf(maxChannelRange);
      }
    }
    
    // Split the bucket
    const bucket = buckets[bucketIndex];
    bucket.sort((a, b) => a.color[splitChannel] - b.color[splitChannel]);
    const median = Math.floor(bucket.length / 2);
    
    buckets[bucketIndex] = bucket.slice(0, median);
    buckets.push(bucket.slice(median));
  }
  
  // Calculate representative color for each bucket
  const representativeColors = buckets.map(bucket => {
    if (bucket.length === 0) return [0, 0, 0];
    
    const totalCount = bucket.reduce((sum, c) => sum + c.count, 0);
    return [
      Math.round(bucket.reduce((sum, c) => sum + c.color[0] * c.count, 0) / totalCount),
      Math.round(bucket.reduce((sum, c) => sum + c.color[1] * c.count, 0) / totalCount),
      Math.round(bucket.reduce((sum, c) => sum + c.color[2] * c.count, 0) / totalCount)
    ];
  });
  
  // Map original colors to representative colors
  const newData = new Uint8ClampedArray(data);
  for (let i = 0; i < data.length; i += 4) {
    const color = [data[i], data[i + 1], data[i + 2]];
    let minDist = Infinity;
    let closestColor = representativeColors[0];
    
    for (const repColor of representativeColors) {
      const dist = Math.sqrt(
        Math.pow(color[0] - repColor[0], 2) +
        Math.pow(color[1] - repColor[1], 2) +
        Math.pow(color[2] - repColor[2], 2)
      );
      if (dist < minDist) {
        minDist = dist;
        closestColor = repColor;
      }
    }
    
    newData[i] = closestColor[0];
    newData[i + 1] = closestColor[1];
    newData[i + 2] = closestColor[2];
  }
  
  return newData;
}

/**
 * Octree algorithm for color reduction (simplified)
 */
function reduceColorsOctree(data: Uint8ClampedArray, colorCount: number): Uint8ClampedArray {
  // Simplified octree implementation
  // Group colors by quantizing to fewer bits per channel
  const bitsPerChannel = Math.floor(Math.log2(colorCount) / 3);
  const step = Math.floor(256 / (1 << bitsPerChannel));
  
  const newData = new Uint8ClampedArray(data);
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
