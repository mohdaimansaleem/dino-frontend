import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardMedia,
  CardActions,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Visibility,
  Close,
  PhotoCamera,
  CheckCircle
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { storageService, UploadResponse } from '../utils/storage';

interface ImageUploadProps {
  onUpload?: (response: UploadResponse) => void;
  onError?: (error: string) => void;
  folder?: string;
  maxFiles?: number;
  multiple?: boolean;
  optimize?: boolean;
  generateThumbnails?: boolean;
  existingImages?: string[];
  onImagesChange?: (images: string[]) => void;
  disabled?: boolean;
  variant?: 'standard' | 'profile' | 'menu-item' | 'cafe-logo' | 'cafe-cover';
  cafeId?: string;
  menuItemId?: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  response?: UploadResponse;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onError,
  folder,
  maxFiles = 5,
  multiple = true,
  optimize = true,
  generateThumbnails = false,
  existingImages = [],
  onImagesChange,
  disabled = false,
  variant = 'standard',
  cafeId,
  menuItemId
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled) return;

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }));

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    } else {
      setFiles(newFiles.slice(0, 1));
    }
  }, [disabled, multiple, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple,
    maxFiles,
    disabled: disabled || uploading
  });

  const uploadFile = async (fileData: UploadedFile, index: number) => {
    try {
      // Update file status to uploading
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: true, error: undefined } : f
      ));

      let response: UploadResponse;

      // Use specific upload method based on variant
      switch (variant) {
        case 'profile':
          response = await storageService.uploadProfileImage(fileData.file);
          break;
        case 'menu-item':
          if (!menuItemId) throw new Error('Menu item ID is required');
          response = await storageService.uploadMenuItemImage(fileData.file, menuItemId);
          break;
        case 'cafe-logo':
          if (!cafeId) throw new Error('Cafe ID is required');
          response = await storageService.uploadCafeLogo(fileData.file, cafeId);
          break;
        case 'cafe-cover':
          if (!cafeId) throw new Error('Cafe ID is required');
          response = await storageService.uploadCafeCover(fileData.file, cafeId);
          break;
        default:
          response = await storageService.uploadImage(
            fileData.file,
            folder,
            optimize,
            generateThumbnails
          );
      }

      // Update file status to uploaded
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          uploading: false, 
          uploaded: true, 
          response 
        } : f
      ));

      // Call callbacks
      if (onUpload) {
        onUpload(response);
      }

      if (onImagesChange) {
        const newImages = [...existingImages, response.fileUrl];
        onImagesChange(newImages);
      }

    } catch (error: any) {
      // Update file status with error
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          uploading: false, 
          uploaded: false, 
          error: error.message 
        } : f
      ));

      if (onError) {
        onError(error.message);
      }
    }
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.uploaded && !file.uploading) {
          await uploadFile(file, i);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return newFiles;
    });
  };

  const removeExistingImage = (imageUrl: string) => {
    if (onImagesChange) {
      const newImages = existingImages.filter(img => img !== imageUrl);
      onImagesChange(newImages);
    }
  };

  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  const getUploadProgress = () => {
    if (files.length === 0) return 0;
    const uploadedCount = files.filter(f => f.uploaded).length;
    return (uploadedCount / files.length) * 100;
  };

  const hasErrors = files.some(f => f.error);
  const allUploaded = files.length > 0 && files.every(f => f.uploaded);

  return (
    <Box>
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Images
          </Typography>
          <Grid container spacing={2}>
            {existingImages.map((imageUrl, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="120"
                    image={imageUrl}
                    alt={`Existing image ${index + 1}`}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => openPreview(imageUrl)}
                  />
                  <CardActions sx={{ justifyContent: 'center', p: 1 }}>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => openPreview(imageUrl)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => removeExistingImage(imageUrl)}
                        disabled={disabled}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Upload Area */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            bgcolor: disabled ? 'background.paper' : 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to select files
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<PhotoCamera />}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          Choose Files
        </Button>
        
        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
          Supported formats: JPEG, PNG, WebP, GIF (max {storageService.formatFileSize(5 * 1024 * 1024)})
          {multiple && ` • Max ${maxFiles} files`}
        </Typography>
      </Box>

      {/* File List */}
      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Files ({files.length})
          </Typography>
          
          <Grid container spacing={2}>
            {files.map((fileData, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="120"
                    image={fileData.preview}
                    alt={fileData.file.name}
                  />
                  
                  <Box sx={{ p: 1 }}>
                    <Typography variant="caption" noWrap>
                      {fileData.file.name}
                    </Typography>
                    
                    <Typography variant="caption" display="block" color="text.secondary">
                      {storageService.formatFileSize(fileData.file.size)}
                    </Typography>
                    
                    {fileData.uploading && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress />
                        <Typography variant="caption" color="primary">
                          Uploading...
                        </Typography>
                      </Box>
                    )}
                    
                    {fileData.uploaded && (
                      <Chip
                        icon={<CheckCircle />}
                        label="Uploaded"
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                    
                    {fileData.error && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        <Typography variant="caption">
                          {fileData.error}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                  
                  <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => openPreview(fileData.preview)}
                    >
                      <Visibility />
                    </IconButton>
                    
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => removeFile(index)}
                      disabled={fileData.uploading}
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Upload Progress */}
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Upload Progress: {Math.round(getUploadProgress())}%
              </Typography>
              <LinearProgress variant="determinate" value={getUploadProgress()} />
            </Box>
          )}
          
          {/* Upload Button */}
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={uploadAllFiles}
              disabled={uploading || allUploaded || files.length === 0}
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>
          </Box>
          
          {/* Status Messages */}
          {allUploaded && (
            <Alert severity="success" sx={{ mt: 2 }}>
              All files uploaded successfully!
            </Alert>
          )}
          
          {hasErrors && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Some files failed to upload. Please check the errors above.
            </Alert>
          )}
        </Box>
      )}

      {/* Image Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Image Preview
          <IconButton onClick={() => setPreviewOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUpload;