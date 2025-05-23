'use client';
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';

const LearningSpace = ({ title, icon, color, onClick }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      mb: 3,
      borderRadius: 2,
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      transition: 'transform 0.2s',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateX(8px)',
        boxShadow: 3
      }
    }}
    onClick={onClick}
  >
    <Box sx={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </Box>
    <Typography variant="h6" fontWeight="bold" color="text.primary">
      Mon Espace {title}
    </Typography>
  </Paper>
);

const LearningSpaces = () => {
  // These would normally come from your API/backend
  const spaces = [
    {
      id: 'activities',
      title: 'Activités',
      color: '#fff0f5',
      icon: <Box component="i" className="solar-court-bold-duotone" sx={{ fontSize: '2rem', color: '#e91e63' }} />,
      onClick: () => console.log('Activities clicked')
    },
    {
      id: 'certifications',
      title: 'Certifications',
      color: '#fff9e6',
      icon: <Box component="i" className="solar-diploma-verified-bold-duotone" sx={{ fontSize: '2rem', color: '#ff9800' }} />,
      onClick: () => console.log('Certifications clicked')
    },
    {
      id: 'webinars',
      title: 'Webinaires',
      color: '#e6fff4',
      icon: <Box component="i" className="solar-video-frame-play-vertical-bold-duotone" sx={{ fontSize: '2rem', color: '#4caf50' }} />,
      onClick: () => console.log('Webinars clicked')
    }
  ];

  return (
    <Box sx={{ mb: 6 }}>
      <Grid container spacing={3}>
        {spaces.map(space => (
          <Grid item xs={12} md={4} key={space.id}>
            <LearningSpace 
              title={space.title} 
              color={space.color} 
              icon={space.icon}
              onClick={space.onClick}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LearningSpaces;