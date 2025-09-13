'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { PixelationOptions } from '@/lib/pixelation';

interface PixelationSettingsProps {
  options: PixelationOptions;
  onOptionsChange: (options: PixelationOptions) => void;
}

export default function PixelationSettings({ options, onOptionsChange }: PixelationSettingsProps) {
  const updateOption = <K extends keyof PixelationOptions>(
    key: K,
    value: PixelationOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Pixelation Settings
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Customize how your image will be pixelated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pixel Size */}
        <div className="space-y-2">
          <Label className="text-foreground">Pixel Size: {options.pixelSize}px</Label>
          <Slider
            value={[options.pixelSize]}
            onValueChange={([value]) => updateOption('pixelSize', value)}
            min={2}
            max={32}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2px (fine detail)</span>
            <span>32px (chunky)</span>
          </div>
        </div>

        {/* Color Count */}
        <div className="space-y-2">
          <Label className="text-foreground">Color Count: {options.colorCount} colors</Label>
          <Slider
            value={[options.colorCount]}
            onValueChange={([value]) => updateOption('colorCount', value)}
            min={4}
            max={64}
            step={2}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4 colors (minimal)</span>
            <span>64 colors (detailed)</span>
          </div>
        </div>

        {/* Algorithm */}
        <div className="space-y-2">
          <Label className="text-foreground">Color Reduction Algorithm</Label>
          <Select
            value={options.algorithm}
            onValueChange={(value: 'kmeans' | 'median-cut' | 'octree') => 
              updateOption('algorithm', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kmeans">K-Means (balanced)</SelectItem>
              <SelectItem value="median-cut">Median Cut (fast)</SelectItem>
              <SelectItem value="octree">Octree (quality)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dithering */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-foreground">Dithering</Label>
            <p className="text-xs text-muted-foreground">
              Adds noise to reduce color banding
            </p>
          </div>
          <Switch
            checked={options.dithering}
            onCheckedChange={(checked) => updateOption('dithering', checked)}
          />
        </div>

        {/* Lego Effect */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-foreground">Lego Effect</Label>
            <p className="text-xs text-muted-foreground">
              Creates block-like appearance
            </p>
          </div>
          <Switch
            checked={options.legoEffect}
            onCheckedChange={(checked) => updateOption('legoEffect', checked)}
          />
        </div>

        {/* Grid Size (only show when lego effect is enabled) */}
        {options.legoEffect && (
          <div className="space-y-2">
            <Label className="text-foreground">Grid Size: {options.gridSize || options.pixelSize}px</Label>
            <Slider
              value={[options.gridSize || options.pixelSize]}
              onValueChange={([value]) => updateOption('gridSize', value)}
              min={2}
              max={64}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2px</span>
              <span>64px</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
