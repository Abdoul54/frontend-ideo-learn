import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, Typography, Paper, IconButton, LinearProgress } from '@mui/material';

// File type configurations
const FILE_TYPES = {
  image: {
    accept: 'image/*',
    icon: 'lucide-image',
    formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    formatString: 'JPG, PNG, GIF up to'
  },
  video: {
    accept: 'video/*',
    icon: 'lucide-video',
    formats: ['mp4', 'webm', 'mov'],
    formatString: 'MP4, WEBM, MOV up to'
  },
  pdf: {
    accept: 'application/pdf',
    icon: 'lucide-file',
    formats: ['pdf'],
    formatString: 'PDF up to'
  },
  favicon: {
    accept: 'image/x-icon,image/png',
    icon: 'lucide-file',
    formats: ['ico', 'png'],
    formatString: 'ICO, PNG up to'
  },
  document: {
    accept: '.doc,.docx,.txt,.pdf',
    icon: 'lucide-file-text',
    formats: ['doc', 'docx', 'txt', 'pdf'],
    formatString: 'DOC, PDF, TXT up to'
  }
};

const FileDropzone = ({
  type = 'image',
  maxSize = 5242880, // 5MB
  onFileSelect,
  label,
  helperText,
  defaultValue,
  className = ''
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(defaultValue ? { url: defaultValue, file: null } : null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Get file type configuration
  const fileConfig = useMemo(() => FILE_TYPES[type] || FILE_TYPES.image, [type]);

  // Generate preview for image files
  const [preview, setPreview] = useState(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = useCallback((file) => {
    if (!file) return true; // Allow no file to be selected

    const extension = file.name.split('.').pop().toLowerCase();

    if (!fileConfig.formats.includes(extension)) {
      setError(`Invalid file type. Please upload ${fileConfig.formats.join(', ')} files only.`);
      return false;
    }

    if (file.size > maxSize) {
      setError(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
      return false;
    }

    return true;
  }, [fileConfig, maxSize]);

  const generatePreview = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFile = useCallback((file) => {
    setError('');

    if (!file) {
      setFile(null);
      setPreview(null);
      onFileSelect?.(null);
      return;
    }

    if (validateFile(file)) {
      const fileData = {
        url: URL.createObjectURL(file),
        file: file
      };
      setFile(fileData);
      generatePreview(file);
      onFileSelect?.(file); // Pass the File object directly
      setIsUploading(true);
      setTimeout(() => setIsUploading(false), 1500);
    }
  }, [validateFile, generatePreview, onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleFileSelect = useCallback((e) => {
    handleFile(e.target.files[0]);
  }, [handleFile]);

  const removeFile = useCallback((e) => {
    e.stopPropagation();

    // Reset the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setFile(null);
    setPreview(null);
    setError('');
    onFileSelect?.(null);

    // Revoke object URL to prevent memory leaks
    if (file?.url && !file.url.startsWith('data:')) {
      URL.revokeObjectURL(file.url);
    }
  }, [file, onFileSelect]);

  return (
    <Box className={`${className}`}>
      <Typography variant="subtitle1" className="mb-2">{label}</Typography>
      <Paper
        variant="outlined"
        className={`
                    relative p-6 border-2 border-dashed rounded-lg
                    transition-all duration-200 ease-in-out
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                    ${error ? 'border-red-500 bg-red-50' : ''}
                    hover:border-blue-500 hover:bg-blue-50
                `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={fileConfig.accept}
          onChange={handleFileSelect}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 1
          }}
        />

        <Box className="flex flex-col items-center justify-center text-center">
          {!file && !error && (
            <>
              <i className={`${fileConfig.icon} w-12 h-12 mb-4 text-gray-400`} />
              <Typography variant="body1" className="mb-2">
                {helperText || `Drag and drop your ${type} here, or click to select`}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {fileConfig.formatString} {maxSize / 1024 / 1024}MB
              </Typography>
            </>
          )}

          {error && (
            <Box className="flex items-center text-red-500">
              <i className="lucide-circle-alert w-6 h-6 mr-2" />
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}

          {file && !error && (
            <Box className="w-full">
              <Box className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Box className="flex items-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-8 h-8 mr-2 object-cover rounded"
                    />
                  ) : (
                    <i className={`${fileConfig.icon} w-6 h-6 mr-2 text-gray-500`} />
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px'
                    }}>
                      {file.file?.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {(file.file?.size / 1024).toFixed(1)}KB
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={removeFile}
                  sx={{
                    flexShrink: 0,
                    zIndex: 2
                  }}
                >
                  <i className="lucide-x w-4 h-4" />
                </IconButton>
              </Box>
              {isUploading && (
                <LinearProgress className="mt-2" />
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default FileDropzone;