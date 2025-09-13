'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Download, Palette, RefreshCw, Settings } from 'lucide-react';
import { generatePixelArt, PixelArtRequest } from '@/lib/gemini';
import { toast } from 'sonner';
import Image from 'next/image';

export default function PixelArtGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('16-bit retro gaming');
  const [size, setSize] = useState('32x32');
  const [colors, setColors] = useState(16);
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<Array<{
    id: string;
    prompt: string;
    image: string;
    timestamp: Date;
  }>>([]);
  const [showApiKeyField, setShowApiKeyField] = useState(false);

  const styleOptions = [
    '16-bit retro gaming',
    '8-bit classic',
    'Modern pixel art',
    'Minimalist',
    'Fantasy RPG',
    'Sci-fi cyberpunk',
    'Cute chibi',
    'Dark gothic'
  ];

  const sizeOptions = [
    '16x16',
    '32x32',
    '64x64',
    '128x128',
    '256x256'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!apiKey.trim()) {
      toast.error('Please enter your Google Gemini API key');
      setShowApiKeyField(true);
      return;
    }

    setIsGenerating(true);
    
    try {
      const request: PixelArtRequest = {
        prompt: prompt.trim(),
        style,
        size,
        colors,
        apiKey: apiKey.trim()
      };

      const result = await generatePixelArt(request);
      
      if (result.success && result.imageData) {
        const newArt = {
          id: Date.now().toString(),
          prompt: prompt.trim(),
          image: result.imageData,
          timestamp: new Date()
        };
        
        setGeneratedImage(result.imageData);
        setGenerationHistory(prev => [newArt, ...prev]);
        toast.success('Pixel art generated successfully!');
      } else {
        toast.error(result.error || 'Failed to generate pixel art');
      }
    } catch (error) {
      toast.error('An error occurred while generating pixel art');
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageData: string, filename?: string) => {
    const link = document.createElement('a');
    link.download = filename || `pixel-art-${Date.now()}.png`;
    link.href = imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearHistory = () => {
    setGenerationHistory([]);
    setGeneratedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎨 Pixel Art Generator
          </h1>
          <p className="text-gray-300 text-lg mb-4">
            Create stunning pixel art with AI-powered generation
          </p>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-200 text-sm">
              <strong>Getting Started:</strong> You&apos;ll need a free Google Gemini API key. 
              Click &quot;Show API Key Field&quot; below and get your key from{' '}
              <a 
                href="https://makersuite.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline font-semibold"
              >
                Google AI Studio
              </a>
              {' '}to start generating pixel art!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generation Panel */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Generate New Art
              </CardTitle>
              <CardDescription className="text-gray-300">
                Describe your vision and let AI create pixel art for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Key Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Google Gemini API Key</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKeyField(!showApiKeyField)}
                    className="text-gray-300 hover:text-white text-xs"
                  >
                    {showApiKeyField ? 'Hide' : 'Show'} API Key Field
                  </Button>
                </div>
                {showApiKeyField && (
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Enter your Google Gemini API key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                    />
                    <p className="text-xs text-gray-400">
                      Get your free API key from{' '}
                      <a 
                        href="https://makersuite.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:text-blue-200 underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                )}
                {!showApiKeyField && apiKey && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                      ✓ API Key Set
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 4)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-white">Describe your pixel art</Label>
                <Input
                  id="prompt"
                  placeholder="A cute cat sitting on a rainbow cloud..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styleOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Size</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Color Palette: {colors} colors</Label>
                <Slider
                  value={[colors]}
                  onValueChange={([value]) => setColors(value)}
                  min={4}
                  max={32}
                  step={2}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>4 colors</span>
                  <span>32 colors</span>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4 mr-2" />
                    Generate Pixel Art
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Image Display */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Generated Art
              </CardTitle>
              <CardDescription className="text-gray-300">
                Your AI-generated pixel art will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Image
                      src={generatedImage}
                      alt="Generated pixel art"
                      width={256}
                      height={256}
                      className="max-w-full h-auto border-2 border-white/20 rounded-lg"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(generatedImage)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => setGeneratedImage(null)}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-white/30 rounded-lg">
                  <div className="text-center text-gray-400">
                    <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No pixel art generated yet</p>
                    <p className="text-sm">Enter a prompt and click generate</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generation History */}
        {generationHistory.length > 0 && (
          <Card className="mt-6 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Generation History</CardTitle>
                <Button
                  onClick={handleClearHistory}
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Clear History
                </Button>
              </div>
              <CardDescription className="text-gray-300">
                Your previously generated pixel art
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {generationHistory.map((item) => (
                  <div key={item.id} className="group relative">
                    <Image
                      src={item.image}
                      alt={item.prompt}
                      width={96}
                      height={96}
                      className="w-full h-24 object-cover rounded-lg border border-white/20 cursor-pointer hover:border-white/40 transition-colors"
                      style={{ imageRendering: 'pixelated' }}
                      onClick={() => setGeneratedImage(item.image)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        onClick={() => handleDownload(item.image, `pixel-art-${item.id}.png`)}
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate" title={item.prompt}>
                      {item.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
