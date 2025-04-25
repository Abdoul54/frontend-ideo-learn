'use client';

import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect } from "react";
import TextInput from "@/components/inputs/TextInput";
import { useCreateSkill, useUpdateSkill } from "@/hooks/api/tenant/skills/useSkills";

const SkillDrawer = ({ open, onClose, data }) => {

    const createSkill = useCreateSkill();
    const updateSkill = useUpdateSkill();

    const {
        control,
        handleSubmit,
        reset
    } = useForm({
        defaultValues: {
            name: '',
            description: '',
            alternative_names: []
        },
        resolver: yupResolver(
            yup.object().shape({
                name: yup.string().required("Name is required"),
                description: yup.string(),
                alternative_names: yup.array().of(
                    yup.object().shape({
                        value: yup.string().required("Alternative name cannot be empty"),
                    })
                )
            })
        ),

    });

    // Setup field array for alternative names
    const { fields, append, remove } = useFieldArray({
        control,
        name: "alternative_names"
    });

    useEffect(() => {
        if (data) {
            // If data already includes alternative_names array, use it directly
            // Otherwise, create default structure
            const formattedData = {
                name: data?.name,
                description: data?.description,
                alternative_names: data.alternative_names?.length
                    ? data.alternative_names.map(name => ({ value: name }))
                    : []
            };
            reset(formattedData);
        }
    }, [data, reset]);

    const onSubmit = (formData) => {
        // Format the data before submission
        const formattedData = {
            ...formData,
            // Convert from array of objects to array of strings
            alternative_names: formData.alternative_names
                .filter(item => item.value.trim() !== '')
                .map(item => item.value.trim())
        };

        if (data) {
            updateSkill.mutateAsync({ id: data.id, data: formattedData });
            onClose();
            reset();
        } else {
            createSkill.mutateAsync(formattedData);
            onClose();
            reset();
        }
    };

    const handleAddAlternativeName = () => {
        append({ value: '' });
    };
    return (
        <DrawerFormContainer
            title="Create Skill"
            description="Create a new skill to be used in your skill set."
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
                        <Grid item xs={12} component={ListItem}>
                            <ListItemText primary='Details' primaryTypographyProps={{
                                variant: 'h5',
                                sx: {
                                    fontWeight: 600,
                                    fontSize: '1.2rem',
                                }
                            }} />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <TextInput
                                name="name"
                                label="Name"
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <TextInput
                                name="description"
                                label="Description"
                                control={control}
                                type="text"
                                multiline
                                maxRows={5}
                            />
                        </Grid>

                        {/* Alternative Names Section */}
                        <Grid item xs={12} component={ListItem}>
                            <ListItemText
                                primary='Alternative Names'
                                primaryTypographyProps={{
                                    variant: 'h5',
                                    sx: {
                                        fontWeight: 600,
                                        fontSize: '1.2rem',
                                    }
                                }}
                                secondary="Add other ways this skill might be referenced"
                            />
                            <IconButton
                                onClick={handleAddAlternativeName}
                                sx={{ ml: 1, color: "text.primary" }}
                            >
                                <i className='solar-add-circle-outline' />
                            </IconButton>
                        </Grid>

                        {fields?.map((field, index) => (
                            <Grid item xs={12} component={ListItem} key={field.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <TextInput
                                        name={`alternative_names.${index}.value`}
                                        label={`Alternative Name ${index + 1}`}
                                        control={control}
                                        type="text"
                                    />
                                </Box>
                                {fields && fields?.length > 0 && (
                                    <IconButton
                                        onClick={() => remove(index)}
                                        color="error"
                                        sx={{ ml: 1 }}
                                    >
                                        <i className='solar-close-circle-outline' />
                                    </IconButton>
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={createSkill?.isPending}>Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={createSkill?.isPending}>Submit</Button>
                </CardActions>
            </Card>
        </DrawerFormContainer >
    );
};

export default SkillDrawer;