'use client';

import { Controller, useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid2 as Grid,
    List,
    ListItem,
    ListItemText,
    Stepper,
    Step,
    StepLabel,
    CardActionArea,
    Typography,
    IconButton,
    Skeleton,
    Avatar,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useMemo, useState } from "react";
import {
    useAssignPowerUserRessources,
    useGetPotentialRessources,
    useGetResourceTypes
} from "@/hooks/api/tenant/usePowerUsers";
import DataView from "@/views/DataView";
import useHistoryNavigation from "@/hooks/useHistoryNavigation";
import { useTranslation } from "@/@core/contexts/translationContext";

const resourceIcons = {
    users: <i className="lucide-users text-xl" />,
    groups: <i className="lucide-user-cog text-xl" />,
    courses: <i className="lucide-book-open text-xl" />,
    learningplans: <i className="lucide-clipboard-list text-xl" />,
    branches: <i className="lucide-landmark text-xl" />,
    catalogs: <i className="lucide-folder-open text-xl" />,
};

const AssignRessourcesDrawer = ({ open, onClose, data, translate }) => {
    const { language } = useTranslation();
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [customVisibility, setCustomVisibility] = useState({});
    const [columns, setColumns] = useState([]);
    const [params, setParams] = useState();
    const [selectedRows, setSelectedRows] = useState([]);

    const {
        history,
        currentItem,
        goForward,
        goBack,
        goToBreadcrumb
    } = useHistoryNavigation({ id: 1, title: 'Platform' });

    const { data: resources, isLoading: loadingResources } = useGetResourceTypes();

    const steps = [
        translate('Power User & Profile Management.STEP_SELECT_RESOURCE'),
        translate('Power User & Profile Management.STEP_SELECT_RESOURCE_IDS')
    ];

    const [activeStep, setActiveStep] = useState(0);
    const nextStep = () => setActiveStep((prev) => prev + 1);
    const prevStep = () => setActiveStep((prev) => prev - 1);

    const methods = useForm({
        defaultValues: {
            resource_type: null,
            resource_ids: []
        },
    });

    const { control, handleSubmit, watch } = methods;

    const assignResources = useAssignPowerUserRessources()

    const onSubmit = (formData) => {
        try {
            assignResources.mutateAsync({
                id: data?.id,
                data: {
                    resource_type: formData?.resource_type,
                    resource_ids: selectedRows?.map(row => row?.id)
                }
            }).then(() => {
                onClose();
            });
        } catch (error) {
            console.error(error);
        }
    };

    const resourceType = watch('resource_type');

    const { data: potentialResources, isLoading, error } = useGetPotentialRessources(resourceType, params);

    const changeDataTableConfig = (key) => {
        const common = {
            pagination: { pageIndex: 0, pageSize: 15 },
            sorting: '',
            search: '',
            customVisibility: {}
        };
        let cols = [];
        let query = {};

        switch (key) {
            case "users":
                cols = [
                    { header: translate('Power User & Profile Management.TABLE_HEADER_USERNAME'), accessorKey: 'username', flex: 1, enableSorting: true },
                    { header: translate('Power User & Profile Management.TABLE_HEADER_FULL_NAME'), accessorKey: 'fullname', flex: 1, enableSorting: true },
                    { header: translate('Power User & Profile Management.TABLE_HEADER_EMAIL'), accessorKey: 'email', flex: 1, enableSorting: true },
                ];
                query = { page: 1, page_size: 15, search, sort: sorting };
                break;
            case "groups":
            case "courses":
            case "learningplans":
            case "catalogs":
                cols = [
                    { header: translate(`Power User & Profile Management.TABLE_HEADER_${key.toUpperCase()}_NAME`), accessorKey: 'name', flex: 1, enableSorting: true },
                    { header: translate(`Power User & Profile Management.TABLE_HEADER_${key.toUpperCase()}_DESCRIPTION`), accessorKey: 'description', flex: 1, enableSorting: true },
                ];
                query = { page: 1, page_size: 15, search, sort: sorting };
                break;
            case "branches":
                cols = [
                    {
                        header: translate('Power User & Profile Management.TABLE_HEADER_BRANCH_title'),
                        accessorKey: 'title',
                        flex: 1,
                        enableSorting: true
                    },
                    {
                        accessorKey: "action",
                        header: "",
                        cell: ({ row }) =>
                            row?.original?.has_children && (
                                <IconButton
                                    onClick={() => {
                                        goForward({ id: row.original.id, title: row.original.title });
                                        setParams({
                                            page: 1,
                                            page_size: 15,
                                            search_text: search,
                                            lang: language,
                                            haykal_id: row?.original.id,
                                            search_type: 2
                                        });
                                    }}
                                    size="small"
                                >
                                    <i className="ri-arrow-right-s-line" />
                                </IconButton>
                            ),
                        flex: .075
                    }
                ];
                query = {
                    page: 1,
                    page_size: 15,
                    search_text: search,
                    lang: language,
                    haykal_id: currentItem?.id,
                    search_type: 2
                };
                break;
            default:
                break;
        }

        setColumns(cols);
        setPagination(common.pagination);
        setSorting(common.sorting);
        setSearch(common.search);
        setCustomVisibility(common.customVisibility);
        setParams(query);
    };

    const clickableBreadcrumbs = useMemo(() =>
        history?.map(item => ({
            ...item,
            onClick: () => {
                goToBreadcrumb(item)
                setParams({ page: 1, page_size: 15, search_text: search, lang: language, haykal_id: item.id });
            },
            isActive: item.id === currentItem.id,
        })), [history, currentItem, goToBreadcrumb]);

    return (
        <DrawerFormContainer
            title={data ? data?.username : translate('Power User & Profile Management.CREATE_POWER_USER')}
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
                    '&::-webkit-scrollbar': { width: '0.4em' },
                    '&::-webkit-scrollbar-track': { background: 'var(--mui-palette-background-paper)' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'var(--mui-palette-primary-main)', borderRadius: 2 }
                }}>
                    <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {activeStep === 0 && (
                        <Grid container rowSpacing={3} padding={2} component={List}>
                            <Grid item size={12} component={ListItem}>
                                <ListItemText
                                    primary='Choose the type of resource you want to assign'
                                    secondary='You can assign users, groups, courses, learning plans, branches or catalogs'
                                />
                            </Grid>
                            <Grid item size={12} component={ListItem}>
                                <Controller
                                    name="resource_type"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <Grid container spacing={2}>
                                            {loadingResources ? (
                                                <Skeleton>
                                                    <Card>
                                                        <CardActionArea>
                                                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <i className="svg-spinners-6-dots-rotate text-xl" />
                                                                <Typography>Loading...</Typography>
                                                            </CardContent>
                                                        </CardActionArea>
                                                    </Card>
                                                </Skeleton>
                                            ) : resources?.map((option) => {
                                                const selected = value === option.key;
                                                return (
                                                    <Grid item size={12} key={option.key}>
                                                        <Card
                                                            variant={selected ? 'elevation' : 'outlined'}
                                                            sx={{
                                                                border: selected ? '2px solid' : '1px solid',
                                                                borderColor: selected ? 'primary.main' : 'divider',
                                                                backgroundColor: selected ? 'primary.lighterOpacity' : '#fff',
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => onChange(option.key)}
                                                        >
                                                            <CardActionArea>
                                                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                    <Avatar sx={{
                                                                        bgcolor: selected ? 'primary.main' : 'background.default',
                                                                        color: selected ? 'background.default' : 'text.primary',
                                                                        width: 32,
                                                                        height: 32,
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                    }}>
                                                                        {resourceIcons[option.key]}
                                                                    </Avatar>
                                                                    <Typography>{option.name}</Typography>
                                                                </CardContent>
                                                            </CardActionArea>
                                                        </Card>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    )}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {activeStep === 1 && (
                        <List>
                            <ListItem>
                                <DataView
                                    columns={columns}
                                    data={potentialResources?.items}
                                    isLoading={isLoading}
                                    error={error}
                                    enableSelection
                                    height="calc(100vh - 255px)"
                                    pagination={{
                                        ...pagination,
                                        total: potentialResources?.pagination?.total
                                    }}
                                    setPagination={setPagination}
                                    selectedRows={selectedRows}
                                    setSelectedRows={setSelectedRows}
                                    disableMultiSelect
                                    slots={{
                                        globalFilter: search,
                                        setGlobalFilter: setSearch,
                                        columnVisibility: customVisibility,
                                        setColumnVisibility: setCustomVisibility,
                                        breadcrumbs: resourceType === 'branches' ? clickableBreadcrumbs : null,
                                        goBack: resourceType === 'branches' ? goBack : null,
                                        sorting: sorting,
                                        setSorting: setSorting,
                                        features: {
                                            search: true,
                                            filter: false,
                                            columnVisibility: true,
                                            breadcrumbs: resourceType === 'branches' ? true : false,
                                        },
                                        emptyState: {
                                            height: 'calc(100vh - 415px)'
                                        }
                                    }}
                                    noToolBar
                                    noMobileDataTable
                                />
                            </ListItem>
                        </List>
                    )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                        onClick={activeStep === 0 ? onClose : prevStep}
                        disabled={assignResources?.isPending}
                    >
                        {activeStep === 0 ? translate('common.cancel') : translate('common.back')}
                    </Button>
                    {activeStep < steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={() => {
                                nextStep();
                                changeDataTableConfig(resourceType);
                                setSelectedRows([]);
                            }}
                            disabled={!resourceType || assignResources?.isPending}
                        >
                            {translate('common.next')}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={selectedRows?.length === 0 || assignResources?.isPending}
                        >
                            {assignResources?.isPending
                                ? translate('common.saving')
                                : translate('common.save')
                            }
                        </Button>
                    )}
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default AssignRessourcesDrawer;
