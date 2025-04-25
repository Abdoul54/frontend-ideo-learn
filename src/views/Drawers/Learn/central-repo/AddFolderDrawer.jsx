'use client';
import React, { useState } from 'react';
import { Drawer, Box, Typography, TextField, Button, Stack, DialogContent, CircularProgress } from '@mui/material';
import { useAddFolder } from '@/hooks/api/repository/useRepositoryFolders';
import toast from 'react-hot-toast';

const AddFolderDrawer = ({ open, onClose, parentFolderId }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });
  
  const addFolderMutation = useAddFolder();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addFolderMutation.mutateAsync({
        parentFolderId,
        ...formData
      });
      onClose();
      setFormData({ name: '', code: '' });
    } catch (error) {
      console.error('Error adding folder:', error);
      toast.error('Failed to add folder');
    }
  };
  
  const resetForm = () => {
    setFormData({ name: '', code: '' });
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6">Add New Folder</Typography>
      </Box>
      
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Folder Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />
            
            <TextField
              label="Folder Code (optional)"
              name="code"
              value={formData.code}
              onChange={handleChange}
              fullWidth
              helperText="A unique code for this folder"
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={handleClose}>Cancel</Button>
              <Button 
                variant="contained" 
                type="submit" 
                disabled={!formData.name || addFolderMutation.isLoading}
                startIcon={addFolderMutation.isLoading ? <CircularProgress size={20} /> : null}
              >
                {addFolderMutation.isLoading ? 'Adding...' : 'Add Folder'}
              </Button>
            </Box>
          </Stack>
        </form>
      </DialogContent>
    </Drawer>
  );
};

export default AddFolderDrawer;