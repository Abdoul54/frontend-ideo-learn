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
import TextInput from "@/components/inputs/TextInput";
import TextEditorInput from "@/components/inputs/TextEditorInput";
import FileInput from "@/components/inputs/FileInput";
import SelectInput from "@/components/inputs/SelectInput";
import { useActiveLanguages } from "@/hooks/api/tenant/useLocalization";
import SwitchInput from "@/components/inputs/SwitchInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCreateLearningPlan } from "@/hooks/api/tenant/learn/useLearningPlan";
import { defaultValues, schema } from "@/constants/LearningPlan";

const LearningPlansDrawer = ({ open, onClose, data, translate }) => {
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

    const { data: activeLanguages, isLoading: isLoadingActiveLanguages, error: errorActiveLanguages } = useActiveLanguages();

    const description = watch("description");

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

        createLearningPlan.mutateAsync({
            data: formData
        }).then(() => {
            onClose();
            reset();
        })
    };

    // This function will update the form state when the editor content changes
    const handleEditorUpdate = (content) => {
        setValue("description", content);
    };

    return (
        <DrawerFormContainer
            title={translate('LP management.MODAL_TITLE_CREATE_LEARNING_PLAN')}
            description={translate('LP management.MODAL_SUBTITLE_CREATE_LEARNING_PLAN')}
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
                            <ListItemText primary={translate('LP management.SECTION_DETAILS')} primaryTypographyProps={{
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
                                label={translate('common.FIELD_CODE')}
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="title"
                                label={translate('common.FIELD_TITLE')}
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SelectInput
                                name="status"
                                label={translate('common.FIELD_STATUS')}
                                control={control}
                                options={[
                                    { value: "published", label: translate('common.PUBLISHED') },
                                    { value: "unpublished", label: translate('common.UNPUBLISHED') },
                                ]}
                                labelKey="label"
                                valueKey="value"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="short_description"
                                label={translate('common.FIELD_SHORT_DESCRIPTION')}
                                control={control}
                                type="text"
                                multiline
                                maxRows={5}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem} sx={{ display: 'block', width: '100%' }}>
                            <ListItemText
                                primary={translate('common.FIELD_DESCRIPTION')}
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
                                label={translate('common.FIELD_THUMBNAIL')}
                                accept="image/*"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SelectInput
                                name="language"
                                label={translate('common.FIELD_LANGUAGE')}
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
                                label={translate('common.FIELD_ENABLE_DEEP_LINK')}
                                control={control}
                                checkedValue={true}
                                uncheckedValue={false}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="validity_time"
                                label={translate('common.FIELD_VALIDITY_TIME')}
                                control={control}
                                type='number'

                                InputProps={{
                                    slotProps: {
                                        input: {
                                            min: 0
                                        }
                                    },
                                    endAdornment: <InputAdornment position="end">{translate('common.days')}</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SelectInput
                                name="validity_time_type"
                                label={translate('LP management.FIELD_VALIDITY_TIME_TYPE')}
                                control={control}
                                options={[
                                    { value: 0, label: translate('LP management.DROPDOWN_FROM_ENROLLMENT') },
                                    { value: 1, label: translate('LP management.DROPDOWN_FROM_FIRST_ACCESS') }
                                ]}
                                labelKey="label"
                                valueKey="value"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SwitchInput
                                name="validity_time_update_existing"
                                label={translate('LP management.TOGGLE_UPDATE_EXISTING_ENROLLMENTS')}
                                control={control}
                                checkedValue={true}
                                uncheckedValue={false}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={createLearningPlan.isPending}>{translate('common.CANCEL')}</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={createLearningPlan.isPending}
                        startIcon={createLearningPlan.isPending ? <i className="svg-spinners-90-ring" /> : null}
                    >
                        {createLearningPlan.isPending ? translate('common.saving') : translate('common.save')}
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer >
    );
};

export default LearningPlansDrawer;