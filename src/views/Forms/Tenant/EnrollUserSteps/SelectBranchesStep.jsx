import { useState } from "react";
import { Controller } from "react-hook-form";
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import BranchSelector from "@/components/BranchSelector";

export default function SelectBranchesStep({ control, errors, setValue }) {
  // State for branch selection options
  const [selectedStatus, setSelectedStatus] = useState(1); // Default to "Yes"
  const [resetBranchSelector, setResetBranchSelector] = useState(0);

  // Handle branch selection status change (Yes/No/Descendants)
  const handleStatusChange = (event) => {
    setSelectedStatus(parseInt(event.target.value, 10));
  };

  // Handle branch selection from BranchSelector
  const handleBranchSelection = (branches) => {
    // Format branches for API
    const formattedBranches = branches.map(branch => ({
      branch_id: branch.id,
      selected_status: selectedStatus
    }));
    
    setValue('branches', formattedBranches);
  };

  // Reset branch selector when status changes
  const resetSelector = () => {
    setResetBranchSelector(prev => prev + 1);
    setValue('branches', []);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Select Branches
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select branches to enroll their users in the selected courses
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Branch Selection Mode
          </Typography>
          
          <RadioGroup 
            row 
            value={selectedStatus} 
            onChange={(e) => {
              handleStatusChange(e);
              resetSelector();
            }}
          >
            <FormControlLabel value={1} control={<Radio />} label="Yes" />
            <FormControlLabel value={0} control={<Radio />} label="No" />
            <FormControlLabel value={2} control={<Radio />} label="Descendants" />
          </RadioGroup>
          
          <Typography variant="caption" color="text.secondary">
            {selectedStatus === 1 
              ? "Enroll users directly in the selected branches." 
              : selectedStatus === 0 
                ? "Don't enroll users in the selected branches." 
                : "Enroll users in the selected branches and all their descendant branches."}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2, height: '400px' }}>
          <Controller
            name="branches"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <Box sx={{ height: '100%' }}>
                <BranchSelector
                  singleSelect={false}
                  onChange={handleBranchSelection}
                  resetKey={resetBranchSelector}
                />
              </Box>
            )}
          />
        </Paper>
      </Grid>

      {errors.branches && (
        <Grid item xs={12}>
          <Typography color="error">{errors.branches.message}</Typography>
        </Grid>
      )}
    </Grid>
  );
}