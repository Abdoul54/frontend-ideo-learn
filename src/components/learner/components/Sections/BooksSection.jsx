'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import BookCarousel from '../Others/BookCarousel';
import { useSession } from 'next-auth/react';

const BooksSection = () => {
  const theme = useTheme();
  const { data: session } = useSession();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);


  // For now, use the API endpoint your code shows
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/learner/home/bn');
        const data = await response.json();
        setBooks(data.produits || []);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        my: 5,
        py: 4,
        backgroundColor: 'black',
        borderRadius: 2
      }}
    >
      <Box sx={{ maxWidth: 'xl', mx: 'auto', px: 8 }}>
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              color: '#c5262c',
              fontWeight: 'bold',
              mb: 1
            }}
          >
            Notre Bibliothèque Numérique
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: 'white'
            }}
          >
            Suggestions de lecture (Livres, Audio Books,...)
          </Typography>
        </Box>

        <BookCarousel books={books} loading={loading} />
      </Box>
    </Box>
  );
};

export default BooksSection;