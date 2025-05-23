// frontend/src/components/widgets-Settings/PlaceholderSettings.jsx
import { Box, Typography, Paper } from '@mui/material';

const PlaceholderSettings = ({ title, message }) => {
  return (
    <Paper 
      elevation={0} 
      variant="outlined" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        height: 200,
        width: '100%',
        p: 3
      }}
    >
      <i className="solar-settings-minimalistic-bold-duotone" style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }} />
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography color="text.secondary" align="center">
        {message}
      </Typography>
    </Paper>
  );
};

export default PlaceholderSettings;