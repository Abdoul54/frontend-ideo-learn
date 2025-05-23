import { useState } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import Slider from '@/components/Slider';

const SliderPreview = ({ images, isLoading = false }) => {
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexDirection: 'column',
          height: 250,
          width: '100%'
        }}
      >
        <CircularProgress size={32} sx={{ mb: 2 }} />
        <Typography color="text.secondary">
          Loading preview...
        </Typography>
      </Box>
    );
  }

  if (!images || images.length === 0) {
    return (
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 250,
          width: '100%'
        }}
      >
        <Typography color="text.secondary">
          No banner images to preview
        </Typography>
      </Paper>
    );
  }

  const slides = images.map((image, index) => (
    <img 
      key={image.id} 
      src={image.image} 
      alt={`Banner ${index + 1}`} 
      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
    />
  ));

  return (
    <Box sx={{ height: 250, width: '100%' }}>
      <Slider
        slides={slides}
        navigation={true}
        pagination={true}
        autoplay={true}
        autoplayDelay={3000}
        effect="fade"
        height="250px"
      />
    </Box>
  );
};

export default SliderPreview;