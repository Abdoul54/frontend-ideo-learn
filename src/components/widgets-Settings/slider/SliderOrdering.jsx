import { useState } from 'react';
import {
  Box,
  IconButton,
  Button,
  Card,
  CardMedia,
  Typography,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';

const SliderOrdering = ({ images, setImages, onSave, isSaving = false }) => {
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedImages = [...images];
    const [movedElement] = updatedImages.splice(index, 1);
    updatedImages.splice(index - 1, 0, movedElement);
    setImages(updatedImages);
  };

  const handleMoveDown = (index) => {
    if (index === images.length - 1) return;
    const updatedImages = [...images];
    const [movedElement] = updatedImages.splice(index, 1);
    updatedImages.splice(index + 1, 0, movedElement);
    setImages(updatedImages);
  };

  const handleDeleteImage = (id) => {
    const updatedImages = images.filter((img) => img.id !== id);
    setImages(updatedImages);
  };

  if (!images || images.length === 0) {
    return (
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200
        }}
      >
        <Typography color="text.secondary">
          No images to arrange
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Arrange the order of your slider images. use the arrows to reorder.
      </Typography>

      <Paper variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
        {images.map((image, index) => (
          <Box key={image.id}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                position: 'relative',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              {/* Position indicator */}
              <Typography
                variant="body2"
                sx={{
                  minWidth: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: '50%',
                  mr: 2
                }}
              >
                {index + 1}
              </Typography>

              {/* Image preview */}
              <Box
                sx={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mr: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                  flexShrink: 0
                }}
              >
                <CardMedia
                  component="img"
                  image={image.image}
                  alt={`Banner ${index + 1}`}
                  sx={{
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%'
                  }}
                />
              </Box>

              {/* Image info */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  noWrap
                  title={image.filename || `Image ${index + 1}`}
                >
                  {image.filename || `Image ${index + 1}`}
                </Typography>
              </Box>

              {/* Controls */}
              <Box sx={{ display: 'flex', ml: 2 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  sx={{ ml: 0.5 }}
                >
                  <i className="lucide-chevron-up" />
                </IconButton>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === images.length - 1}
                  sx={{ ml: 0.5 }}
                >
                  <i className="lucide-chevron-down" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteImage(image.id)}
                  sx={{ ml: 0.5 }}
                >
                  <i className="lucide-trash-2" />
                </IconButton>
              </Box>
            </Box>
            {index < images.length - 1 && <Divider />}
          </Box>
        ))}
      </Paper>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={onSave}
        disabled={isSaving}
        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isSaving ? 'Saving...' : 'Save Order'}
      </Button>
    </Box>
  );
};

export default SliderOrdering;