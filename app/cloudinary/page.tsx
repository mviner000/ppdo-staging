"use client";

import React, { useState } from 'react';
import { Upload, Trash2, X, Image, Loader2, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface PreviewFile {
  file: File;
  preview: string;
  id: string;
}

export default function MediaGallery() {
  const media = useQuery(api.media.getMyMedia);
  
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const uploadMedia = useMutation(api.media.uploadMedia);
  const deleteMediaMutation = useMutation(api.media.deleteMedia);
  
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string>('');
  const [viewImage, setViewImage] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: PreviewFile[] = [];
    let hasError = false;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        hasError = true;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        hasError = true;
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        validFiles.push({
          file,
          preview: reader.result as string,
          id: `${Date.now()}-${Math.random()}`
        });
        
        if (validFiles.length === files.length - (hasError ? 1 : 0)) {
          setSelectedFiles(prev => [...prev, ...validFiles]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (!hasError) {
      setError('');
    }

    // Reset input
    e.target.value = '';
  };

  const removePreview = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError('');
    const progress: { [key: string]: boolean } = {};

    try {
      for (const fileItem of selectedFiles) {
        const uploadUrl = await generateUploadUrl();
        
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': fileItem.file.type },
          body: fileItem.file,
        });

        if (!result.ok) {
          throw new Error(`Upload failed for ${fileItem.file.name}`);
        }

        const { storageId } = await result.json();

        await uploadMedia({
          storageId,
          name: fileItem.file.name,
          type: fileItem.file.type,
          size: fileItem.file.size,
        });

        progress[fileItem.id] = true;
        setUploadProgress({ ...progress });
      }

      // Clear after successful upload
      setSelectedFiles([]);
      setUploadProgress({});
      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  if (media === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Media Gallery</h1>
          <p className="text-slate-600">Upload and manage your images</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 border-2 border-dashed border-slate-300 bg-white">
          <CardContent className="p-6">
            {selectedFiles.length === 0 ? (
              <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                <Upload className="w-12 h-12 text-slate-400 mb-4" />
                <span className="text-lg font-medium text-slate-700 mb-2">
                  Click to upload images
                </span>
                <span className="text-sm text-slate-500">Select multiple PNG, JPG, GIF (up to 5MB each)</span>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            ) : (
              <div className="space-y-4">
                {/* Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {selectedFiles.map((fileItem) => (
                    <div key={fileItem.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={fileItem.preview}
                          alt={fileItem.file.name}
                          className="w-full h-full object-cover"
                        />
                        {uploadProgress[fileItem.id] && (
                          <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center">
                            <Check className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      {!uploading && (
                        <button
                          onClick={() => removePreview(fileItem.id)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <p className="text-xs text-slate-600 truncate mt-1" title={fileItem.file.name}>
                        {fileItem.file.name}
                      </p>
                    </div>
                  ))}
                  
                  {/* Add More Button */}
                  {!uploading && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs text-slate-600">Add more</span>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-slate-600">
                    {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    {!uploading && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedFiles([])}
                      >
                        Clear All
                      </Button>
                    )}
                    <Button
                      onClick={handleUploadAll}
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading {Object.keys(uploadProgress).length}/{selectedFiles.length}
                        </>
                      ) : (
                        `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Gallery Section - Tile View (Facebook Style) */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Gallery <span className="text-slate-500 text-lg">({media?.length ?? 0})</span>
          </h2>
        </div>

        {!media || media.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Image className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No images uploaded yet</p>
              <p className="text-slate-400 text-sm">Upload your first images to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {media.map((item) => (
              <div key={item._id} className="break-inside-avoid">
                <Card className="group overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    {item.url ? (
                      <div className="relative">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-auto cursor-pointer"
                          onClick={() => setViewImage(item.url!)}
                          style={{ 
                            display: 'block',
                            width: '100%',
                            height: 'auto'
                          }}
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div style="width:100%;height:200px;display:flex;align-items:center;justify-content:center;background:#fee;color:#c00;">Failed to load</div>';
                            }
                          }}
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewImage(item.url!);
                            }}
                          >
                            View
                          </Button>
                          <a
                            href={item.url}
                            download={item.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="secondary" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </a>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item._id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-slate-100">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                      </div>
                    )}
                    
                    {/* Image Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-slate-900 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-500">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(item.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Image Viewer Modal */}
        {viewImage && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
            onClick={() => setViewImage('')}
          >
            <button
              className="absolute top-4 right-4 p-3 bg-white rounded-full hover:bg-slate-100 transition-colors z-10 shadow-xl"
              onClick={() => setViewImage('')}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative max-w-6xl max-h-full">
              <img
                src={viewImage}
                alt="Full view"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}