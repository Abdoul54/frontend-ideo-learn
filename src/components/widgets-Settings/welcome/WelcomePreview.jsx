import { Box, Typography, Card, CardContent, Skeleton, Paper } from '@mui/material';
import { useLanguage } from '@/providers/LanguageProvider';

const WelcomePreview = ({ welcome, isLoading = false }) => {
  const { language } = useLanguage();
  
  if (isLoading) {
    return (
      <LoadingSkeleton />
    );
  }
  
  if (!welcome || (!welcome.title && !welcome.text)) {
    return (
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 400,
          width: '100%'
        }}
      >
        <Typography color="text.secondary">
          No welcome content to preview
        </Typography>
      </Paper>
    );
  }

  // Get title based on current language
  const title = welcome.title && typeof welcome.title === 'object'
    ? welcome.title[language?.locale] || Object.values(welcome.title)[0]
    : welcome.title;

  return (
    <Card elevation={0} variant="outlined">
      <CardContent>
        {title && (
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              borderBottom: '2px solid',
              borderColor: 'primary.main',
              paddingBottom: '8px',
              marginBottom: '16px',
              color: 'primary.main',
              fontWeight: 'bold'
            }}
          >
            {title}
          </Typography>
        )}
        
        {welcome.text && (
          <Box 
            sx={{ 
              mt: 2,
              '& img': {
                maxWidth: '100%',
                height: 'auto'
              }
            }}
          >
            <div
              style={{ lineHeight: 1.5 }}
              dangerouslySetInnerHTML={{ __html: welcome.text }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Loading skeleton for welcome content
const LoadingSkeleton = () => (
  <Box sx={{
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 3
  }}>
    <Box sx={{
      fontSize: '1.5rem',
      textAlign: 'center',
      fontWeight: 'bold',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <Skeleton variant="text" sx={{ width: '200px', fontSize: '2rem' }} />
    </Box>
    
    <Box sx={{ mt: 5 }}>
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="30%" />
    </Box>
    
    <Box sx={{ mt: 2 }}>
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="60%" />
    </Box>
    
    <Box sx={{ mt: 2 }}>
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="60%" />
    </Box>
    
    <Box sx={{ mt: 2 }}>
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="20%" />
    </Box>
  </Box>
);

export default WelcomePreview;