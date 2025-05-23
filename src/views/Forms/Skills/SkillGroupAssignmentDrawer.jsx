'use client';

import { useForm } from "react-hook-form";
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
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useState } from "react";
import DataView from "@/views/DataView";
import { useAssignSkillsToSkillGroup, useSkillGroups } from "@/hooks/api/tenant/skills/useSkillGroups";
import { useTranslation } from '@/@core/contexts/translationContext';

// skills should at least have one skill
const schema = yup.object().shape({
    skills: yup.array().of(yup.string()).min(1, 'You must select at least one skill'),
});

const SkillGroupAssignmentDrawer = ({ open, onClose, data }) => {
    const { translate } = useTranslation();
    // states 
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});

    const { data: skillGroups, isLoading: skillGroupsLoading, error: skillGroupsError } = useSkillGroups({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
    });

    const assignSkills = useAssignSkillsToSkillGroup()

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            skillGroups: []
        },
        resolver: yupResolver(schema),
    });

    const selectedSkills = watch('skillGroups') || [];

    const onSubmit = (formData) => {
        const skillGroupsData = formData?.skillGroups?.map(skillGroup => ({
            skill_code: data?.predefined_UID,
            skillgroup_id: skillGroup
        }))

        assignSkills.mutateAsync({ items: skillGroupsData })
        onClose();
        reset();

    }


    return (
        <DrawerFormContainer
            title={translate('Skill management.MODAL_TITLE_ASSIGN_SKILLS_GROUPS', 'Assign Skill to skill sets')}
            description={translate('Skill management.MODAL_SUBTITLE_ASSIGN_SKILLS_GROUPS', 'Select the skills you want to assign to the selected skill sets')}
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
                            <ListItemText 
                                primary={translate('Skill management.TAB_SKILL_SETS', 'Skill Sets')} 
                                secondary={
                                    errors?.skills?.message || translate('Skill management.SECTION_SUBTITLE_SKILLS', 'Select the skills you want to assign to the selected skill sets')
                                } 
                                primaryTypographyProps={{
                                    variant: 'h5',
                                    sx: {
                                        fontWeight: 600,
                                        fontSize: '1.2rem',
                                    }
                                }} 
                                secondaryTypographyProps={{
                                    color: errors?.skills ? 'error.main' : 'text.secondary',
                                }} 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <DataView
                                title={translate('Skill management.TAB_SKILL_SETS', 'Skill Sets')}
                                columns={[
                                    {
                                        accessorKey: 'name',
                                        header: translate('common.name', 'Name'),
                                        flex: 1,
                                    },
                                    {
                                        accessorKey: 'description',
                                        header: translate('common.description', 'Description'),
                                        flex: 1,
                                    }
                                ]}
                                data={skillGroups?.items}
                                isLoading={skillGroupsLoading}
                                error={skillGroupsError}
                                enableSelection
                                height="calc(100vh - 352px)"
                                pagination={{ ...pagination, total: skillGroups?.pagination?.total }}
                                setPagination={setPagination}
                                selectedRows={skillGroups?.items?.filter(skillGroup => selectedSkills.includes(skillGroup.id))}
                                setSelectedRows={(selectedItems) => {
                                    setValue('skillGroups', selectedItems.map(item => item.id));
                                }}
                                slots={{
                                    globalFilter,
                                    setGlobalFilter,
                                    columnVisibility,
                                    setColumnVisibility,
                                    sorting,
                                    setSorting,
                                    features: {
                                        search: true,
                                        filter: false,
                                        columnVisibility: false
                                    },
                                    emptyState: {
                                        height: 'calc(100vh - 506px)'
                                    }
                                }}
                                noToolBar
                                disableMultiSelect
                                noMobileDataTable
                            />
                        </Grid>
                    </Grid>
                </CardContent >
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={assignSkills?.isPending}>
                        {translate('common.cancel', 'Cancel')}
                    </Button>
                    <Button variant="contained" color="primary" type="submit" disabled={selectedSkills.length === 0 || assignSkills?.isPending}>
                        {assignSkills?.isPending ? translate('common.saving', 'Saving...') : translate('common.save', 'Save')}
                    </Button>
                </CardActions>
            </Card >
        </DrawerFormContainer >
    );
};

export default SkillGroupAssignmentDrawer;