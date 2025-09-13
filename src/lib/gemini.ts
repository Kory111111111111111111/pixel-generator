import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PixelArtRequest {
  prompt: string;
  style?: string;
  size?: string;
  colors?: number;
  apiKey: string;
}

export interface PixelArtResponse {
  success: boolean;
  imageData?: string;
  error?: string;
}

export async function generatePixelArt(request: PixelArtRequest): Promise<PixelArtResponse> {
  try {
    if (!request.apiKey) {
      throw new Error('Gemini API key is required');
    }

    // Basic API key validation
    if (request.apiKey.length < 20) {
      throw new Error('Invalid API key format');
    }

    const genAI = new GoogleGenerativeAI(request.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Create a pixel art image based on this description: "${request.prompt}". 
    Style: ${request.style || '16-bit retro gaming'}. 
    Size: ${request.size || '32x32 pixels'}. 
    Color palette: ${request.colors || '16 colors maximum'}.
    
    Please generate a detailed description of the pixel art that can be used to create the actual image using HTML Canvas and pixel manipulation. Include specific details about:
    - Overall composition and layout
    - Color palette with hex codes
    - Pixel placement instructions
    - Any patterns or textures
    - Lighting and shading details
    
    Format the response as a JSON object with the following structure:
    {
      "description": "detailed description",
      "palette": ["#hex1", "#hex2", ...],
      "instructions": "step-by-step pixel placement guide"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(text);
    
    // For now, we'll return a placeholder image data
    // In a real implementation, you'd use the parsed response to generate actual pixel art
    return {
      success: true,
      imageData: generatePlaceholderPixelArt(parsedResponse)
    };
    
  } catch (error) {
    console.error('Error generating pixel art:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid API key. Please check your Google Gemini API key.';
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        errorMessage = 'API quota exceeded. Please try again later.';
      } else if (error.message.includes('PERMISSION_DENIED')) {
        errorMessage = 'Permission denied. Please check your API key permissions.';
      } else if (error.message.includes('INVALID_ARGUMENT')) {
        errorMessage = 'Invalid request. Please check your prompt and try again.';
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

function generatePlaceholderPixelArt(parsedResponse: { palette?: string[] }): string {
  // Create a simple canvas-based pixel art placeholder
  // This is a simplified version - in production, you'd implement actual pixel art generation
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = 64;
  canvas.height = 64;
  
  // Create a simple pixelated pattern based on the description
  const palette = parsedResponse.palette || ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  
  for (let y = 0; y < 64; y += 4) {
    for (let x = 0; x < 64; x += 4) {
      const colorIndex = Math.floor(Math.random() * palette.length);
      ctx.fillStyle = palette[colorIndex];
      ctx.fillRect(x, y, 4, 4);
    }
  }
  
  return canvas.toDataURL('image/png');
}
