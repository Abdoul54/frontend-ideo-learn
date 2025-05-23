import { Box, Typography, Card, CardContent, Button, Divider, CircularProgress, Paper } from '@mui/material';

const NewsPreview = ({ news, isLoading = false }) => {
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 300,
          width: '100%'
        }}
      >
        <CircularProgress size={30} sx={{ mr: 2 }} />
        <Typography>Loading news...</Typography>
      </Box>
    );
  }
  
  if (!news || news.length === 0) {
    return (
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 300,
          width: '100%'
        }}
      >
        <Typography color="text.secondary">
          No news items to preview
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
      {news.map((item, index) => (
        <Card 
          key={item.id} 
          sx={{ 
            mb: 2,
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {item.title}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              paragraph
              sx={{
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis'
              }}
            >
              {item.description}
            </Typography>
            {item.href_text && item.href_link && (
              <Button 
                variant="text" 
                color="primary" 
                href={item.href_link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ pl: 0 }}
              >
                {item.href_text}
              </Button>
            )}
          </CardContent>
          {index < news.length - 1 && <Divider />}
        </Card>
      ))}
    </Box>
  );
};

export default NewsPreview;