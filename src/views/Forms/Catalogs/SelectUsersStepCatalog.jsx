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
import { useTranslation } from '@/@core/contexts/translationContext';

const SelectUsersStepCatalog = ({ control, errors, setValue, activeTab = 'users' }) => {
    const { translate } = useTranslation();
    // State for search text
    const [searchText, setSearchText] = useState("");
    // Pagination state
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    // State for branch selection options
    const [includeDescendants, setIncludeDescendants] = useState(true); // Default to include descendants
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

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    // const handleDescendantsChange = (event) => {
    //     const newIncludeDescendants = event.target.checked;
    //     setIncludeDescendants(newIncludeDescendants);

    //     // Update the global form value to keep track of the toggle state
    //     setValue('includeDescendants', newIncludeDescendants);

    //     // Update any existing branches with the new status
    //     setValue('branches', value => {
    //         if (!value || !Array.isArray(value) || value.length === 0) return value;

    //         // Filter out any invalid entries (those without branch_id)
    //         const validBranches = value.filter(branch => branch.branch_id || branch.id);

    //         // Update selected_status for all valid branches
    //         return validBranches.map(branch => ({
    //             branch_id: branch.branch_id || branch.id,
    //             selected_status: newIncludeDescendants ? 1 : 2 // 1 = include descendants, 2 = no descendants
    //         }));
    //     });
    // };

    // Handle branch selection from BranchSelector
    const handleBranchSelection = (branchIds) => {
        if (!branchIds || !Array.isArray(branchIds)) {
            setValue('branches', []);
            return;
        }
        const validBranchIds = branchIds.filter(id => id != null && typeof id === 'number');
        setValue('branches', validBranchIds);
    };

    const handleDescendantsChange = (event) => {
        const newIncludeDescendants = event.target.checked;
        setIncludeDescendants(newIncludeDescendants);
        setValue('includeDescendants', newIncludeDescendants);
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

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    {translate('Catalog management.TEXT_SELECT_USERS_BRANCHES_GROUPS', 'Select users, branches, or groups to assign to this catalog')}
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 0 }}>
                    {/* Users tab panel */}
                    {activeTab === 'users' && (
                        <Box sx={{ width: '100%' }}>
                            {/* Search field */}
                            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <TextField
                                    placeholder={translate('Catalog management.PLACEHOLDER_SEARCH_USERS', 'Search users...')}
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
                                                    <TableCell>{translate('Catalog management.TABLE_HEADER_USERNAME', 'USERNAME')}</TableCell>
                                                    <TableCell>{translate('Catalog management.TABLE_HEADER_FIRST_NAME', 'FIRST NAME')}</TableCell>
                                                    <TableCell>{translate('Catalog management.TABLE_HEADER_LAST_NAME', 'LAST NAME')}</TableCell>
                                                    <TableCell>{translate('Catalog management.TABLE_HEADER_EMAIL', 'EMAIL')}</TableCell>
                                                    <TableCell>{translate('Catalog management.TABLE_HEADER_BRANCH', 'BRANCH')}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {usersLoading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center">{translate('common.loading', 'Loading users...')}</TableCell>
                                                    </TableRow>
                                                ) : users.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center">{translate('Catalog management.TEXT_NO_USERS_FOUND', 'No users found')}</TableCell>
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
                                                            <TableCell>{user.branch_name || '-'}</TableCell>
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
                        </Box>
                    )}

                    {/* Branches panel */}
                    {activeTab === 'branches' && (
                        <Box sx={{ width: '100%' }}>
                            {/* Branch selection mode - Toggle for descendants */}
                            <Box sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    {translate('Catalog management.SECTION_BRANCH_SELECTION_MODE', 'Branch Selection Mode')}
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
                                            label={translate('Catalog management.TOGGLE_INCLUDE_DESCENDANTS', 'Include Descendants')}
                                        />
                                    )}
                                />

                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    {includeDescendants
                                        ? translate('Catalog management.TEXT_INCLUDE_DESCENDANTS_DESC', 'Assign the catalog to users in the selected branches and all their descendant branches.')
                                        : translate('Catalog management.TEXT_EXCLUDE_DESCENDANTS_DESC', 'Assign the catalog only to users in the selected branches.')}
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
                    )}

                    {/* Groups panel */}
                    {activeTab === 'groups' && (
                        <Box sx={{ width: '100%' }}>
                            {/* Search field */}
                            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <TextField
                                    placeholder={translate('Catalog management.PLACEHOLDER_SEARCH_GROUPS', 'Search groups...')}
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
                                                                } else {
                                                                    // Deselect all groups
                                                                    field.onChange([]);
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{translate('Catalog management.TABLE_HEADER_NAME', 'NAME')}</TableCell>
                                                    <TableCell>{translate('Catalog management.TABLE_HEADER_DESCRIPTION', 'DESCRIPTION')}</TableCell>
                                                    <TableCell>{translate('Catalog management.TABLE_HEADER_TYPE', 'TYPE')}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {groupsLoading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center">{translate('common.loading', 'Loading groups...')}</TableCell>
                                                    </TableRow>
                                                ) : groups.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center">{translate('Catalog management.TEXT_NO_GROUPS_FOUND', 'No groups found')}</TableCell>
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
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>{group.name}</TableCell>
                                                            <TableCell>{group.description}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    size="small"
                                                                    label={group.type === 'automatic' ? 
                                                                        translate('Catalog management.GROUP_TYPE_AUTOMATIC', 'Automatic') : 
                                                                        translate('Catalog management.GROUP_TYPE_MANUAL', 'Manual')}
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
                        </Box>
                    )}
                </Paper>
            </Grid>

            {errors.users && (
                <Grid item xs={12}>
                    <Typography color="error">{errors.users.message}</Typography>
                </Grid>
            )}
        </Grid>
    );
};

export default SelectUsersStepCatalog;