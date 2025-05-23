'use client';
import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const HeroBanner = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: '#0a2341',
        backgroundImage: 'linear-gradient(to right, #0a2341, #143a62)',
        color: 'white',
        py: 6,
        mb: 4,
        borderRadius: { xs: 0, md: '0 0 20px 20px' },
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '600px',
          }}
        >
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            TRANSFORMEZ-LES DÉFIS DU DÉVELOPPEMENT DURABLE EN OPPORTUNITÉS DISPONIBLE
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Des parcours digitaux pour un avenir soutenable
          </Typography>
        </Box>
      </Container>
      
      {/* Background effect */}
      <Box
        sx={{
          position: 'absolute',
          right: -100,
          top: 0,
          height: '100%',
          width: '400px',
          backgroundColor: '#00c2cb',
          borderRadius: '50%',
          filter: 'blur(150px)',
          opacity: 0.3,
          zIndex: 1,
        }}
      />
    </Box>
  );
};

export default HeroBanner;