'use client';
import React from 'react';
import { Box, Typography, Paper, Button, useTheme } from '@mui/material';
import Link from 'next/link';

const SupportSection = ({ type = 'support' }) => {
  const theme = useTheme();
  
  const config = {
    support: {
      title: 'Support Technique',
      message: "Besoin d'aide ? Contactez notre support technique !",
      color: '#c5262c',
      image: '/assets/support.png',
      link: '/learner/faq'
    },
    faq: {
      title: 'Foire Aux Questions',
      message: "Trouvez des réponses rapides à vos questions",
      color: '#c5262c',
      image: '/assets/faq.png',
      link: '/learner/faq'
    }
  };
  
  const content = config[type];
  
  return (
    <Paper
      elevation={2}
      sx={{
        position: 'relative',
        width: '100%',
        borderRadius: 2,
        height: '100%',
        boxShadow: 3
      }}
    >
      <Box
        sx={{
          p: 3,
          display: 'flex',
          backgroundColor: content.color,
          backgroundPosition: 'center',
          justifyContent: 'space-between',
          height: '240px',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: { xs: 2, md: 3 } }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'white' }}>
              {content.message}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            component={Link}
            href={content.link}
            endIcon={<Box component="i" className="solar-alt-arrow-right-bold-duotone" />}
            sx={{
              mt: 3,
              width: 'fit-content',
              backgroundColor: "black",
              borderRadius: 50,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: "#333"
              }
            }}
          >
            ACCÉDER
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: { xs: '30%', md: '40%' } }}>
          <Box
            component="img"
            src={content.image}
            alt={content.title}
            sx={{ 
              maxWidth: '100%', 
              maxHeight: 150,
              objectFit: 'contain'
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default SupportSection;