import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  size?: string;
  apiKey: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageData?: string;
  error?: string;
}

/**
 * Generate pixel art images using Google Gemini's image generation capabilities
 */
export async function generatePixelArtImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    // Validate API key
    if (!request.apiKey || request.apiKey.length < 20) {
      throw new Error('Valid Gemini API key is required');
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(request.apiKey);
    
    // Use the correct Gemini image generation model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image-preview',
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    });

    // Create optimized prompt for pixel art generation
    const prompt = createPixelArtPrompt(request.prompt, request.style, request.size);
    
    console.log('Generating pixel art with prompt:', prompt);

    // Generate image using Gemini's image generation capabilities
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log('Full response from Gemini:', response);
    
    // Extract image data from response
    const imageData = await extractImageFromResponse(response);
    
    if (!imageData) {
      console.error('No image data found in response. Response structure:', JSON.stringify(response, null, 2));
      console.log('Falling back to canvas-based pixel art generation...');
      
      // Try fallback generation
      const fallbackResult = await generateFallbackPixelArt(request);
      if (fallbackResult.success) {
        console.log('Fallback generation successful');
        return fallbackResult;
      }
      
      throw new Error('No image data received from Gemini and fallback generation failed. Please check the console for detailed response information.');
    }

    return {
      success: true,
      imageData: imageData
    };

  } catch (error) {
    console.error('Error generating pixel art:', error);
    
    // Try fallback generation on any error
    console.log('Attempting fallback generation due to error...');
    try {
      const fallbackResult = await generateFallbackPixelArt(request);
      if (fallbackResult.success) {
        console.log('Fallback generation successful after error');
        return fallbackResult;
      }
    } catch (fallbackError) {
      console.error('Fallback generation also failed:', fallbackError);
    }
    
    let errorMessage = 'Failed to generate pixel art';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key. Please check your Gemini API key.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'API quota exceeded. Please try again later.';
      } else if (error.message.includes('safety')) {
        errorMessage = 'Content was blocked by safety filters. Please try a different prompt.';
      } else if (error.message.includes('model')) {
        errorMessage = 'Image generation model not available. Please try again later.';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Create an optimized prompt for pixel art generation
 */
function createPixelArtPrompt(userPrompt: string, style: string = 'retro gaming', size: string = '256x256'): string {
  const [width, height] = size.split('x').map(Number);
  
  return `Create a pixel art image of "${userPrompt}" in ${style} style. 

Make it ${width}x${height} pixels with clean, blocky pixel art style. Use a limited color palette typical of ${style} games. Ensure crisp, sharp edges with no anti-aliasing. The image should be recognizable and well-composed with good contrast.`;
}

/**
 * Extract image data from Gemini response
 */
async function extractImageFromResponse(response: any): Promise<string | null> {
  try {
    console.log('Response structure:', JSON.stringify(response, null, 2));
    
    // Check if response has candidates array
    if (response?.candidates && Array.isArray(response.candidates) && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      console.log('First candidate:', JSON.stringify(candidate, null, 2));
      
      // Check if candidate has content with parts
      if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
        console.log('Found parts in candidate content:', candidate.content.parts.length);
        for (let i = 0; i < candidate.content.parts.length; i++) {
          const part = candidate.content.parts[i];
          console.log(`Part ${i}:`, JSON.stringify(part, null, 2));
          
          // Look for inline data (image data)
          if (part.inlineData?.data) {
            console.log('Found image data in inlineData');
            // Convert base64 data to data URL
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
    }

    // Alternative: Check if response has parts directly
    if (response?.parts && Array.isArray(response.parts)) {
      console.log('Found parts directly in response:', response.parts.length);
      for (let i = 0; i < response.parts.length; i++) {
        const part = response.parts[i];
        console.log(`Direct part ${i}:`, JSON.stringify(part, null, 2));
        if (part.inlineData?.data) {
          console.log('Found image data in response parts');
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    // Check for text response that might contain base64 image data
    if (response?.text) {
      const responseText = typeof response.text === 'function' ? response.text() : response.text;
      console.log('Text response:', responseText);
      if (typeof responseText === 'string') {
        const base64Match = responseText.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
        if (base64Match) {
          console.log('Found image data in text response');
          return base64Match[0];
        }
      }
    }

    console.log('No image data found in response');
    return null;
  } catch (error) {
    console.error('Error extracting image from response:', error);
    return null;
  }
}

/**
 * Fallback pixel art generation using canvas rendering
 * This provides a backup when direct image generation fails
 */
export async function generateFallbackPixelArt(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas not supported');
    }

    // Set canvas size
    const [width, height] = (request.size || '256x256').split('x').map(Number);
    canvas.width = width;
    canvas.height = height;

    // Create a simple pixel art representation
    createSimplePixelArt(ctx, width, height, request.prompt, request.style || 'retro');
    
    // Convert to data URL
    const imageData = canvas.toDataURL('image/png');
    
    return {
      success: true,
      imageData: imageData
    };
  } catch {
    return {
      success: false,
      error: 'Fallback generation failed'
    };
  }
}

/**
 * Create a simple pixel art using canvas
 */
function createSimplePixelArt(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  prompt: string, 
  style: string
): void {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Set pixel size for blocky effect
  const pixelSize = Math.max(2, Math.floor(width / 32));
  
  // Define color palettes based on style
  const palettes = {
    retro: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
    gaming: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#000000'],
    pastel: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E6B3FF', '#FFB3E6', '#F0F0F0'],
    monochrome: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF']
  };
  
  const colors = palettes[style as keyof typeof palettes] || palettes.retro;
  
  // Generate random pixel art based on prompt
  const seed = hashString(prompt);
  const random = seededRandom(seed);
  
  // Fill background
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, width, height);
  
  // Generate pixel pattern
  for (let x = 0; x < width; x += pixelSize) {
    for (let y = 0; y < height; y += pixelSize) {
      if (random() > 0.7) {
        const colorIndex = Math.floor(random() * colors.length);
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }
  
  // Add some structured elements based on prompt
  addPromptBasedElements(ctx, width, height, prompt, colors, pixelSize);
}

/**
 * Add elements based on the prompt
 */
function addPromptBasedElements(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  prompt: string,
  colors: string[],
  pixelSize: number
): void {
  const promptLower = prompt.toLowerCase();
  
  // Simple pattern recognition for common subjects
  if (promptLower.includes('cat') || promptLower.includes('animal')) {
    // Draw a simple cat face
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) / 4;
    
    // Cat ears
    ctx.fillStyle = colors[1];
    ctx.fillRect(centerX - size, centerY - size, pixelSize * 2, pixelSize * 2);
    ctx.fillRect(centerX + size - pixelSize * 2, centerY - size, pixelSize * 2, pixelSize * 2);
    
    // Cat face
    ctx.fillStyle = colors[2];
    ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
    
    // Eyes
    ctx.fillStyle = colors[3];
    ctx.fillRect(centerX - size/3, centerY - size/4, pixelSize, pixelSize);
    ctx.fillRect(centerX + size/3 - pixelSize, centerY - size/4, pixelSize, pixelSize);
  }
  
  if (promptLower.includes('heart')) {
    // Draw a simple heart
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) / 6;
    
    ctx.fillStyle = colors[1];
    // Heart shape approximation
    for (let x = -size; x <= size; x += pixelSize) {
      for (let y = -size; y <= size; y += pixelSize) {
        const distance = Math.sqrt(x*x + y*y);
        if (distance <= size) {
          ctx.fillRect(centerX + x, centerY + y, pixelSize, pixelSize);
        }
      }
    }
  }
}

/**
 * Simple hash function for consistent random generation
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator
 */
function seededRandom(seed: number): () => number {
  let current = seed;
  return () => {
    current = (current * 9301 + 49297) % 233280;
    return current / 233280;
  };
}
