import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useRemoveUsersFromBranches } from '@/hooks/api/useUsers';
import { useForm, useWatch } from 'react-hook-form';
import DrawerFormContainer from '@/components/DrawerFormContainer';
import BranchSelector from '@/components/BranchSelector';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/axios';

const RemoveFromMultipleBranchesDrawer = ({ open, onClose, selectedRows, haykalId }) => {
  const [loading, setLoading] = useState(false);
  const [userBranches, setUserBranches] = useState([]);
  const removeUsersFromBranchesMutation = useRemoveUsersFromBranches(onClose);

  // Set up the form control
  const { control, setValue, reset } = useForm({
    defaultValues: {
      selectedBranches: [],
    },
  });

  // Use useWatch to track the selectedBranches value from the form
  const selectedBranches = useWatch({
    control,
    name: 'selectedBranches',
    defaultValue: [],
  });

  // Fetch user branch details whenever the drawer opens or selected rows change
  useEffect(() => {
    if (open && selectedRows.length > 0) {
      const fetchUserBranches = async () => {
        setLoading(true);
        try {
          // Collect all user IDs from selected rows
          const userIds = selectedRows.map(row => row.id || row.user_id);
          
          // Fetch branch data for each user
          const branchesPromises = userIds.map(userId => 
            axiosInstance.get(`/tenant/tanzim/v1/users/${userId}`)
          );
          
          const responses = await Promise.all(branchesPromises);
          
          // Extract branch IDs from all users
          const allBranches = responses.flatMap(response => {
            const userData = response.data.data;
            return userData.branches?.map(branch => branch.id) || [];
          });
          
          // Filter out duplicates to get unique branch IDs
          const uniqueBranchIds = [...new Set(allBranches)];
          
          // Set the branches to state and form
          setUserBranches(uniqueBranchIds);
          setValue('selectedBranches', uniqueBranchIds);
        } catch (error) {
          console.error('Error fetching user branches:', error);
          toast.error('Failed to load user branch data');
        } finally {
          setLoading(false);
        }
      };

      fetchUserBranches();
    } else {
      // Reset form when drawer closes
      reset({ selectedBranches: [] });
      setUserBranches([]);
    }
  }, [open, selectedRows, setValue, reset]);

  const handleConfirm = () => {
    const userIds = selectedRows.map((row) => row.id || row.user_id);
    const validBranchIds = selectedBranches.filter(branchId => branchId != null && !isNaN(branchId));

    if (validBranchIds.length === 0) {
      toast.error('Please select at least one valid branch');
      return;
    }

    removeUsersFromBranchesMutation.mutate(
      { userIds, branchIds: validBranchIds },
      {
        onSuccess: () => {
          onClose(); // Close the drawer on success
        },
      }
    );
  };

  return (
    <DrawerFormContainer
      anchor="right"
      open={open}
      onClose={onClose}
      title="Remove Users from Multiple Branches"
      description={`Selected Users: ${selectedRows.length}`}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          {loading ? (
            <Box display="flex" alignItems="center" justifyContent="center" py={4}>
              <CircularProgress size={24} />
              <Typography variant="body2" ml={2}>
                Loading branches...
              </Typography>
            </Box>
          ) : userBranches.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              The selected users are not assigned to any branches.
            </Typography>
          ) : (
            <>
              <Typography variant="body2" mb={2}>
                Select branches from which you want to remove the selected users:
              </Typography>
              
              {/* Multi-select branch selector */}
              <BranchSelector
                control={control}
                name="selectedBranches"
                selectedValues={selectedBranches}
                onChange={(newValues) => {
                  setValue('selectedBranches', newValues);
                }}
              />
            </>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={removeUsersFromBranchesMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={
                selectedBranches.length === 0 ||
                selectedRows.length === 0 ||
                removeUsersFromBranchesMutation.isLoading
              }
            >
              {removeUsersFromBranchesMutation.isLoading ? 'Removing...' : 'Confirm'}
            </Button>
          </Box>
        </Box>
      </Box>
    </DrawerFormContainer>
  );
};

export default RemoveFromMultipleBranchesDrawer;