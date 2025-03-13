import { Autocomplete, TextField, FormControlLabel, Switch, Typography, Grid, Box, Paper, Chip } from '@mui/material';
import { useController } from 'react-hook-form';
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useGetListUsers } from '@/hooks/api/useUsers';
import { useManagerTypes } from '@/hooks/api/tenant/useManager';
import { axiosInstance } from "@/lib/axios";

const ManagerSelection = ({ control, managerType, userData }) => {
    const [searchText, setSearchText] = useState('');
    const [inputValue, setInputValue] = useState('');
    const { data: users = [] } = useGetListUsers({ search_text: searchText });
    const initializationCompleted = useRef(false);

    // Use the NESTED structure required by the API (manager.typeId.user)
    const { field: managerField } = useController({
        control,
        name: `manager.${managerType.manager_type_id}.user`,
        defaultValue: null
    });

    // Find the manager in the fetched users if available
    const selectedManager = useMemo(() => {
        if (!managerField.value) return null;
        
        // Try to find the manager in the users list
        const foundUser = users.find(user => 
            String(user.id) === String(managerField.value.id) || 
            String(user.user_id) === String(managerField.value.id));
            
        return foundUser || managerField.value;
    }, [managerField.value, users]);

    // Define available options
    const allOptions = useMemo(() => {
        if (!selectedManager) return users;
        
        // Check if selectedManager is already in the users array
        const isInUsers = users.some(user => 
            String(user.id) === String(selectedManager.id) || 
            String(user.user_id) === String(selectedManager.id)
        );
        
        // If not in users, prepend it to the options
        return isInUsers ? users : [selectedManager, ...users];
    }, [selectedManager, users]);

    useEffect(() => {
        // Sync inputValue with selected manager's fullname
        if (selectedManager?.fullname) {
            setInputValue(selectedManager.fullname);
        } else if (selectedManager?.first_name && selectedManager?.last_name) {
            setInputValue(`${selectedManager.first_name} ${selectedManager.last_name}`);
        } else {
            setInputValue('');
        }
    }, [selectedManager]);

    // Initialize from userData if provided (for edit mode)
    useEffect(() => {
        if (!initializationCompleted.current && userData && userData.manager && 
            userData.manager[managerType.manager_type_id]) {
            const managerId = userData.manager[managerType.manager_type_id];
            if (managerId) {
                const fetchManager = async () => {
                    try {
                        const response = await axiosInstance.get(`/tenant/tanzim/v1/users/${managerId}`);
                        const user = response.data.data;
                        
                        // Create a user object with ID as string
                        const userObj = { 
                            id: String(managerId),
                            fullname: `${user.firstname} ${user.lastname}`,
                            email: user.email
                        };
                        
                        managerField.onChange(userObj);
                        setInputValue(userObj.fullname);
                        initializationCompleted.current = true;
                    } catch (error) {
                        console.error('Error fetching manager:', error);
                        const tempUser = { 
                            id: String(managerId), 
                            fullname: `User ${managerId}` 
                        };
                        managerField.onChange(tempUser);
                        setInputValue(tempUser.fullname);
                        initializationCompleted.current = true;
                    }
                };
                fetchManager();
            }
        }
    }, [userData, managerType.manager_type_id, managerField]);

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
            <Autocomplete
                key={`manager-autocomplete-${managerType.manager_type_id}`}
                options={allOptions}
                getOptionLabel={(user) => {
                    if (!user) return '';
                    return user.fullname || 
                        (user.first_name && user.last_name ? 
                            `${user.first_name} ${user.last_name}` : 
                            `User ${user.id || user.user_id}`);
                }}
                value={selectedManager}
                inputValue={inputValue}
                onChange={(_, value) => {
                    // When selecting a user, store their ID as a string
                    if (value) {
                        const userId = value.user_id || value.id;
                        // Store complete user object with ID as string for consistent comparison
                        managerField.onChange({
                            id: String(userId),
                            fullname: value.fullname || `${value.first_name || ''} ${value.last_name || ''}`.trim() || `User ${userId}`,
                            email: value.email
                        });
                    } else {
                        managerField.onChange(null);
                    }
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
                        placeholder="Type to search for a manager..."
                        fullWidth
                    />
                )}
                isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    // Compare IDs as strings for consistent matching
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

const TeamMembersSelection = ({ control, managerType, userData }) => {
    const [searchText, setSearchText] = useState('');
    const [inputValue, setInputValue] = useState('');
    const { data: users = [] } = useGetListUsers({ search_text: searchText });
    const initializationCompleted = useRef(false);

    const { field: teamMembersField } = useController({
        control,
        name: `employees.${managerType.manager_type_id}`,
        defaultValue: []
    });

    // Get the selected user IDs as strings
    const selectedUserIds = useMemo(() => {
        if (!teamMembersField.value || !Array.isArray(teamMembersField.value)) {
            return [];
        }
        
        // Ensure all IDs are strings
        return teamMembersField.value.map(id => String(id));
    }, [teamMembersField.value]);

    // Find users that match the selected IDs
    const selectedUsers = useMemo(() => {
        // Get users that match our selected IDs
        const matchedUsers = users.filter(user => 
            selectedUserIds.includes(String(user.id || user.user_id))
        );
        
        // For IDs that we don't have matching users for yet, create placeholder objects
        const matchedIds = matchedUsers.map(user => String(user.id || user.user_id));
        const missingIds = selectedUserIds.filter(id => !matchedIds.includes(id));
        
        const placeholderUsers = missingIds.map(id => ({
            id: id,
            user_id: id,
            fullname: `User ${id}`,
            email: ''
        }));
        
        return [...matchedUsers, ...placeholderUsers];
    }, [users, selectedUserIds]);

    // Initialize from userData if provided (for edit mode)
    useEffect(() => {
        if (!initializationCompleted.current && userData?.employees?.[managerType.manager_type_id]) {
            const initialValues = userData.employees[managerType.manager_type_id]
                .map(id => String(id)); // Convert to strings
            teamMembersField.onChange(initialValues);
            initializationCompleted.current = true;
        }
    }, [userData, managerType.manager_type_id, teamMembersField]);

    const handleSearch = useCallback(
        debounce((value) => {
            setSearchText(value.trim());
        }, 300),
        []
    );

    const handleRemoveUser = (userId) => {
        const stringId = String(userId);
        const newValue = selectedUserIds.filter(id => id !== stringId);
        teamMembersField.onChange(newValue);
    };

    // Handle when a user is selected from the dropdown
    const handleUserSelect = (event, user) => {
        if (!user) return;
        
        const userId = String(user.id || user.user_id);
        
        if (userId && !selectedUserIds.includes(userId)) {
            const newSelectedIds = [...selectedUserIds, userId];
            teamMembersField.onChange(newSelectedIds);
            setInputValue(''); // Clear the input after selection
        }
    };

    // Available options are users not already selected
    const availableOptions = useMemo(() => {
        return users.filter(user => {
            const userId = String(user.id || user.user_id);
            return userId && !selectedUserIds.includes(userId);
        });
    }, [users, selectedUserIds]);

    return (
        <Box mb={4} mt={2} padding={2}>
            <Typography variant="subtitle1" mb={1}>
                Team members (as {managerType.manager_type_name})
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Please select team members who will report to this user
            </Typography>

            {/* Selected Users */}
            <Box mb={2}>
                <Typography variant="subtitle2" mb={1}>Selected Team Members</Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={2} minHeight="40px">
                    {selectedUsers.length > 0 ? (
                        selectedUsers.map(user => (
                            <Chip
                                key={`employee-${user.id || user.user_id}`}
                                label={`${user.fullname || `${user.first_name || ''} ${user.last_name || ''}`.trim() || `User ${user.id || user.user_id}`}`}
                                onDelete={() => handleRemoveUser(user.id || user.user_id)}
                                color="primary"
                                variant="outlined"
                            />
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No team members selected
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Search field */}
            <Autocomplete
                key={`employee-autocomplete-${managerType.manager_type_id}`}
                options={availableOptions}
                getOptionLabel={(user) => {
                    if (!user) return '';
                    return user.fullname || 
                        `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                        `User ${user.id || user.user_id}`;
                }}
                value={null} // Always null to allow new selections
                inputValue={inputValue}
                onChange={handleUserSelect}
                onInputChange={(_, value, reason) => {
                    setInputValue(value);
                    if (reason !== 'reset') {
                        handleSearch(value);
                    }
                }}
                filterSelectedOptions
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Search for team members..."
                        fullWidth
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
                                {option.email || 'No email'} (ID: {option.id || option.user_id})
                            </Typography>
                        </Box>
                    </Box>
                )}
            />
        </Box>
    );
};

const StepFour = ({ control, userData }) => {
    const { data: managerTypesData } = useManagerTypes();
    const managerTypes = useMemo(() => managerTypesData?.items || [], [managerTypesData]);

    // Global switch for managing subordinates
    const { field: canManageField } = useController({
        control,
        name: 'can_manage_subordinates',
        defaultValue: userData?.can_manage_subordinates || false
    });

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" mb={2}>
                        Manager Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Please select managers for this user
                    </Typography>
                    {managerTypes.map((type) => (
                        <ManagerSelection
                            key={`manager-${type.manager_type_id}`}
                            control={control}
                            managerType={type}
                            userData={userData}
                        />
                    ))}
                </Paper>
            </Grid>

            <Grid item xs={12} mt={2}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={canManageField.value || false}
                            onChange={e => canManageField.onChange(e.target.checked)}
                        />
                    }
                    label="This user manages a team"
                />
            </Grid>

            {canManageField.value && (
                <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h6" mb={2}>
                            Team Members
                        </Typography>
                        {managerTypes.map((type) => (
                            <TeamMembersSelection
                                key={`team-${type.manager_type_id}`}
                                control={control}
                                managerType={type}
                                userData={userData}
                            />
                        ))}
                    </Paper>
                </Grid>
            )}
        </Grid>
    );
};

export default StepFour;