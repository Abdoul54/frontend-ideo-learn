'use client';

import OptionMenu from "@/@core/components/option-menu";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useGetPowerUserRessources, useGetResourceTypes, useUnassignPowerUserRessources } from "@/hooks/api/tenant/usePowerUsers";
import DataView from "@/views/DataView";
import {
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useState } from "react";

const resourceIcons = {
    users: <i className="lucide-users text-xl" />,
    groups: <i className="lucide-user-cog text-xl" />,
    courses: <i className="lucide-book-open text-xl" />,
    learningplans: <i className="lucide-clipboard-list text-xl" />,
    branches: <i className="lucide-landmark text-xl" />,
    catalogs: <i className="lucide-folder-open text-xl" />,
};

const AssignedRessources = ({ powerUser }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [openRessourcePanel, setOpenRessourcePanel] = useState(true);
    const [ressourceType, setRessourceType] = useState('users');
    const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, data: null });

    const [columns, setColumns] = useState([
        {
            accessorKey: 'username',
            header: 'Username',
            flex: 1,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            flex: 1,
        },
        {
            accessorKey: 'first_name',
            header: 'First Name',
            flex: 1,
        },
        {
            accessorKey: 'last_name',
            header: 'Last Name',
            flex: 1,
        },
        {
            accessorKey: 'created_at',
            header: 'Creation Date',
            flex: 1,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <OptionMenu
                    options={[
                        {
                            text: 'Unassign User',
                            icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                            menuItemProps: {
                                className: 'text-error',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmation({
                                        open: true,
                                        data: { ...row?.original, ressourceType: 'user', type: 'deleteOne' },
                                    })
                                }
                            }
                        }
                    ]}
                />
            ),
            flex: .1
        }
    ]);

    const { data: resources, isLoading: loadingResources } = useGetResourceTypes();

    const unassignResource = useUnassignPowerUserRessources();

    const { data, isLoading, error } = useGetPowerUserRessources(powerUser?.id, {
        resource_type: ressourceType,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    }, loadingResources);

    const reset = () => {
        setColumnVisibility({});
        setGlobalFilter('');
        setSorting([]);
        setSelectedRows([]);
        setPagination({ pageIndex: 0, pageSize: 15 });
    }

    const changeRessourceType = (type) => {
        setRessourceType(type);
        switch (type) {
            case 'users':
                setColumns([
                    {
                        accessorKey: 'username',
                        header: 'Username',
                        flex: 1,
                    },
                    {
                        accessorKey: 'email',
                        header: 'Email',
                        flex: 1,
                    },
                    {
                        accessorKey: 'first_name',
                        header: 'First Name',
                        flex: 1,
                    },
                    {
                        accessorKey: 'last_name',
                        header: 'Last Name',
                        flex: 1,
                    },
                    {
                        accessorKey: 'created_at',
                        header: 'Creation Date',
                        flex: 1,
                    },
                    {
                        id: 'actions',
                        header: '',
                        cell: ({ row }) => (
                            <OptionMenu
                                options={[
                                    {
                                        text: 'Unassign User',
                                        icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                                        menuItemProps: {
                                            className: 'text-error',
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setDeleteConfirmation({
                                                    open: true,
                                                    data: { ...row?.original, ressourceType: 'user', type: 'deleteOne' },
                                                })
                                            }
                                        }
                                    }
                                ]}
                            />
                        ),
                        flex: .1
                    }
                ]);

                reset();
                break;
            case 'groups':
                setColumns([
                    {
                        accessorKey: 'name',
                        header: 'Name',
                        flex: 1,
                    },
                    {
                        accessorKey: 'description',
                        header: 'Description',
                        flex: 1,
                    },
                    {
                        accessorKey: 'users_in_group',
                        header: 'Users in Group',
                        flex: 1,
                    },
                    {
                        id: 'actions',
                        header: '',
                        cell: ({ row }) => (
                            <OptionMenu
                                options={[
                                    {
                                        text: 'Unassign Group',
                                        icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                                        menuItemProps: {
                                            className: 'text-error',
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setDeleteConfirmation({
                                                    open: true,
                                                    data: { ...row?.original, ressourceType: 'groups', type: 'deleteOne' },
                                                })
                                            }
                                        }
                                    }
                                ]}
                            />
                        ),
                        flex: .1
                    }
                ]);

                reset();
                break;
            case 'courses':
                setColumns([
                    {
                        accessorKey: 'name',
                        header: 'Name',
                        flex: 1,
                    },
                    {
                        accessorKey: 'path',
                        header: 'Path',
                        flex: 1,
                    },
                    {
                        accessorKey: 'descendants',
                        header: "Descendants",
                        flex: 1,
                    },
                    {
                        id: 'actions',
                        header: '',
                        cell: ({ row }) => (
                            <OptionMenu
                                options={[
                                    {
                                        text: 'Unassign Course',
                                        icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                                        menuItemProps: {
                                            className: 'text-error',
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setDeleteConfirmation({
                                                    open: true,
                                                    data: { ...row?.original, ressourceType: 'courses', type: 'deleteOne' },
                                                })
                                            }
                                        }
                                    }
                                ]}
                            />
                        ),
                        flex: .1
                    }
                ]);

                reset();
                break;
            case 'learningplans':
                setColumns([
                    {
                        accessorKey: 'name',
                        header: 'Name',
                        flex: 1,
                    },
                    {
                        accessorKey: 'description',
                        header: 'Description',
                        flex: 1,
                    },
                    {
                        accessorKey: 'users_in_learning_plan',
                        header: 'Users in Learning Plan',
                        flex: 1,
                    },
                    {
                        id: 'actions',
                        header: '',
                        cell: ({ row }) => (
                            <OptionMenu
                                options={[
                                    {
                                        text: 'Unassign Learning Plan',
                                        icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                                        menuItemProps: {
                                            className: 'text-error',
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setDeleteConfirmation({
                                                    open: true,
                                                    data: { ...row?.original, ressourceType: 'learningplans', type: 'deleteOne' },
                                                })
                                            }
                                        }
                                    }
                                ]}
                            />
                        ),
                        flex: .1
                    }

                ]);

                reset()
                break;
            case 'branches':
                setColumns([
                    {
                        accessorKey: 'code',
                        header: 'Code',
                        flex: 1,
                    },
                    {
                        accessorKey: 'name',
                        header: 'Name',
                        flex: 1,
                    },
                    {
                        accessorKey: 'users_in_branch',
                        header: 'Users in Branch',
                        flex: 1,
                    },
                    {
                        id: 'actions',
                        header: '',
                        cell: ({ row }) => (
                            <OptionMenu
                                options={[
                                    {
                                        text: 'Unassign Branch',
                                        icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                                        menuItemProps: {
                                            className: 'text-error',
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setDeleteConfirmation({
                                                    open: true,
                                                    data: { ...row?.original, ressourceType: 'branches', type: 'deleteOne' },
                                                })
                                            }
                                        }
                                    }
                                ]}
                            />
                        ),
                        flex: .1
                    }
                ]);

                reset()
                break;
            case 'catalogs':
                setColumns([
                    {
                        accessorKey: 'name',
                        header: 'Name',
                        flex: 1,
                    },
                    {
                        accessorKey: 'description',
                        header: 'Description',
                        flex: 1,
                    },
                    {
                        accessorKey: 'users_in_catalog',
                        header: 'Users in Catalog',
                        flex: 1,
                    },
                    {
                        id: 'actions',
                        header: '',
                        cell: ({ row }) => (
                            <OptionMenu
                                options={[
                                    {
                                        text: 'Unassign Catalog',
                                        icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                                        menuItemProps: {
                                            className: 'text-error',
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setDeleteConfirmation({
                                                    open: true,
                                                    data: { ...row?.original, ressourceType: 'catalogs', type: 'deleteOne' },
                                                })
                                            }
                                        }
                                    }
                                ]}
                            />
                        ),
                        flex: .1
                    }

                ]);

                reset()
                break;
            default:
                break;
        }
    }

    const handleDeleteSubmit = async () => {
        try {
            const { ressourceType: typeRessource, type } = deleteConfirmation?.data;
            const ids = selectedRows?.map(row => row?.id);
            if (type === 'deleteOne') {
                await unassignResource.mutateAsync({ id: powerUser?.id, data: { resource_type: typeRessource, resource_ids: [deleteConfirmation?.data?.id] } });
            } else {
                await unassignResource.mutateAsync({ id: powerUser?.id, data: { resource_type: typeRessource, resource_ids: ids } });
            }
            setDeleteConfirmation({ open: false, data: null, type: null });
            setSelectedRows([]);
        } catch (error) {
            console.error("Error deleting item:", error);
            throw error; // Re-throw so dialog can handle it
        }
    }

    return (
        <>
            <Box display="flex" gap={openRessourcePanel ? 4 : 0}>
                {/* Left Resource Panel */}
                {!isMobile ? <Box
                    sx={{
                        width: openRessourcePanel ? 280 : 0,
                        overflow: 'hidden',
                        transition: 'width 0.3s ease',
                    }}
                >
                    <Card>
                        <Box padding={2}>
                            <Typography variant="h4" fontWeight={600} textAlign="center">Ressources</Typography>
                            <Box display="flex" flexDirection="column" gap={2} mt={2}>
                                {resources?.map((option) => {
                                    const selected = ressourceType === option.key;
                                    return (
                                        <Card
                                            key={option.key}
                                            variant={selected ? 'elevation' : 'outlined'}
                                            sx={{
                                                border: selected ? '2px solid' : '1px solid',
                                                borderColor: selected ? 'primary.main' : 'divider',
                                                backgroundColor: selected ? 'primary.lighterOpacity' : 'background.paper',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease-in-out',
                                            }}
                                            onClick={() => changeRessourceType(option.key)}
                                        >
                                            <CardActionArea>
                                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: selected ? 'primary.main' : 'background.default',
                                                            color: selected ? 'background.default' : 'text.primary',
                                                            width: 32,
                                                            height: 32,
                                                        }}
                                                    >
                                                        {resourceIcons[option.key]}
                                                    </Avatar>
                                                    <Typography>{option.name}</Typography>
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Card>
                </Box>
                    : <Dialog open={openRessourcePanel} onClose={() => setOpenRessourcePanel(false)} fullScreen>
                        <DialogTitle>
                            Ressources
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Here you can manage the resources assigned to this user.
                            </DialogContentText>
                            <Box display="flex" flexDirection="column" gap={2} mt={2}>
                                {resources?.map((option) => {
                                    const selected = ressourceType === option.key;
                                    return (
                                        <Card
                                            key={option.key}
                                            variant={selected ? 'elevation' : 'outlined'}
                                            sx={{
                                                border: selected ? '2px solid' : '1px solid',
                                                borderColor: selected ? 'primary.main' : 'divider',
                                                backgroundColor: selected ? 'primary.lighterOpacity' : 'background.paper',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease-in-out',
                                            }}
                                            onClick={() => {
                                                changeRessourceType(option.key)
                                                setOpenRessourcePanel(false);
                                            }}
                                        >
                                            <CardActionArea>
                                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: selected ? 'primary.main' : 'background.default',
                                                            color: selected ? 'background.default' : 'text.primary',
                                                            width: 32,
                                                            height: 32,
                                                        }}
                                                    >
                                                        {resourceIcons[option.key]}
                                                    </Avatar>
                                                    <Typography>{option.name}</Typography>
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    );
                                })}
                            </Box>
                        </DialogContent>
                    </Dialog>
                }
                {/* Right Panel */}
                <Box flexGrow={1} sx={{ transition: 'width 0.3s ease' }}>
                    <DataView
                        columns={columns}
                        data={data?.data}
                        isLoading={isLoading}
                        error={error}
                        pagination={{
                            ...pagination,
                            total: data?.total,
                        }}
                        setPagination={setPagination}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        slots={{
                            globalFilter,
                            setGlobalFilter,
                            sorting,
                            setSorting,
                            columnVisibility,
                            setColumnVisibility,
                            openRessources: openRessourcePanel,
                            setOpenRessources: () => setOpenRessourcePanel((prev) => !prev),
                            features: {
                                search: true,
                                filter: false,
                                columnVisibility: true,
                                ressources: true,
                            },
                            emptyState: {
                                message: "No content assigned",
                                description: "There are no courses or learning plans assigned to this catalog yet.",
                                height: 'calc(100vh - 460px)',
                            },
                        }}
                        multiselectionActionBar={{
                            selectedRows,
                            total: data?.pagination?.total,
                            onClearSelection: () => setSelectedRows([]),
                            primaryActions: [
                                {
                                    id: 'delete',
                                    label: 'Unassign',
                                    color: 'error',
                                    handler: () => setDeleteConfirmation({ open: true, data: selectedRows, type: 'deleteMany' }),
                                }
                            ]
                        }}

                        noToolBar
                        datatablemulti
                        enableSelection
                        height="calc(100vh - 302px)"
                    />
                </Box>
            </Box>
            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={`Unassign Ressource`}
                    message={
                        deleteConfirmation?.type === 'deleteOne'
                            ? `Are you sure you want to unassign ${deleteConfirmation?.data?.name || deleteConfirmation?.data?.username}`
                            : `Are you sure you want to unassign ${deleteConfirmation?.data?.length} ressources?`
                    }
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
                            show: false,
                        },
                        icons: {
                            confirm: null,
                            cancel: null
                        },
                        buttons: {
                            confirm: 'Unassign',
                            cancel: 'Cancel',
                            processing: 'Unassigning...',
                        },
                        onConfirm: handleDeleteSubmit,
                        isLoading: unassignResource.isLoading,
                    }}
                    confirmationWord={deleteConfirmation?.data?.name || deleteConfirmation?.data?.username}
                    typingConfirmation={deleteConfirmation?.type === 'deleteOne' ? true : false}
                    isAsync
                />
            }

        </>
    );
};

export default AssignedRessources;
