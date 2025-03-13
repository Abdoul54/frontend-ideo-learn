import SwitchInput from "@/components/inputs/SwitchInput";
import TextInput from "@/components/inputs/TextInput";
import {
    Button,
    Grid,
    List,
    ListItem,
    ListItemText,
    Typography,
    Box,
    IconButton,
    Paper,
    Chip,
    Tooltip,
    CircularProgress,
    Stack,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useGroup, useUpdateGroup } from "@/hooks/api/tenant/useGroups";
import {
    updateGroupSchema,
    SET_OPERATORS,
    updateDefaultValue
} from "@/constants/Groups";
import { yupResolver } from "@hookform/resolvers/yup";
import SelectInput from "@/components/inputs/SelectInput";
import RuleSetsDrawer from "@/views/Forms/Groups/RuleSetsDrawer";
import Error from "@/components/illustrations/Error";
import ErrorState from "@/components/states/ErrorState";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/states/LoadingState";

const Properties = ({ groupId }) => {
    const { data, isLoading, error } = useGroup(groupId);
    const router = useRouter();

    const updateGroup = useUpdateGroup();

    const [ruleSetDrawerState, setRuleSetDrawerState] = useState({
        open: false,
        data: null
    });

    const [activeSetIndex, setActiveSetIndex] = useState(null);

    const { control, handleSubmit, watch, setValue, reset } = useForm({
        resolver: yupResolver(updateGroupSchema),
        defaultValues: updateDefaultValue
    });

    const sets = watch('ruleset.sets');

    // Function to initialize the form with data
    const initializeFormWithData = (data) => {
        if (data) {
            reset({
                name: data.name || '',
                description: data.description || '',
                exclude_deactivated_users: data.exclude_deactivated_users || false,
                ruleset: data.ruleset || {
                    operator: "AND",
                    sets: []
                }
            });
        }
    };

    // Initialize the form with initial set if empty
    useEffect(() => {
        if (!sets.length) {
            setValue('ruleset.sets', [{
                id: `new-set-${Date.now()}`,
                rules_operator: 'AND',
                rules: []
            }]);
        }
    }, [sets.length, setValue]);

    // Initialize with example data for demonstration
    useEffect(() => {

        initializeFormWithData(data);
    }, [data]);

    // Handle form submission
    const onSubmit = async (formData) => {
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
            };

            if (data?.type === 'automatic') {
                payload.ruleset = formData.ruleset;
                payload.exclude_deactivated_users = formData.exclude_deactivated_users;
            }

            updateGroup.mutate({ id: groupId, data: payload });
        } catch (error) {
            console.error('Error updating group:', error);
        }
    };


    // Helper function to get a summary of rules in a set
    const getRulesSummary = (rules) => {
        if (!rules || rules.length === 0) return 'No rules defined';

        if (rules.length === 1) {
            return '1 rule defined';
        }

        return `${rules.length} rules defined`;
    };

    // Helper function to get a description of a rule
    // Helper function to get a description of a rule
    const getRuleDescription = (rule) => {
        if (!rule || !rule.type) return 'Invalid rule';

        // Format operator to be more readable
        const formatOperator = (op) => {
            switch (op) {
                case 'is_equal': return 'equals';
                case 'is_not_equal': return 'not equals';
                case 'contains': return 'contains';
                case 'does_not_contain': return 'doesn\'t contain';
                default: return op;
            }
        };

        // Format user field to be more readable
        const formatUserField = (field) => {
            switch (field) {
                case 'email': return 'Email';
                case 'name': return 'Name';
                case 'firstname': return 'First Name';
                case 'lastname': return 'Last Name';
                default: return field;
            }
        };

        // Format enrollment status to be more readable
        const formatEnrollmentStatus = (status) => {
            switch (status) {
                case 'enrolled': return 'Enrolled';
                case 'completed': return 'Completed';
                case 'in_progress': return 'In Progress';
                default: return status;
            }
        };

        switch (rule.type) {
            case 'enrollment_status':
                return `Course ${rule.payload.course_id}: ${formatEnrollmentStatus(rule.payload.enrollment_status)}`;

            case 'branch':
                return `Branch ID: ${rule.payload.branch_id}`;

            case 'user':
                return `${formatUserField(rule.payload.field)} ${formatOperator(rule.payload.operator)} "${rule.payload.value}"`;

            case 'userfield':
                return `Field ${rule.payload.userfield_id} ${formatOperator(rule.payload.operator)} "${rule.payload.value}"`;

            default:
                return `${rule.type} rule`;
        }
    };

    // Open the rule set drawer for a specific set
    const openRuleSetDrawer = (setIndex) => {
        const currentSet = sets[setIndex];
        setRuleSetDrawerState({
            open: true,
            data: currentSet
        });
        setActiveSetIndex(setIndex);
    };

    // Update a specific rule set
    const updateRuleSet = (updatedData) => {
        if (activeSetIndex !== null) {
            const newSets = [...sets];
            newSets[activeSetIndex] = updatedData;
            setValue('ruleset.sets', newSets);
        } else {
            // Adding a new rule set
            setValue('ruleset.sets', [...sets, updatedData]);
        }

        setRuleSetDrawerState({ open: false, data: null });
        setActiveSetIndex(null);
    };

    // Add a new rule set
    const addRuleSet = () => {
        setRuleSetDrawerState({
            open: true,
            data: {
                rules_operator: 'AND',
                rules: []
            }
        });
        setActiveSetIndex(null);
    };

    // Render loading state
    if (isLoading) {
        return (
            <LoadingState message="Loading group data..." />
        );
    }

    // Render error state
    if (error) {
        return <ErrorState error={error} actions={{
            retry: {
                label: 'Retry',
                action: () => {
                    router.reload();
                },
                icon: 'solar-refresh-outline'
            },
            back: {
                label: 'Go Back To Groups',
                action: () => {
                    router.push('/manage/groups');
                },
                icon: 'solar-round-arrow-left-outline'
            },

        }} />;
    }


    return (
        <>
            <Grid container spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid item xs={12}>
                    <Typography variant="h4">General</Typography>
                    <Typography variant='subtitle1'>Customize the name and the description of the group</Typography>
                </Grid>
                <Grid item xs={12}>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Group information"
                                primaryTypographyProps={{ variant: 'h5' }}
                            />
                        </ListItem>
                        <ListItem>
                            <TextInput
                                name="name"
                                label="Name"
                                control={control}
                                type="text"
                            />
                        </ListItem>
                        <ListItem>
                            <TextInput
                                name="description"
                                label="Description"
                                control={control}
                                type="text"
                                multiline
                                maxRows={5}
                            />
                        </ListItem>
                    </List>
                </Grid>
                {
                    data?.type === 'automatic' && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="h4">Options</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <List>
                                    <ListItem>
                                        <ListItemText
                                            primary="Manage group users"
                                            primaryTypographyProps={{ variant: 'h5' }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <SwitchInput
                                            name="exclude_deactivated_users"
                                            label={
                                                <ListItemText
                                                    primary='Exclude deactivated users from the group'
                                                    secondary="Only if added to the group by an automatic condition" />
                                            }
                                            control={control}
                                            type="text"
                                        />
                                    </ListItem>
                                </List>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h4">Eligibility</Typography>
                                <Typography variant='subtitle1'>Create conditions to automatically organize users into groups</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h5" gutterBottom>Group Rules</Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Define how users are automatically added to this group based on conditions
                                        </Typography>
                                    </Box>

                                    {/* Ruleset Operator */}
                                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <SelectInput
                                            name="ruleset.operator"
                                            label="Match Type"
                                            control={control}
                                            options={SET_OPERATORS}
                                        />
                                    </Box>

                                    {/* Rule Sets */}
                                    <Box sx={{ mb: 3 }}>
                                        {sets && sets.length > 0 ? sets.map((set, setIndex) => {

                                            return (
                                                <Paper
                                                    key={set.id || `new-set-${setIndex}`}
                                                    variant="outlined"
                                                    sx={{
                                                        mb: 2,
                                                        p: 2,
                                                        borderColor: 'divider',
                                                        '&:hover': {
                                                            bgcolor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Chip
                                                                label={`Set ${setIndex + 1}`}
                                                                color="primary"
                                                                variant="outlined"
                                                                size="small"
                                                            />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {getRulesSummary(set.rules)}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={() => openRuleSetDrawer(setIndex)}
                                                                startIcon={<i className="solar-settings-outline" />}
                                                                color="primary"
                                                            >
                                                                {"Manage Rules"}
                                                            </Button>
                                                            <Tooltip title="Remove set">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => {
                                                                        const newSets = sets.filter((_, idx) => idx !== setIndex);
                                                                        setValue('ruleset.sets', newSets);
                                                                    }}
                                                                    disabled={sets.length === 1}
                                                                >
                                                                    <i className="solar-close-circle-outline" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>

                                                    {set.rules && set.rules.length > 0 && (
                                                        <Box sx={{ mt: 2, pl: 2 }}>
                                                            {set.rules.map((rule, ruleIndex) => (
                                                                <Chip
                                                                    key={rule.id || `rule-${ruleIndex}`}
                                                                    label={getRuleDescription(rule)}
                                                                    size="small"
                                                                    sx={{ mr: 1, mb: 1 }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Paper>
                                            );
                                        }) : null}

                                        {/* Add Rule Set Button */}
                                        <Button
                                            startIcon={<i className="solar-add-circle-outline" />}
                                            onClick={addRuleSet}
                                            variant="outlined"
                                            color="primary"
                                            fullWidth
                                            sx={{ mt: 2 }}
                                        >
                                            Add Rule Set
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        </>
                    )}

                {/* Form Actions */}
                <Grid item xs={12}
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Save Changes
                    </Button>
                </Grid>

            </Grid>
            {data?.type === 'automatic' && ruleSetDrawerState.open && <RuleSetsDrawer
                open={ruleSetDrawerState.open}
                onClose={() => setRuleSetDrawerState({ open: false, data: null })}
                onSubmit={updateRuleSet}
                data={ruleSetDrawerState.data}
            />}
        </>
    );
};

export default Properties;