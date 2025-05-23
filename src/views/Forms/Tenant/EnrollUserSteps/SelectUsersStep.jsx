import { useState } from "react";
import { Controller } from "react-hook-form";
import {
    Box,
    Typography,
    Grid,
    TextField,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    IconButton,
    InputAdornment,
    FormControlLabel,
    Radio,
    RadioGroup,
    Chip,
    Switch,
} from "@mui/material";
import { useUsers } from "@/hooks/api/tenant/useUsers";
import { useGroups } from "@/hooks/api/tenant/useGroups";
import BranchSelector from "@/components/BranchSelector";
import { useTranslation } from "@/@core/contexts/translationContext";

export default function SelectUsersStep({ control, errors, setValue, isBulkEnrollment = false }) {
    // State for tab selection (Users, Branches, Groups)
    const [tabValue, setTabValue] = useState(0);
    // State for search text
    const [searchText, setSearchText] = useState("");
    // Pagination state
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    // State for branch selection options
    const [selectedStatus, setSelectedStatus] = useState(1); // Default to "Yes"
    const [includeDescendants, setIncludeDescendants] = useState(true); // Default to include descendants (status 1)
    const [resetBranchSelector, setResetBranchSelector] = useState(0);

    // Fetch users data
    const { data: usersData, isLoading: usersLoading } = useUsers({
        search: searchText,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
    });

    // Fetch groups data
    const { data: groupsData, isLoading: groupsLoading } = useGroups({
        search: searchText,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
    });

    // Handle tab change
    const handleTabChange = (_, newValue) => {
        setTabValue(newValue);
        // Reset pagination when changing tabs
        setPagination({ pageIndex: 0, pageSize: 10 });
        setSearchText("");
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    // Handle branch selection status change
    const handleStatusChange = (event) => {
        setSelectedStatus(parseInt(event.target.value, 10));
    };

    const handleDescendantsChange = (event) => {
        const newIncludeDescendants = event.target.checked;
        setIncludeDescendants(newIncludeDescendants);

        console.log("Include Descendants:", newIncludeDescendants);

        // Update the global form value to keep track of the toggle state
        setValue('includeDescendants', newIncludeDescendants);

        // Update any existing branches with the new status
        setValue('branches', value => {
            if (!value || !Array.isArray(value) || value.length === 0) return value;

            // Filter out any invalid entries (those without branch_id)
            const validBranches = value.filter(branch => branch.branch_id || branch.id);

            // Update selected_status for all valid branches
            return validBranches.map(branch => ({
                branch_id: branch.branch_id || branch.id,
                selected_status: newIncludeDescendants ? 1 : 2 // 1 = include descendants, 2 = no descendants
            }));
        });
    };

    // Handle branch selection from BranchSelector
    const handleBranchSelection = (branches) => {
        // Ensure branches are not null/undefined and filter out any invalid entries
        if (!branches || !Array.isArray(branches)) {
            setValue('branches', []);
            return;
        }

        // Format branches for API with the proper structure
        const formattedBranches = branches
            .filter(branch => branch && (branch.id || branch.branch_id)) // Filter out invalid branches
            .map(branch => ({
                branch_id: branch.branch_id || branch.id,
                selected_status: includeDescendants ? 1 : 2 // 1 = include descendants, 2 = no descendants
            }));

        // Set the value with properly formatted branches
        setValue('branches', formattedBranches);
    };


    // Reset branch selector when status changes
    const resetSelector = () => {
        setResetBranchSelector(prev => prev + 1);
        setValue('branches', []);
    };

    // Transform API data for display
    const users = usersData?.items || [];
    const totalUsers = usersData?.pagination?.total || 0;

    const groups = groupsData?.items || [];
    const totalGroups = groupsData?.pagination?.total || 0;

    const { translate } = useTranslation();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 2 }}>
                    {translate('Course management.TEXT_SELECT_USERS', 'Select a single user or multiple users, enroll them into courses, then select their roles in the courses')}
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 0 }}>
                    {/* Tabs for Users, Branches, Groups */}
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="user selection tabs">
                        <Tab label="USERS" id="users-tab" aria-controls="users-panel" />
                        <Tab label="BRANCHES" id="branches-tab" aria-controls="branches-panel" />
                        <Tab label="GROUPS" id="groups-tab" aria-controls="groups-panel" />
                    </Tabs>

                    {/* Search field - only show for Users and Groups tabs */}
                    {tabValue !== 1 && (
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <TextField
                                placeholder={`Search ${tabValue === 0 ? 'users' : 'groups'}...`}
                                value={searchText}
                                onChange={handleSearchChange}
                                fullWidth
                                variant="outlined"
                                size="small"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton edge="end">
                                                <i className="solar-magnifer-bold" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                    )}

                    {/* Users tab panel */}
                    <div role="tabpanel" id="users-panel" aria-labelledby="users-tab" hidden={tabValue !== 0}>
                        <Controller
                            name="users"
                            control={control}
                            render={({ field }) => (
                                <TableContainer sx={{ maxHeight: '400px' }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        indeterminate={field.value.length > 0 && field.value.length < users.length}
                                                        checked={users.length > 0 && field.value.length === users.length}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                // Select all users
                                                                field.onChange(users);
                                                            } else {
                                                                // Deselect all users
                                                                field.onChange([]);
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>USERNAME</TableCell>
                                                <TableCell>FIRST NAME</TableCell>
                                                <TableCell>LAST NAME</TableCell>
                                                <TableCell>EMAIL</TableCell>
                                                <TableCell>SUGGESTED</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {usersLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">{translate('common.loading', 'Loading users...')}</TableCell>
                                                </TableRow>
                                            ) : users.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">No users found</TableCell>
                                                </TableRow>
                                            ) : (
                                                users.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                checked={field.value.some(selectedUser => selectedUser.id === user.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        // Add user to selection
                                                                        field.onChange([...field.value, user]);
                                                                    } else {
                                                                        // Remove user from selection
                                                                        field.onChange(field.value.filter(selectedUser => selectedUser.id !== user.id));
                                                                    }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{user.username}</TableCell>
                                                        <TableCell>{user.firstname}</TableCell>
                                                        <TableCell>{user.lastname}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            {user.suggested && <i className="solar-check-circle-bold" />}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        />

                        {/* Pagination display */}
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="body2">
                                {pagination.pageIndex * pagination.pageSize + 1} - {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalUsers)} of {totalUsers}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                    disabled={pagination.pageIndex === 0}
                                    onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                                >
                                    <i className="solar-arrow-left-bold" />
                                </IconButton>
                                <IconButton
                                    disabled={(pagination.pageIndex + 1) * pagination.pageSize >= totalUsers}
                                    onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                                >
                                    <i className="solar-arrow-right-bold" />
                                </IconButton>
                            </Box>
                        </Box>
                    </div>

                    {/* Branches panel */}
                    <div role="tabpanel" id="branches-panel" aria-labelledby="branches-tab" hidden={tabValue !== 1}>
                        <Box sx={{ p: 2 }}>
                            {/* Branch selection mode - Simplified to a checkbox */}
                            <Box sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    {translate('Course management.SECTION_BRANCH_SELECTION_MODE', 'Branch Selection Mode')}
                                </Typography>

                                {/* Initialize the includeDescendants form value when this component mounts */}
                                <Controller
                                    name="includeDescendants"
                                    control={control}
                                    defaultValue={true}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={(e) => {
                                                        field.onChange(e.target.checked);
                                                        handleDescendantsChange(e);
                                                    }}
                                                    color="primary"
                                                />
                                            }
                                            label={translate('Course management.TOGGLE_INCLUDE_DESCENDANTS', 'Include Descendants')}
                                        />
                                    )}
                                />

                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    {includeDescendants
                                        ? translate('Course management.TEXT_INCLUDE_DESCENDANTS', 'Enroll users in the selected branches and all their descendant branches.')
                                        : "Enroll users only in the selected branches."}
                                </Typography>
                            </Box>

                            {/* Branch selector */}
                            <Box sx={{ height: '350px' }}>
                                <Controller
                                    name="branches"
                                    control={control}
                                    defaultValue={[]}
                                    render={({ field }) => (
                                        <BranchSelector
                                            control={control}
                                            name="branches"
                                            singleSelect={false}
                                            onChange={handleBranchSelection}
                                            resetKey={resetBranchSelector}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                    </div>

                    {/* Groups panel */}
                    <div role="tabpanel" id="groups-panel" aria-labelledby="groups-tab" hidden={tabValue !== 2}>
                        <Controller
                            name="group_ids"
                            control={control}
                            defaultValue={[]}
                            render={({ field }) => (
                                <TableContainer sx={{ maxHeight: '400px' }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        indeterminate={field.value.length > 0 && field.value.length < groups.length}
                                                        checked={groups.length > 0 && field.value.length === groups.length}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                // Select all groups
                                                                field.onChange(groups.map(group => group.id));
                                                                setValue('group_ids', groups.map(group => group.id));
                                                            } else {
                                                                // Deselect all groups
                                                                field.onChange([]);
                                                                setValue('group_ids', []);
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>NAME</TableCell>
                                                <TableCell>DESCRIPTION</TableCell>
                                                <TableCell>TYPE</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {groupsLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">{translate('common.loading', 'Loading groups...')}</TableCell>
                                                </TableRow>
                                            ) : groups.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">No groups found</TableCell>
                                                </TableRow>
                                            ) : (
                                                groups.map((group) => (
                                                    <TableRow key={group.id}>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                checked={field.value.includes(group.id)}
                                                                onChange={(e) => {
                                                                    const newValue = e.target.checked
                                                                        ? [...field.value, group.id]
                                                                        : field.value.filter(id => id !== group.id);

                                                                    field.onChange(newValue);
                                                                    setValue('group_ids', newValue);
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{group.name}</TableCell>
                                                        <TableCell>{group.description}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                size="small"
                                                                label={group.type === 'automatic' ? 'Automatic' : 'Manual'}
                                                                color={group.type === 'automatic' ? 'info' : 'success'}
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        />

                        {/* Pagination display */}
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="body2">
                                {pagination.pageIndex * pagination.pageSize + 1} - {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalGroups)} of {totalGroups}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                    disabled={pagination.pageIndex === 0}
                                    onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                                >
                                    <i className="solar-arrow-left-bold" />
                                </IconButton>
                                <IconButton
                                    disabled={(pagination.pageIndex + 1) * pagination.pageSize >= totalGroups}
                                    onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                                >
                                    <i className="solar-arrow-right-bold" />
                                </IconButton>
                            </Box>
                        </Box>
                    </div>
                </Paper>
            </Grid>

            {errors.users && (
                <Grid item xs={12}>
                    <Typography color="error">{errors.users.message}</Typography>
                </Grid>
            )}
        </Grid>
    );
}