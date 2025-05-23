'use client';

import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid2 as Grid,
    List,
    ListItem,
    Typography,
    IconButton,
    Box,
    FormHelperText,
    Stack,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useState } from "react";
import TextInput from "@/components/inputs/TextInput";
import SelectInput from "@/components/inputs/SelectInput";
import AutoCompleteInput from "@/components/inputs/AutoCompleteInput";
import { useUseAllUserFields } from "@/hooks/api/tenant/useUserFields";
import { useGetHaykal } from "@/hooks/api/tenant/useHaykal";
import { useCourse } from "@/hooks/api/tenant/learn/course/useCourse";
import {
    ruleTypes, userFieldsOptions,
    operators, enrollmentStatuses,
    setsSchema
} from "@/constants/Groups";
import DataTableDrawer from "../DataTableDrawer";

// Default payloads by rule type
const getDefaultPayload = (type) => {
    switch (type) {
        case 'enrollment_status':
            return {
                course_id: '',
                enrollment_status: 'enrolled'
            };
        case 'branch':
            return {
                branch_id: ''
            };
        case 'user':
            return {
                field: 'email',
                operator: 'is_equal',
                value: ''
            };
        case 'userfield':
            return {
                userfield_id: '',
                operator: 'is_equal',
                value: ''
            };
        default:
            return {};
    }
};

// Function to create a component that fetches and displays course details
const CourseDisplay = ({ courseId, index, setSelectedCourses }) => {
    const { data: courseData, isLoading, error } = useCourse(courseId);

    // Update the selectedCourses state when data is loaded
    useEffect(() => {
        if (courseData && !isLoading && !error) {
            setSelectedCourses(prev => ({
                ...prev,
                [index]: {
                    ...courseData,
                    id: courseData.id,
                    loading: false
                }
            }));
        }
    }, [courseData, isLoading, error, index, setSelectedCourses]);

    if (isLoading) return <Typography variant="body2">Loading course...</Typography>;
    if (error) return <Typography variant="body2" color="error">Error loading course</Typography>;
    if (!courseData) return <Typography variant="body2" color="text.secondary">Select Course</Typography>;

    return <Typography variant="body2" color="text.secondary">Course: {courseData.name || courseData.title || `ID: ${courseId}`}</Typography>;
};

// Function to create a component that fetches and displays branch details
const BranchDisplay = ({ branchId, index, setSelectedBranches }) => {
    const { data: branchData, isLoading, error } = useGetHaykal(branchId);

    // Update the selectedBranches state when data is loaded
    useEffect(() => {
        if (branchData && !isLoading && !error) {
            setSelectedBranches(prev => ({
                ...prev,
                [index]: {
                    ...branchData,
                    id: branchId, // Use the passed branchId to ensure consistency
                    loading: false
                }
            }));
        }
    }, [branchData, isLoading, error, index, setSelectedBranches]);

    if (isLoading) return <Typography variant="body2">Loading branch...</Typography>;
    if (error) return <Typography variant="body2" color="error">Error loading branch</Typography>;
    if (!branchData) return <Typography variant="body2" color="text.secondary">Select Branch</Typography>;

    return <Typography variant="body2" color="text.secondary">Branch: {branchData?.name || branchData?.title || `ID: ${branchId}`}</Typography>;
};

const RuleSetsDrawer = ({ open, onClose, data, onSubmit: onSubmitProp }) => {
    const methods = useForm({
        defaultValues: {
            rules_operator: data?.rules_operator || 'AND',
            rules: []
        },
        resolver: yupResolver(setsSchema),
        mode: 'onChange'
    });

    const [drawerState, setDrawerState] = useState({ open: false, data: null, type: null });
    const [selectedCourses, setSelectedCourses] = useState({}); // Map of index -> selected course
    const [selectedBranches, setSelectedBranches] = useState({}); // Map of index -> selected branch
    const { data: userFields } = useUseAllUserFields();

    // Track the current index for drawer operations
    const [currentEditIndex, setCurrentEditIndex] = useState(null);

    const { control, handleSubmit, reset, watch, formState: { errors }, setValue, getValues } = methods;

    // Initialize useFieldArray
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "rules"
    });

    // Synchronize data when it changes
    useEffect(() => {
        if (data) {
            // Preserve the API-generated IDs
            const rulesWithApiIds = data.rules?.map(rule => ({
                ...rule,
                apiId: rule.id // Store the API ID separately
            })) || [];

            reset({
                rules_operator: data.rules_operator || 'AND',
                ...data,
                rules: rulesWithApiIds
            });

            // Initialize selected courses and branches from existing data
            const newSelectedCourses = {};
            const newSelectedBranches = {};

            data.rules?.forEach((rule, index) => {
                if (rule.type === 'enrollment_status' && rule.payload?.course_id) {
                    // Mark this slot for course loading, actual data will be loaded by the hooks
                    newSelectedCourses[index] = { id: rule.payload.course_id, loading: true };
                }
                if (rule.type === 'branch' && rule.payload?.branch_id) {
                    // Mark this slot for branch loading, actual data will be loaded by the hooks
                    newSelectedBranches[index] = { id: rule.payload.branch_id, loading: true };
                }
            });

            setSelectedCourses(newSelectedCourses);
            setSelectedBranches(newSelectedBranches);
        } else {
            reset({
                rules_operator: 'AND',
                rules: []
            });
            setSelectedCourses({});
            setSelectedBranches({});
        }
    }, [data, reset]);

    // Function to handle form submission
    const onSubmit = (formData) => {
        // Map back the apiId to id for each rule before submitting
        const processedData = {
            ...formData,
            rules: formData.rules.map(rule => ({
                ...rule,
                id: rule.apiId || rule.id, // Use the API ID if available
            }))
        };
        onSubmitProp && onSubmitProp(processedData);
    };

    // Function to add a new rule
    const addRule = () => {
        append({
            type: 'enrollment_status',
            payload: getDefaultPayload('enrollment_status')
        });
    };

    // Function to handle rule type change
    const handleRuleTypeChange = (index, value) => {
        // Update the rule type and reset the payload
        update(index, {
            ...fields[index],
            type: value,
            payload: getDefaultPayload(value)
        });

        // Clear selected course/branch for this index when type changes
        if (value !== 'enrollment_status') {
            const newSelectedCourses = { ...selectedCourses };
            delete newSelectedCourses[index];
            setSelectedCourses(newSelectedCourses);
        }

        if (value !== 'branch') {
            const newSelectedBranches = { ...selectedBranches };
            delete newSelectedBranches[index];
            setSelectedBranches(newSelectedBranches);
        }
    };

    // Get nested errors for a specific rule
    const getRuleErrors = (index) => {
        return errors.rules?.[index] || {};
    };

    // Function to handle course selection
    const onSelectCourse = (course) => {
        if (!course || currentEditIndex === null) return;

        // Ensure we have the correct ID
        const courseId = course.id.toString();

        // Update the form value with the course ID
        setValue(`rules.${currentEditIndex}.payload.course_id`, courseId);

        // Update the selectedCourses state to reflect the selection
        setSelectedCourses(prev => ({
            ...prev,
            [currentEditIndex]: {
                ...course,
                loading: false
            }
        }));
    };

    // Function to handle branch selection
    const onSelectBranch = (branch) => {
        if (!branch || currentEditIndex === null) return;

        // Ensure we have the correct ID
        const branchId = branch.id.toString();

        // Update the form value with the branch ID
        setValue(`rules.${currentEditIndex}.payload.branch_id`, branchId);

        // Update the selectedBranches state to reflect the selection
        setSelectedBranches(prev => ({
            ...prev,
            [currentEditIndex]: {
                ...branch,
                loading: false
            }
        }));
    };

    // Open drawer for selection
    const openSelectionDrawer = (type, index) => {
        setCurrentEditIndex(index);
        setDrawerState({
            open: true,
            data: type === 'courses' ? selectedCourses[index] : selectedBranches[index],
            type: type
        });
    };

    // Handle drawer submission
    const handleDrawerSubmit = (selected) => {
        if (!selected) {
            setDrawerState({ open: false, data: null, type: null });
            return;
        }

        if (drawerState.type === 'courses') {
            onSelectCourse(selected);
        } else {
            onSelectBranch(selected);
        }
        setDrawerState({ open: false, data: null, type: null });
    };

    return (
        <>
            <DrawerFormContainer
                title={data ? 'Edit Rule Set' : 'Add Rule Set'}
                open={open}
                onClose={onClose}
            >
                <Card
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
                >
                    <CardContent sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'auto',
                        p: 2,
                        '&::-webkit-scrollbar': {
                            width: '0.4em'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'var(--mui-palette-background-paper)'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'var(--mui-palette-primary-main)',
                            borderRadius: 2
                        }
                    }}>
                        <Grid container rowSpacing={3} padding={2} component={List}>
                            <Grid item size={12} component={ListItem} disablePadding>
                                <SelectInput
                                    name="rules_operator"
                                    control={control}
                                    label="Rules Operator"
                                    options={[
                                        { value: 'AND', label: 'All rules must match (AND)' },
                                        { value: 'OR', label: 'Any rule must match (OR)' }
                                    ]}
                                    defaultValue="AND"
                                    error={!!errors.rules_operator}
                                    helperText={errors.rules_operator?.message}
                                />
                            </Grid>

                            <Grid item size={12} component={ListItem} disablePadding>
                                <Box width="100%">
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6">Rules ({fields.length})</Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<i className="solar-add-circle-outline" />}
                                            onClick={addRule}
                                        >
                                            Add Rule
                                        </Button>
                                    </Box>

                                    {fields.length === 0 && (
                                        <>
                                            <Typography color="text.secondary" align="center" py={4}>
                                                No rules added yet. Click "Add Rule" to begin.
                                            </Typography>
                                            {errors.rules && (
                                                <FormHelperText error sx={{ textAlign: 'center', mb: 2 }}>
                                                    {errors.rules.message}
                                                </FormHelperText>
                                            )}
                                        </>
                                    )}

                                    {fields.map((field, index) => {
                                        const ruleType = watch(`rules.${index}.type`);
                                        const ruleErrors = getRuleErrors(index);

                                        return (
                                            <Box
                                                key={field.id}
                                                sx={{
                                                    mb: 3,
                                                    p: 2,
                                                    border: '1px solid',
                                                    borderColor: ruleErrors.payload ? 'error.main' : 'divider',
                                                    borderRadius: 1
                                                }}
                                            >
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                    <Typography variant="subtitle1">Rule {index + 1}</Typography>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => remove(index)}
                                                        size="small"
                                                    >
                                                        <i className="solar-close-circle-outline" />
                                                    </IconButton>
                                                </Box>

                                                {/* Preserve the server-generated ID if it exists */}
                                                {field.apiId && (
                                                    <input
                                                        type="hidden"
                                                        {...methods.register(`rules.${index}.apiId`)}
                                                        defaultValue={field.apiId}
                                                    />
                                                )}

                                                <Grid container spacing={2}>
                                                    <Grid item size={12}>
                                                        <SelectInput
                                                            name={`rules.${index}.type`}
                                                            control={control}
                                                            label="Rule Type"
                                                            options={ruleTypes}
                                                            onChange={(e) => handleRuleTypeChange(index, e.target.value)}
                                                            error={!!ruleErrors.type}
                                                            helperText={ruleErrors.type?.message}
                                                        />
                                                    </Grid>

                                                    {/* Enrollment Status Fields */}
                                                    {ruleType === 'enrollment_status' && (
                                                        <>
                                                            <Grid item size={{
                                                                xs: 12,
                                                                md: 6
                                                            }}>
                                                                <Box display="flex" alignItems="center" width={1} height={1} p={1} border={1} borderColor="divider" borderRadius={1}>
                                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" width={1} height={1}>
                                                                        {selectedCourses[index] && selectedCourses[index].id ? (
                                                                            <CourseDisplay
                                                                                courseId={selectedCourses[index].id}
                                                                                index={index}
                                                                                setSelectedCourses={setSelectedCourses}
                                                                            />
                                                                        ) : (
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                Select Course
                                                                            </Typography>
                                                                        )}
                                                                        <Button
                                                                            variant="outlined"
                                                                            color="primary"
                                                                            onClick={() => openSelectionDrawer('courses', index)}
                                                                            size="small"
                                                                            startIcon={<i className="solar-add-circle-outline" />}
                                                                        >
                                                                            Select Course
                                                                        </Button>
                                                                    </Stack>
                                                                </Box>
                                                                {ruleErrors.payload?.course_id && (
                                                                    <FormHelperText error>
                                                                        {ruleErrors.payload.course_id.message}
                                                                    </FormHelperText>
                                                                )}
                                                                <input
                                                                    type="hidden"
                                                                    {...methods.register(`rules.${index}.payload.course_id`)}
                                                                />
                                                            </Grid>
                                                            <Grid item size={{
                                                                xs: 12,
                                                                md: 6
                                                            }}>
                                                                <SelectInput
                                                                    name={`rules.${index}.payload.enrollment_status`}
                                                                    control={control}
                                                                    label="Enrollment Status"
                                                                    options={enrollmentStatuses}
                                                                    error={!!ruleErrors.payload?.enrollment_status}
                                                                    helperText={ruleErrors.payload?.enrollment_status?.message}
                                                                />
                                                            </Grid>
                                                        </>
                                                    )}

                                                    {/* Branch Fields */}
                                                    {ruleType === 'branch' && (
                                                        <Grid item size={12}>
                                                            <Box display="flex" alignItems="center" width={1} height={1} p={1} border={1} borderColor="divider" borderRadius={1}>
                                                                <Stack direction="row" justifyContent="space-between" alignItems="center" width={1} height={1}>
                                                                    {selectedBranches[index] && selectedBranches[index].id ? (
                                                                        <BranchDisplay
                                                                            branchId={selectedBranches[index].id}
                                                                            index={index}
                                                                            setSelectedBranches={setSelectedBranches}
                                                                        />
                                                                    ) : (
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Select Branch
                                                                        </Typography>
                                                                    )}
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="primary"
                                                                        onClick={() => openSelectionDrawer('branches', index)}
                                                                        size="small"
                                                                        startIcon={<i className="solar-add-circle-outline" />}
                                                                    >
                                                                        Select Branch
                                                                    </Button>
                                                                </Stack>
                                                            </Box>
                                                            {ruleErrors.payload?.branch_id && (
                                                                <FormHelperText error>
                                                                    {ruleErrors.payload.branch_id.message}
                                                                </FormHelperText>
                                                            )}
                                                            <input
                                                                type="hidden"
                                                                {...methods.register(`rules.${index}.payload.branch_id`)}
                                                            />
                                                        </Grid>
                                                    )}

                                                    {/* User Fields */}
                                                    {ruleType === 'user' && (
                                                        <>
                                                            <Grid item size={{
                                                                xs: 12,
                                                                md: 4
                                                            }}>
                                                                <SelectInput
                                                                    name={`rules.${index}.payload.field`}
                                                                    control={control}
                                                                    label="User Field"
                                                                    options={userFieldsOptions}
                                                                    error={!!ruleErrors.payload?.field}
                                                                    helperText={ruleErrors.payload?.field?.message}
                                                                />
                                                            </Grid>
                                                            <Grid item size={{
                                                                xs: 12,
                                                                md: 4
                                                            }}>
                                                                <SelectInput
                                                                    name={`rules.${index}.payload.operator`}
                                                                    control={control}
                                                                    label="Operator"
                                                                    options={operators}
                                                                    error={!!ruleErrors.payload?.operator}
                                                                    helperText={ruleErrors.payload?.operator?.message}
                                                                />
                                                            </Grid>
                                                            <Grid item size={{
                                                                xs: 12,
                                                                md: 4
                                                            }}>
                                                                <TextInput
                                                                    name={`rules.${index}.payload.value`}
                                                                    control={control}
                                                                    label="Value"
                                                                    error={!!ruleErrors.payload?.value}
                                                                    helperText={ruleErrors.payload?.value?.message}
                                                                />
                                                            </Grid>
                                                        </>
                                                    )}

                                                    {/* Userfield Fields */}
                                                    {ruleType === 'userfield' && (
                                                        <>
                                                            <Grid item size={{
                                                                xs: 12,
                                                                md: 4
                                                            }}>
                                                                <AutoCompleteInput
                                                                    name={`rules.${index}.payload.userfield_id`}
                                                                    label="User Field ID"
                                                                    control={control}
                                                                    options={userFields || []}
                                                                    valueKey="id"
                                                                    labelKey="title"
                                                                    error={!!ruleErrors.payload?.userfield_id}
                                                                    helperText={ruleErrors.payload?.userfield_id?.message}
                                                                />
                                                            </Grid>
                                                            <Grid item size={{
                                                                xs: 12,
                                                                md: 4
                                                            }}>
                                                                <SelectInput
                                                                    name={`rules.${index}.payload.operator`}
                                                                    control={control}
                                                                    label="Operator"
                                                                    options={operators}
                                                                    error={!!ruleErrors.payload?.operator}
                                                                    helperText={ruleErrors.payload?.operator?.message}
                                                                />
                                                            </Grid>
                                                            <Grid item size={{
                                                                xs: 12,
                                                                md: 4
                                                            }}>
                                                                <TextInput
                                                                    name={`rules.${index}.payload.value`}
                                                                    control={control}
                                                                    label="Value"
                                                                    error={!!ruleErrors.payload?.value}
                                                                    helperText={ruleErrors.payload?.value?.message}
                                                                />
                                                            </Grid>
                                                        </>
                                                    )}
                                                </Grid>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={fields.length === 0}
                        >
                            Submit
                        </Button>
                    </CardActions>
                </Card>
            </DrawerFormContainer>
            <DataTableDrawer
                open={drawerState?.open}
                onClose={() => setDrawerState({ open: false, data: null, type: null })}
                type={drawerState?.type}
                data={drawerState?.data}
                onsubmit={handleDrawerSubmit}
            />
        </>
    );
};

export default RuleSetsDrawer;