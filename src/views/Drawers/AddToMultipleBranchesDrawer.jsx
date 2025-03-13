import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Stack, Chip, CircularProgress } from '@mui/material';
import BranchSelector from '@/components/BranchSelector';
import { useAddUsersToBranches } from '@/hooks/api/useUsers';
import { useForm, useWatch, Controller } from 'react-hook-form';
import DrawerFormContainer from '@/components/DrawerFormContainer';

const AddToMultipleBranchesDrawer = ({ open, onClose, selectedRows = [] }) => {
  const [resetKey, setResetKey] = useState(0);

  // Only increment resetKey when drawer opens (not on first render)
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }
    
    if (open) {
      // Increment the key to force re-renders when drawer opens
      setResetKey(prev => prev + 1);
    }
  }, [open, hasInitialized]);

  // Safely get the mutation function
  const addUsersToBranchesMutation = useAddUsersToBranches ? useAddUsersToBranches(onClose) : {
    mutate: () => {
      console.error("useAddUsersToBranches hook not available");
      onClose();
    },
    isLoading: false
  };

  // Set up the form control with defaultValues
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      selectedBranches: []
    }
  });

  // Reset the form when drawer closes
  useEffect(() => {
    if (!open) {
      reset({ selectedBranches: [] });
    }
  }, [open, reset]);

  // Use useWatch to track the selectedBranches value from the form
  const selectedBranches = useWatch({
    control,
    name: 'selectedBranches',
    defaultValue: []
  });

  // Custom close handler to ensure proper cleanup
  const handleClose = () => {
    if (typeof reset === 'function') {
      reset({ selectedBranches: [] });
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const onSubmit = (data) => {
    // Ensure selectedRows is an array
    const rows = Array.isArray(selectedRows) ? selectedRows : [];
    const userIds = rows.map(row => row?.id).filter(Boolean);
    
    if (userIds.length === 0) {
      console.warn("No valid user IDs found in selectedRows");
      handleClose();
      return;
    }

    if (typeof addUsersToBranchesMutation.mutate === 'function') {
      addUsersToBranchesMutation.mutate(
        { 
          userIds, 
          branchIds: Array.isArray(data.selectedBranches) ? data.selectedBranches : [] 
        },
        {
          onSuccess: () => {
            handleClose();
          },
          onError: (error) => {
            console.error("Error adding users to branches:", error);
            // Don't close on error to allow user to try again
          }
        }
      );
    } else {
      console.error("Mutation function is not available");
      handleClose();
    }
  };

  // Handle branch selection change (receives an array of IDs)
  const handleBranchChange = (newValues) => {
    // This will be called with an array of selected branch IDs
    if (control && typeof control.setValue === 'function') {
      control.setValue('selectedBranches', newValues || []);
    }
  };

  // Safely get the number of selected rows
  const selectedRowsCount = Array.isArray(selectedRows) ? selectedRows.length : 0;

  return (
    <DrawerFormContainer
      anchor="right"
      open={Boolean(open)}
      onClose={handleClose}
      title="Add Users to Multiple Branches"
      description={`Selected Users: ${selectedRowsCount}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            <Stack spacing={3}>
              {/* User Selection Summary */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Selected Users
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Array.isArray(selectedRows) && selectedRows.map((row) => (
                    <Chip
                      key={row?.id || Math.random()}
                      label={row?.name || row?.username || `User #${row?.id || 'unknown'}`}
                      size="small"
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>

              {/* Branch Selection */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                  Select Branches
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select one or more branches to add the users to.
                </Typography>

                <Controller
                  key={`branch-selector-${resetKey}`} // Force re-render when drawer opens/closes
                  name="selectedBranches"
                  control={control}
                  render={({ field }) => (
                    <BranchSelector
                      control={control}
                      name="selectedBranches"
                      selectedValues={field.value || []}
                      onChange={handleBranchChange}
                      singleSelect={false}
                      resetKey={resetKey}
                    />
                  )}
                />
              </Box>

              {/* Selected Branches Summary */}
              {Array.isArray(selectedBranches) && selectedBranches.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Selected Branches: {selectedBranches.length}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleClose}
                disabled={addUsersToBranchesMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  !Array.isArray(selectedBranches) || 
                  selectedBranches.length === 0 ||
                  selectedRowsCount === 0 ||
                  addUsersToBranchesMutation.isLoading
                }
                startIcon={addUsersToBranchesMutation.isLoading ? 
                  <CircularProgress size={16} color="inherit" /> : null}
              >
                {addUsersToBranchesMutation.isLoading ? 'Adding...' : 'Confirm'}
              </Button>
            </Box>
          </Box>
        </Box>
      </form>
    </DrawerFormContainer>
  );
};

export default AddToMultipleBranchesDrawer;