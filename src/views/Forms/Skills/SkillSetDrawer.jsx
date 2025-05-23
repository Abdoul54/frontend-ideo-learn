'use client';

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Collapse,
    Grid2 as Grid,
    List,
    ListItem,
    ListItemText,
    Paper,
    Tab
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useState } from "react";
import TextInput from "@/components/inputs/TextInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import DataView from "@/views/DataView";
import CustomTabList from "@/@core/components/mui/TabList";
import { TabContext, TabPanel } from "@mui/lab";
import { useGroups } from "@/hooks/api/tenant/useGroups";
import { useHaykal } from "@/hooks/api/tenant/useHaykal";
import { useCreateSkillGroup, useUpdateSkillGroup } from "@/hooks/api/tenant/skills/useSkillGroups";
import { useTranslation } from '@/@core/contexts/translationContext';

const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    description: yup.string().nullable(),
    visible_by: yup.object().shape({
        all: yup.boolean(),
        groups: yup.array().of(yup.string()),
        branches: yup.array().of(yup.object().shape({
            id: yup.string().required('Branch ID is required'),
        })),
    })
});

const SkillSetDrawer = ({ open, onClose, data }) => {
    const { translate } = useTranslation();
    // states 
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});

    const [currentDataTable, setCurrentDataTable] = useState('groups')
    const { data: groups, isLoading: groupsLoading, error: groupsError } = useGroups({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
    });

    const { data: branches, isLoading: branchesLoading, error: branchesError } = useHaykal({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter
    });

    const createSkillGroup = useCreateSkillGroup();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
    } = useForm({
        defaultValues: {
            name: '',
            description: '',
            visible_by: {
                all: false,
                groups: [],
                branches: []
            }
        },
        resolver: yupResolver(schema),
    });

    const selectedGroups = watch('visible_by.groups') || [];
    const selectedBranches = watch('visible_by.branches') || [];

    const onSubmit = (formData) => {
        if (formData?.all) {
            delete formData.visible_by.groups;
            delete formData.visible_by.branches;
        }
        createSkillGroup.mutateAsync(formData).then(() => {
            onClose();
            reset();
        });
    }


    return (
        <DrawerFormContainer
            title={translate('Skill management.MODAL_TITLE_NEW_SKILL_SET', 'New Skill Set')}
            description={translate('Skill management.MODAL_SUBTITLE_NEW_SKILL_SET', 'Fill in the field below to start creating your set of skills')}
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
                            <ListItemText 
                                primary={translate('common.details', 'Details')} 
                                secondary={translate('Skill management.SECTION_SUBTITLE_GENERAL', 'Users will choose their own skills from a limited selection of skills filtered by you')} 
                                primaryTypographyProps={{
                                    variant: 'h5',
                                    sx: {
                                        fontWeight: 600,
                                        fontSize: '1.2rem',
                                    }
                                }} 
                        />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="name"
                                label={translate('common.name', 'Name')}
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="description"
                                label={translate('common.description', 'Description')}
                                control={control}
                                type="text"
                                maxRows={4}
                                multiline
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <ListItemText
                                primary={translate('Skill management.SECTION_VISIBLE_BY', 'Visible by')} 
                                secondary={translate('Skill management.SECTION_SUBTITLE_VISIBLE_BY', 'Users will choose their own skills from a limited selection of skills filtered by you')}
                                primaryTypographyProps={{
                                    variant: 'h5',
                                    sx: {
                                        fontWeight: 600,
                                        fontSize: '1.2rem',
                                    }
                                }} />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <SwitchInput
                                name="visible_by.all"
                                label={
                                    <ListItemText
                                        primary={translate('Skill management.TOGGLE_VISIBLE_ALL', 'Visible by all')}
                                        secondary={translate('Skill management.TEXT_VISIBILITY_DESCRIPTION', 'When enabled, this skill set will be visible to all users')} />
                                }
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Collapse in={watch('visible_by.all') === false} sx={{ width: 1 }}>
                            <Grid item size={12} component={ListItem} >
                                <TabContext value={currentDataTable}>
                                    <Grid container spacing={4} sx={{ width: 1 }}>
                                        <Grid item size={12}>
                                            <Paper elevation={0}>
                                                <CustomTabList
                                                    onChange={(_, newValue) => {
                                                        setCurrentDataTable(newValue);
                                                    }}
                                                    variant="fullWidth"
                                                    sx={{
                                                        '& .MuiTabs-flexContainer': {
                                                            width: '100%'
                                                        }
                                                    }}
                                                >
                                                    <Tab value="groups" label={translate('Skill management.TAB_GROUPS', 'Groups')} />
                                                    <Tab value="branches" label={translate('Skill management.TAB_BRANCHES', 'Branches')} />
                                                </CustomTabList>
                                            </Paper>
                                        </Grid>
                                        <Grid item size={12}>
                                            <TabPanel value="groups">
                                                <DataView
                                                    title={translate('Skill management.TAB_GROUPS', 'Groups')}
                                                    columns={[
                                                        { accessorKey: 'name', header: translate('common.name', 'Name'), flex: 1 },
                                                        { accessorKey: 'description', header: translate('common.description', 'Description'), flex: 1 },
                                                    ]}
                                                    data={groups?.items}
                                                    isLoading={groupsLoading}
                                                    error={groupsError}
                                                    enableSelection
                                                    height="calc(100vh - 352px)"
                                                    pagination={{ ...pagination, total: groups?.pagination?.total }}
                                                    setPagination={setPagination}
                                                    selectedRows={groups?.items?.filter(group => selectedGroups.includes(group.id))}
                                                    setSelectedRows={(selectedItems) => {
                                                        setValue('visible_by.groups', selectedItems.map(item => item.id));
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
                                            </TabPanel>
                                            <TabPanel value="branches">
                                                <DataView
                                                    title={translate('common.branches', 'Branches')}
                                                    columns={[
                                                        { accessorKey: 'code', header: translate('common.code', 'Code'), flex: 1 },
                                                        { accessorKey: 'title', header: translate('common.title', 'Title'), flex: 1 },
                                                    ]}
                                                    data={branches?.data?.items}
                                                    isLoading={branchesLoading}
                                                    error={branchesError}
                                                    enableSelection
                                                    height="calc(100vh - 352px)"
                                                    pagination={{ ...pagination, total: branches?.data?.pagination?.total }}
                                                    setPagination={setPagination}
                                                    selectedRows={branches?.data?.items?.filter(branch => selectedBranches.some(item => item.id === branch.id))}
                                                    setSelectedRows={(selectedItems) => {
                                                        setValue('visible_by.branches', selectedItems.map(item => ({ id: item.id })));
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
                                                />
                                            </TabPanel>
                                        </Grid>
                                    </Grid>
                                </TabContext>
                            </Grid>
                        </Collapse>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={createSkillGroup.isPending}>
                        {translate('common.cancel', 'Cancel')}
                    </Button>
                    <Button variant="contained" color="primary" type="submit" disabled={createSkillGroup.isPending}>
                        {createSkillGroup.isPending ? translate('common.creating', 'Creating...') : translate('common.create', 'Create')}
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer >
    );
};

export default SkillSetDrawer;