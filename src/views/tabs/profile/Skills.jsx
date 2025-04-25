'use client';

import OptionMenu from "@/@core/components/option-menu";
import ChipRadioGroup from "@/components/inputs/ChipRadioGroup";
import { Box, Button, Card, CardActions, CardContent, CardHeader, Collapse, Divider, Grid, IconButton, InputAdornment, List, ListItem, ListItemText, Stack, TextField, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";

const options = [
    { value: 'beginner', label: 'Beginner', number: 1 },
    { value: 'intermediate', label: 'Intermediate', number: 2 },
    { value: 'advanced', label: 'Advanced', number: 3 },
    { value: 'expert', label: 'Expert', number: 4 },
];

const Skill = ({
    index,
    row,
    setValue,
    onRemove
}) => {
    const [level, setLevel] = useState(row?.level);
    const [targetLevel, setTargetLevel] = useState(row?.target);
    const [openLevelInput, setOpenLevelInput] = useState(false);
    const [openTargetLevelInput, setOpenTargetLevelInput] = useState(false);
    const [tempLevel, setTempLevel] = useState(row?.level);
    const [tempTargetLevel, setTempTargetLevel] = useState(row?.level);
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false);

    const handleSelectionChange = (value, type) => {
        if (type === 'level') setTempLevel(value);
        if (type === 'target') setTempTargetLevel(value);
    };

    const handleSave = (type) => {
        if (type === 'level') {
            setOpenLevelInput(false);
            setLevel(tempLevel);
            setValue(`skills[${index}].level`, tempLevel);
        }
        if (type === 'target') {
            setOpenTargetLevelInput(false);
            setTargetLevel(tempTargetLevel);
            setValue(`skills[${index}].target`, tempTargetLevel);
        }
    }

    const handleCancel = (type) => {
        if (type === 'level') {
            setOpenLevelInput(false);
            setTempLevel(level);
        }
        if (type === 'target') {
            setOpenTargetLevelInput(false);
            setTempTargetLevel(targetLevel);
        }
    }

    const handleRemoveClick = (e) => {
        e.stopPropagation();
        setOpenRemoveDialog(true);
    };

    const handleConfirmRemove = () => {
        setOpenRemoveDialog(false);
        onRemove(index);
    };

    const handleCancelRemove = () => {
        setOpenRemoveDialog(false);
    };

    return (
        <>
            <ListItem sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <ListItemText
                        primary={row.skill}
                        secondary={<Stack direction="row" gap={1}>
                            <Chip size='small' color='secondary' variant='tonal' label={<><strong>Current:</strong> {options.find(option => option.value === level)?.label}</>} />
                            <Chip size='small' color='secondary' variant='tonal' label={<><strong>Target:</strong> {options.find(option => option.value === targetLevel)?.label}</>} />
                        </Stack>}
                        primaryTypographyProps={{ variant: 'h6' }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <OptionMenu
                            icon={<i className="solar-menu-dots-circle-outline text-textPrimary" />}
                            options={[
                                {
                                    text: 'Update Current Level',
                                    icon: <i className='solar-refresh-outline' />,
                                    menuItemProps: {
                                        onClick: (e) => {
                                            e.stopPropagation();
                                            setTempLevel(level);
                                            setOpenTargetLevelInput(false);
                                            setOpenLevelInput(!openLevelInput);
                                            setTempTargetLevel(targetLevel);
                                        },
                                        className: 'flex items-center gap-2'
                                    }
                                },
                                {
                                    text: 'Set target level',
                                    icon: <i className='solar-target-outline' />,
                                    menuItemProps: {
                                        disabled: false,
                                        onClick: (e) => {
                                            e.stopPropagation();
                                            setTempLevel(level);
                                            setOpenLevelInput(false);
                                            setTempTargetLevel(targetLevel);
                                            setOpenTargetLevelInput(!openTargetLevelInput);
                                        },
                                        className: 'flex items-center gap-2'
                                    }
                                },
                                {
                                    text: 'Remove',
                                    icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                                    menuItemProps: {
                                        className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                                        onClick: handleRemoveClick
                                    }
                                }
                            ]}
                        />
                    </Box>
                </Box>
                <Collapse in={openLevelInput} sx={{ width: '100%' }}>
                    <ChipRadioGroup
                        options={options}
                        name="priority"
                        label="Select priority level"
                        value={tempLevel}
                        onChange={(e) => handleSelectionChange(e, 'level')}
                        chipProps={{
                            size: "medium",
                        }}
                    />
                    <Stack direction="row" gap={2} justifyContent="flex-end">
                        <Button variant="outlined" size='small' color="primary" onClick={() => handleCancel('level')}>
                            Cancel
                        </Button>
                        <Button variant="contained" size='small' color="primary" onClick={() => handleSave('level')}>
                            Save
                        </Button>
                    </Stack>
                </Collapse>
                <Collapse in={openTargetLevelInput} sx={{ width: '100%' }}>
                    <ChipRadioGroup
                        options={options?.filter(option => option.number > options.findIndex(option => option.value === level))}
                        name="priority"
                        label="Select target level"
                        value={tempTargetLevel}
                        onChange={(e) => handleSelectionChange(e, 'target')}
                        chipProps={{
                            size: "medium",
                        }}
                    />
                    <Stack direction="row" gap={2} justifyContent="flex-end">
                        <Button variant="outlined" size='small' color="primary" onClick={() => handleCancel('target')}>
                            Cancel
                        </Button>
                        <Button variant="contained" size='small' color="primary" onClick={() => handleSave('target')}>
                            Save
                        </Button>
                    </Stack>
                </Collapse>
            </ListItem>

            {/* Confirmation Dialog */}
            <Dialog
                open={openRemoveDialog}
                onClose={handleCancelRemove}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Remove Skill
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to remove "{row?.skill}" from your skills list?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelRemove} color="primary" variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmRemove} color="error" variant="contained" autoFocus>
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


const Skills = () => {
    const { handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            job: 'Developer',
            skills: [
                {
                    skill: 'React',
                    level: 'intermediate',
                    target: 'expert'
                },
                {
                    skill: 'Node',
                    level: 'intermediate',
                    target: 'expert'
                }
            ]
        }
    });

    const [job, setJob] = useState(watch('job'));
    const [jobError, setJobError] = useState('');
    const [openJobInput, setOpenJobInput] = useState(false);
    const [openAddSkillForm, setOpenAddSkillForm] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('intermediate');

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            const currentSkills = watch('skills') || [];
            const updatedSkills = [
                ...currentSkills,
                {
                    skill: newSkill.trim(),
                    level: newSkillLevel
                }
            ];

            setValue('skills', updatedSkills);
            setNewSkill('');
            setNewSkillLevel('intermediate');
            setOpenAddSkillForm(false);
        }
    };

    const handleCancelAddSkill = () => {
        setNewSkill('');
        setNewSkillLevel('intermediate');
        setOpenAddSkillForm(false);
    };

    const handleRemoveSkill = (index) => {
        const currentSkills = watch('skills') || [];
        const updatedSkills = [...currentSkills];
        updatedSkills.splice(index, 1);
        setValue('skills', updatedSkills);
    };

    const onSubmit = (data) => {
        console.log('Form submitted with:', data);
        // data.avatar will be the File object for uploading
    };

    return (
        <Card component="form" onSubmit={handleSubmit(onSubmit)}>
            <CardHeader title={
                <ListItemText
                    primary="My skills"
                    secondary="Define your skills and evaluate yourself"
                    primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                />
            }
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }} />
            <CardContent component={Grid} container spacing={3} >
                {/* Avatar input section */}

                <Grid item xs={12} mt={4} >
                    <Collapse in={!openJobInput}>
                        <Stack direction="row" gap={4} alignItems="center">
                            <ListItemText
                                primary="Your Job"
                                secondary={watch('job')}
                                primaryTypographyProps={{ variant: 'h6' }}
                                secondaryTypographyProps={{ variant: 'body1' }}
                            />
                            <IconButton onClick={() => setOpenJobInput(!openJobInput)}>
                                <i className="solar-pen-2-outline text-primary" />
                            </IconButton>
                        </Stack>
                    </Collapse>
                    <Collapse in={openJobInput} component={Stack} direction="row" gap={4} alignItems="center">
                        <TextField
                            name="job"
                            label="Job"
                            value={job}
                            onChange={(e) => setJob(e.target.value)}
                            error={jobError}
                            helperText={jobError}
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position='end' sx={{ cursor: 'pointer', color: 'primary.main' }}>
                                        <IconButton onClick={() => {
                                            if (!job.trim()) {
                                                setJobError('Job title is required');
                                                return;
                                            }
                                            setJobError('');
                                            setOpenJobInput(!openJobInput);
                                            setValue('job', job);
                                        }}>
                                            <i className="solar-check-circle-outline" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Collapse>
                </Grid>
                <Grid item xs={12} >
                    <Divider />
                </Grid>
                <Grid item xs={12} >
                    <Stack direction="row" gap={4} alignItems="center">
                        <ListItemText
                            primary="Your skills"
                            secondary={`${watch('skills')?.length || 0}/50`}
                            primaryTypographyProps={{ variant: 'h6' }}
                            secondaryTypographyProps={{ variant: 'body1' }}
                        />
                        <Tooltip title={openAddSkillForm ? "Cancel" : "Add a skill"}>
                            <IconButton onClick={() => setOpenAddSkillForm(!openAddSkillForm)}>
                                <i className={`solar-add-circle-outline transform ${openAddSkillForm ? "rotate-45 text-error" : "rotate-0 text-primary"} transition-all delay-100`} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Grid>

                {/* Add new skill form */}
                <Grid item xs={12}>
                    <Collapse in={openAddSkillForm}>
                        <Card variant="outlined" >
                            <CardHeader title="Add a skill" />
                            <CardContent component={Stack} gap={2}>
                                <TextField
                                    fullWidth
                                    label="Skill name"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Enter skill name"
                                    variant="outlined"
                                />
                                <ChipRadioGroup
                                    options={options}
                                    name="newSkillLevel"
                                    label="Skill level"
                                    value={newSkillLevel}
                                    onChange={setNewSkillLevel}
                                    chipProps={{
                                        size: "medium",
                                    }}
                                />
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    onClick={handleCancelAddSkill}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={handleAddSkill}
                                    disabled={!newSkill.trim()}
                                >
                                    Add Skill
                                </Button>
                            </CardActions>
                        </Card>
                    </Collapse>
                </Grid>

                <Grid item xs={12} >
                    <List>
                        {watch('skills')?.map((row, index) => (
                            <Skill
                                key={index}
                                index={index}
                                row={row}
                                setValue={setValue}
                                onRemove={handleRemoveSkill}
                            />
                        ))}
                    </List>
                </Grid>
            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Button type="submit" variant="contained" color="primary">
                            Save Changes
                        </Button>
                    </Grid>
                </Grid>
            </CardActions>
        </Card >
    );
}

export default Skills;