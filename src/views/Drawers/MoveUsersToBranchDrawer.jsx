import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip, Stack, Alert, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import DrawerFormContainer from '@/components/DrawerFormContainer';
import BranchSelector from '@/components/BranchSelector';
import { useMoveUsersToBranch } from '@/hooks/api/useUsers';
import toast from 'react-hot-toast';

const MoveUsersToBranchDrawer = ({ open, onClose, selectedRows }) => {
  const moveUsersToBranch = useMoveUsersToBranch();

  // Add state to track the selected branch object
  const [selectedDestination, setSelectedDestination] = useState(null);

  const { control, watch, reset } = useForm({
    defaultValues: {
      branchId: null,
    },
  });

  // Reset form and selected destination when drawer closes
  useEffect(() => {
    // When drawer closes (open changes from true to false)
    if (!open) {
      // Reset form to initial state
      reset({ branchId: null });
      setSelectedDestination(null);
    }
  }, [open, reset]);

  // Custom close handler to ensure everything is reset
  const handleClose = () => {
    // First reset our local state
    setSelectedDestination(null);
    
    // Reset the form
    reset({ branchId: null });
    
    // Then call the parent's onClose
    onClose();
  };

  // Watch the branchId field to enable/disable the confirm button
  const selectedBranchId = watch('branchId');

  const handleConfirm = () => {
    if (!selectedBranchId) {
      toast.error('Please select a target branch');
      return;
    }

    const userIds = selectedRows.map((row) => row.id);
    moveUsersToBranch.mutate(
      { userIds, branchId: selectedBranchId },
      {
        onSuccess: () => {
          handleClose();
        }
      }
    );
  };

  // Debug logging (remove in production)
  // console.log('Selected Branch ID:', selectedBranchId);
  // console.log('Selected Destination:', selectedDestination);

  return (
    <DrawerFormContainer
      open={open}
      onClose={onClose}
      title="Move Users to Branch"
      description="Select a target branch to move the selected users to."
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          <Stack spacing={3}>
            {/* Current selection information */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                Selected Users
              </Typography>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mt: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <i className="lucide-users" style={{ width: 20, height: 20, color: 'primary.main' }} />
                  <Typography variant="body1">{selectedRows.length} user{selectedRows.length !== 1 ? 's' : ''} selected</Typography>
                </Stack>
              </Box>
            </Box>

            {/* Destination Selection */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                Select Target Branch
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Browse and select a branch to move the users to.
                {!selectedDestination && (
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label="Please select a destination"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                )}
              </Typography>

              <Box sx={{ mt: 1 }}>
                {/* Using Controller to properly handle form state */}
                <Controller
                  control={control}
                  name="branchId"
                  render={({ field }) => (
                    <BranchSelector
                      control={control}
                      name="branchId"
                      // For radio buttons, we need to pass [value] if there's a value, or [] if null
                      selectedValues={field.value !== null ? [field.value] : []}
                      singleSelect={true}
                      onChange={(newValue) => {
                        // For radio buttons, this receives a single value, not an array
                        console.log('Radio selection changed to:', newValue);
                        field.onChange(newValue);
                      }}
                      onBranchSelect={(branch) => {
                        console.log('Branch selected:', branch);
                        setSelectedDestination(branch || null);
                      }}
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Selected Destination */}
            {selectedDestination && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Target Branch:
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="primary.main">
                  {selectedDestination.title || selectedDestination.name || 'Selected Branch'}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            p: 2,
            mt: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              disabled={moveUsersToBranch.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              disabled={moveUsersToBranch.isLoading || !selectedBranchId}
              startIcon={moveUsersToBranch.isLoading ?
                <CircularProgress size={16} color="inherit" /> :
                <i className="lucide-check" style={{ width: 16, height: 16 }} />
              }
            >
              {moveUsersToBranch.isLoading ? 'Moving...' : 'Confirm Move'}
            </Button>
          </Box>
        </Box>
      </Box>
    </DrawerFormContainer>
  );
};

export default MoveUsersToBranchDrawer;