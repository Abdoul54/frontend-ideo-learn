import OptionMenu from "@/@core/components/option-menu";
import { Chip } from "@mui/material";

export const skillSetsColumns = (setDeleteConfirmation, setSkillSetDrawerState, router) => [
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
        accessorKey: 'visible_by',
        header: 'Visibility',
        flex: 1,
        cell: ({ row }) => {
            const visibleBranches = row?.original?.visible_by?.branches?.length || 0;
            const visibleGroups = row?.original?.visible_by?.groups?.length || 0;
            const isAllVisible = row?.original?.visible_by?.all;
            const isNoneVisible = visibleBranches === 0 && visibleGroups === 0;

            return (
                <Chip variant="outlined" color='secondary'
                    size="small"
                    label={
                        isAllVisible ? 'All' : isNoneVisible ? 'None' : `${new Intl.NumberFormat().format(visibleBranches)} branches / ${new Intl.NumberFormat().format(visibleGroups)} groups`} />
            )
        }
    },
    {
        accessorKey: 'available_skills',
        header: 'Skills',
        flex: 1,
        cell: ({ row }) => (
            <Chip
                disabled={row?.original?.available_skills === 0 || row?.original?.available_skills === "All"}
                variant="outlined"
                color={row?.original?.available_skills > 0 || row?.original?.available_skills === "All" ? 'primary' : 'secondary'}
                label={row?.original?.available_skills > 0 ? new Intl.NumberFormat().format(row?.original?.available_skills) : row?.original?.available_skills === "All" ? row?.original?.available_skills : 'None'}
                size="small"
                sx={{
                    textTransform: 'capitalize',
                    fontWeight: row?.original?.available_skills > 0 || row?.original?.available_skills === "All" ? 600 : 500,
                    marginBottom: 1
                }}
            />
        )
    },
    // {
    //     accessorKey: 'catalog',
    //     header: 'Catalog',
    //     flex: 1,
    // },
    // {
    //     accessorKey: 'ai_based_channels',
    //     header: 'AI Based Channels',
    //     flex: 1,
    //     cell: ({ row }) => (
    //         <Chip
    //             disabled={row?.original?.ai_based_channels === 0}
    //             variant="outlined"
    //             color={row?.original?.ai_based_channels > 0 ? 'primary' : 'secondary'}
    //             label={row?.original?.ai_based_channels > 0 ? new Intl.NumberFormat().format(row?.original?.ai_based_channels) : 'None'}
    //             size="small"
    //             sx={{
    //                 textTransform: 'capitalize',
    //                 fontWeight: row?.original?.ai_based_channels > 0 ? 600 : 500,
    //                 marginBottom: 1
    //             }}
    //         />
    //     )
    // },
    // {
    //     accessorKey: 'published',
    //     header: 'Published',
    //     flex: 1,
    //     cell: ({ row }) => (
    //         row?.original?.published ?
    //             <i className="solar-check-circle-outline text-success text-xl" />
    //             :
    //             <i className="solar-close-circle-outline text-error text-xl" />
    //     )
    // },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <OptionMenu
                options={[
                    {
                        text: 'Edit',
                        icon: <i className='solar-pen-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                router.push(`/skills/skill-groups/${row?.original?.id}`);
                                // setDrawerState({ open: true, type: 'skill_group', data: row?.original });
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: 'Assign skills to skill set',
                        icon: <i className='solar-add-square-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setSkillSetDrawerState({ open: true, data: row?.original });
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: 'Delete',
                        icon: <i className="solar-trash-bin-2-bold-duotone" />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({
                                    open: true,
                                    data: row?.original,
                                    type: 'deleteOne',
                                    variant: 'default'
                                });
                            },
                            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                        }
                    },
                ]}
            />
        ),
        enableSorting: false,
        flex: 0.1
    }
]

export const platformCatalogColumns = (setDeleteConfirmation, setDrawerState, setSkillDrawerState) => [
    {
        accessorKey: 'name',
        header: 'Name',
        flex: 1,
    },
    {
        accessorKey: 'source',
        header: 'Skill Source',
        flex: 1,
    },
    {
        accessorKey: 'skillsets_number',
        header: 'Skill Set',
        flex: 1,
        cell: ({ row }) => (
            <Chip
                variant="outlined"
                color={row?.original?.skillsets_number > 0 ? 'primary' : 'secondary'}
                label={row?.original?.skillsets_number > 0 ? new Intl.NumberFormat().format(row?.original?.skillsets_number) : 'None'}
                size="small"
                sx={{
                    textTransform: 'capitalize',
                    fontWeight: row?.original?.skillsets_number > 0 ? 600 : 500,
                    marginBottom: 1
                }}
            />
        )
    },
    {
        accessorKey: 'users',
        header: 'Users',
        flex: 1,
        cell: ({ row }) => (
            <Chip
                disabled={row?.original?.users_number === 0}
                variant="outlined"
                color={row?.original?.users_number > 0 ? 'primary' : 'secondary'}
                label={
                    row?.original?.users_number > 0
                        ? new Intl.NumberFormat().format(row?.original?.users_number)
                        : 'None'
                }
                size="small"
                sx={{
                    textTransform: 'capitalize',
                    fontWeight: row?.original?.users_number > 0 ? 600 : 500,
                    marginBottom: 1
                }}
            />
        )
    },
    // {
    //     accessorKey: 'content',
    //     header: 'Content',
    //     flex: 1,
    //     cell: ({ row }) => (
    //         <Chip
    //             variant="outlined"
    //             color={row?.original?.content_number > 0 ? 'primary' : 'secondary'}
    //             label={row?.original?.content_number > 0 ? new Intl.NumberFormat().format(row?.original?.content_number) : 'None'}
    //             size="small"
    //             sx={{
    //                 textTransform: 'capitalize',
    //                 fontWeight: row?.original?.content_number > 0 ? 600 : 500,
    //                 marginBottom: 1
    //             }}
    //         />
    //     )
    // },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <OptionMenu
                options={[
                    {
                        text: 'Edit',
                        icon: <i className='solar-pen-outline' />,
                        menuItemProps: {
                            // disabled: true,
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({ open: true, type: 'skill', data: row?.original });
                            },
                            className: 'flex items-center gap-2'
                        },
                    },
                    {
                        text: 'Assign to sets',
                        icon: <i className='solar-add-square-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setSkillDrawerState({ open: true, data: row?.original });
                            },
                            className: 'flex items-center gap-2'
                        },
                    },
                    {
                        text: 'Delete',
                        icon: <i className="solar-trash-bin-2-bold-duotone" />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({
                                    open: true,
                                    data: row?.original,
                                    type: 'deleteOne',
                                    variant: 'default'
                                })
                            },
                            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                        }
                    },
                ]}
            />
        ),
        enableSorting: false,
        flex: 0.1
    }
]

export const assignedSkillsColumns = (setDeleteConfirmation) => [
    {
        accessorKey: 'name',
        header: 'Name',
        flex: 1,
    },
    {
        accessorKey: 'source',
        header: 'Skill Source',
        flex: 1,
    },
    {
        accessorKey: 'skillsets_number',
        header: 'Skill Set',
        flex: 1,
        cell: ({ row }) => (
            <Chip
                variant="outlined"
                color={row?.original?.skillsets_number > 0 ? 'primary' : 'secondary'}
                label={row?.original?.skillsets_number > 0 ? new Intl.NumberFormat().format(row?.original?.skillsets_number) : 'None'}
                size="small"
                sx={{
                    textTransform: 'capitalize',
                    fontWeight: row?.original?.skillsets_number > 0 ? 600 : 500,
                    marginBottom: 1
                }}
            />
        )
    },
    {
        accessorKey: 'users',
        header: 'Users',
        flex: 1,
        cell: ({ row }) => (
            <Chip
                disabled={row?.original?.users_number === 0}
                variant="outlined"
                color={row?.original?.users_number > 0 ? 'primary' : 'secondary'}
                label={
                    row?.original?.users_number > 0
                        ? new Intl.NumberFormat().format(row?.original?.users_number)
                        : 'None'
                }
                size="small"
                sx={{
                    textTransform: 'capitalize',
                    fontWeight: row?.original?.users_number > 0 ? 600 : 500,
                    marginBottom: 1
                }}
            />
        )
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <OptionMenu
                options={[
                    {
                        text: 'Delete',
                        icon: <i className="solar-trash-bin-2-bold-duotone" />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({
                                    open: true,
                                    data: row?.original,
                                    type: 'deleteOne',
                                    variant: 'default'
                                })
                            },
                            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                        }
                    },
                ]}
            />
        ),
        enableSorting: false,
        flex: 0.1
    }
]

