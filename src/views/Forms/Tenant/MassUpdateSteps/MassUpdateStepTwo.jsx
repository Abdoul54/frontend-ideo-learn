// frontend/src/views/Forms/Tenant/UserSteps/MassUpdateStepTwo.jsx
import { Autocomplete, TextField, Typography, Grid, Box, Paper, Chip } from '@mui/material';
import { useController } from 'react-hook-form';
import debounce from 'lodash/debounce';
import { useCallback, useMemo, useState } from 'react';
import { useGetListUsers } from '@/hooks/api/useUsers';
import { useManagerTypes } from '@/hooks/api/tenant/useManager';

const ManagerSelection = ({ control, managerType }) => {
    const [searchText, setSearchText] = useState('');
    const [inputValue, setInputValue] = useState('');
    const { data: users = [], isLoading } = useGetListUsers({
        search_text: searchText,
        page: 1,
        page_size: 20 // Limit to 20 results for better performance
    });

    // Create controller for this manager type
    const { field: managerField } = useController({
        control,
        name: `manager.${managerType.manager_type_id}`,
        defaultValue: ''
    });


    // Get the selected user from the list of users
    const selectedUser = useMemo(() => {
        if (!managerField.value) return null;
        return users.find(u => String(u.id) === String(managerField.value));
    }, [managerField.value, users]);

    // Prepare options without including "Keep current" in the dropdown list
    const filteredOptions = useMemo(() => {
        return users || [];
    }, [users]);

    const handleSearch = useCallback(
        debounce((value) => {
            setSearchText(value);
        }, 300),
        []
    );

    return (
        <Box mb={3} padding={2} mt={2}>
            <Typography variant="subtitle1" mb={1}>
                {managerType.manager_type_name} (ID: {managerType.manager_type_id})
            </Typography>

            {/* Show selected manager as a chip if one is selected */}
            {managerField.value && selectedUser && (
                <Box mb={2}>
                    <Chip
                        label={selectedUser.fullname ||
                            `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() ||
                            `User ${selectedUser.id}`}
                        onDelete={() => managerField.onChange('')}
                        color="primary"
                    />
                </Box>
            )}

            {/* Show "Current" indicator if no selection has been made */}
            {!managerField.value && (
                <Box mb={2}>
                    <Chip
                        label="Keep current manager"
                        variant="outlined"
                        color="default"
                    />
                </Box>
            )}
            <Autocomplete
                options={filteredOptions}
                loading={isLoading}
                noOptionsText={searchText ? "No users found" : "Type to search for a manager"}
                getOptionLabel={(user) => {
                    if (!user) return '';
                    return user.fullname ||
                        (user.first_name && user.last_name ?
                            `${user.first_name} ${user.last_name}` :
                            `User ${user.id || user.user_id}`);
                }}
                value={null}
                inputValue={inputValue}
                onChange={(_, value) => {
                    if (!value) return;
                    managerField.onChange(String(value.id || value.user_id));
                    setInputValue('');
                }}
                onInputChange={(_, value, reason) => {
                    setInputValue(value);
                    if (reason !== 'reset') {
                        handleSearch(value);
                    }
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Search for a manager..."
                        fullWidth
                        helperText="Type to search, or leave empty to keep current manager"
                    />
                )}
                isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return String(option.id || option.user_id) === String(value.id || value.user_id);
                }}
                renderOption={(props, option) => (
                    <Box component="li" {...props}>
                        <Box>
                            <Typography variant="body1">
                                {option.fullname || `${option.first_name || ''} ${option.last_name || ''}`.trim() || `User ${option.id || option.user_id}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {option.email || 'Unknown email'} (ID: {option.id || option.user_id})
                            </Typography>
                        </Box>
                    </Box>
                )}
            />
        </Box>
    );
};

const MassUpdateStepTwo = ({ control }) => {
    const { data: managerTypesData } = useManagerTypes();
    const managerTypes = managerTypesData?.items || [];

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Select new managers or leave empty to keep current managers
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    {managerTypes.map((type) => (
                        <ManagerSelection
                            key={`manager-${type.manager_type_id}`}
                            control={control}
                            managerType={type}
                        />
                    ))}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default MassUpdateStepTwo;