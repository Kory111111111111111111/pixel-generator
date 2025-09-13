'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateImageFile } from '@/lib/pixelation';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onClearImage: () => void;
}

export default function ImageUpload({ onImageSelect, selectedImage, onClearImage }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    const validation = validateImageFile(file);
    
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    onImageSelect(file);
    toast.success('Image uploaded successfully!');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Image
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Upload an image to convert it to pixel art
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedImage ? (
          <div className="space-y-4">
            <div className="relative">
              <div className="flex justify-center">
                <Image
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected image"
                  width={200}
                  height={200}
                  className="max-w-full h-auto border-2 rounded-lg object-cover"
                />
              </div>
              <Button
                onClick={onClearImage}
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleUploadClick}
          >
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground mb-2">Drop an image here or click to upload</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports JPEG, PNG, GIF, and WebP (max 10MB)
            </p>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
