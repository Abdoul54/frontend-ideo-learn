'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';

const BookCard = ({
  Title,
  Img,
  Author,
  productNum,
  token = '',
  index
}) => {
  const handleClick = () => {
    if (productNum && token) {
      window.open(`https://www.youscribe.com/BookReader/Index/${productNum}?ysauth=${token}`, '_blank');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: { xs: 220, xl: 240, '2xl': 240 },
        cursor: 'pointer',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
      onClick={handleClick}
    >
      <Box 
        sx={{ 
          mb: 2, 
          width: '80%',
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: 5
          }
        }}
      >
        <Box
          component="img"
          src={Img}
          alt={Title}
          sx={{
            width: '100%',
            minHeight: { xs: 176, lg: 288 },
            border: { xs: 4, lg: 8 },
            borderColor: 'background.paper',
            borderRadius: 2,
            objectFit: 'cover'
          }}
        />
      </Box>
      
      <Typography 
        variant="subtitle2"
        sx={{
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: { xs: '0.75rem', xl: '0.75rem', '2xl': '0.875rem' },
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          height: '3em'
        }}
      >
        {Title}
      </Typography>
      
      {Author && (
        <Typography 
          variant="caption"
          sx={{
            color: 'grey.400',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {Author}
        </Typography>
      )}
    </Box>
  );
};

export default BookCard;