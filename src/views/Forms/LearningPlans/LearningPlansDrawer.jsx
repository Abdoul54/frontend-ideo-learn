'use client';

import { useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid2 as Grid,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect } from "react";
import TextInput from "@/components/inputs/TextInput";
import TextEditorInput from "@/components/inputs/TextEditorInput";
import FileInput from "@/components/inputs/FileInput";
import SelectInput from "@/components/inputs/SelectInput";
import { useActiveLanguages } from "@/hooks/api/tenant/useLocalization";
import SwitchInput from "@/components/inputs/SwitchInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCreateLearningPlan, useUpdateLearningPlan } from "@/hooks/api/tenant/learn/useLearningPlan";
import { defaultValues, schema, statusTypes, validityTimeTypes } from "@/constants/LearningPlan";

const LearningPlansDrawer = ({ open, onClose, data }) => {
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset
    } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
    });

    const createLearningPlan = useCreateLearningPlan();
    const updateLearningPlan = useUpdateLearningPlan();

    const { data: activeLanguages, isLoading: isLoadingActiveLanguages, error: errorActiveLanguages } = useActiveLanguages();

    const description = watch("description");

    useEffect(() => {
        // If data is provided, populate the form
        if (data) {
            reset({
                title: data?.title,
                code: data?.code,
                status: data?.status,
                short_description: data?.short_description,
                description: data?.description,
                image: data?.image,
                language: data?.lang_code,
                enable_deep_link: data?.enrollment_options?.enable_deep_link,
                validity_time: data?.time_options?.validity_time,
                validity_time_type: data?.time_options?.validity_time_type,
                validity_time_update_existing: data?.time_options?.validity_time_update_existing
            });
        }
    }, [data, reset]);

    const onSubmit = (submittedData) => {

        // Here you can handle the form submission
        const formData = new FormData();

        // Append all form data to FormData object
        Object.keys(submittedData).forEach((key) => {
            if (key === "validity_time" && submittedData[key] === null) {
                return;
            }
            formData.append(key, submittedData[key]);
        });

        if (data) {
            updateLearningPlan.mutateAsync({
                learningPlanId: data.id,
                data: { ...formData, _method: 'PUT' }
            })
                .then(() => {
                    onClose();
                    reset();
                })
        } else {
            createLearningPlan.mutateAsync({
                data: formData
            }).then(() => {
                onClose();
                reset();
            })
        }
    };

    // This function will update the form state when the editor content changes
    const handleEditorUpdate = (content) => {
        setValue("description", content);
    };

    return (
        <DrawerFormContainer
            title="Create a Learning Plan"
            description="Create a new learning plan"
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
                        <Grid item size={12} component={ListItem}>
                            <ListItemText primary='Details' primaryTypographyProps={{
                                variant: 'h5',
                                sx: {
                                    fontWeight: 600,
                                    fontSize: '1.2rem',
                                }
                            }} />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="code"
                                label="Code"
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="title"
                                label="Title"
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SelectInput
                                name="status"
                                label="Status"
                                control={control}
                                options={statusTypes}
                                labelKey="label"
                                valueKey="value"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="short_description"
                                label="Short Description"
                                control={control}
                                type="text"
                                multiline
                                maxRows={5}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem} sx={{ display: 'block', width: '100%' }}>
                            <ListItemText
                                primary="Description"
                                primaryTypographyProps={{
                                    variant: 'body1',
                                    sx: { mb: 1 }
                                }}
                            />
                            <TextEditorInput
                                content={description}
                                onUpdate={handleEditorUpdate}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <FileInput
                                name="image"
                                control={control}
                                label="Thumbnail"
                                accept="image/*"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SelectInput
                                name="language"
                                label="Language"
                                control={control}
                                options={activeLanguages}
                                labelKey="name"
                                valueKey="code"
                                disabled={isLoadingActiveLanguages || errorActiveLanguages}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SwitchInput
                                name="enable_deep_link"
                                label="Enable Deep Link"
                                control={control}
                                checkedValue={true}
                                uncheckedValue={false}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="validity_time"
                                label="Validity Time"
                                control={control}
                                type='number'

                                InputProps={{
                                    slotProps: {
                                        input: {
                                            min: 0
                                        }
                                    },
                                    endAdornment: <InputAdornment position="end">Days</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SelectInput
                                name="validity_time_type"
                                label="Validity Time Type"
                                control={control}
                                options={validityTimeTypes}
                                labelKey="label"
                                valueKey="value"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SwitchInput
                                name="validity_time_update_existing"
                                label="Update Existing Enrollments"
                                control={control}
                                checkedValue={true}
                                uncheckedValue={false}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" color="primary" type="submit">Submit</Button>
                </CardActions>
            </Card>
        </DrawerFormContainer >
    );
};

export default LearningPlansDrawer;