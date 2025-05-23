import OptionMenu from '@/@core/components/option-menu';
import * as yup from 'yup';

export const columns = (drawerState, setDrawerState, setDeleteConfirmation, router, translate) => [
    {
        header: translate('Power User & Profile Management.TABLE_HEADER_USERNAME'),
        accessorKey: 'username',
        flex: 1,
        enableSorting: true
    },
    {
        header: translate('Power User & Profile Management.TABLE_HEADER_FIRST_NAME'),
        accessorKey: 'firstname',
        flex: 1,
        enableSorting: true
    },
    {
        header: translate('Power User & Profile Management.TABLE_HEADER_LAST_NAME'),
        accessorKey: 'lastname',
        flex: 1,
        enableSorting: true
    },
    {
        header: translate('Power User & Profile Management.TABLE_HEADER_EMAIL'),
        accessorKey: 'email',
        flex: 1,
        enableSorting: true
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <OptionMenu
                options={[
                    {
                        text: translate('Power User & Profile Management.MENU_EDIT'),
                        icon: <i className='solar-pen-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                router.push(`/powerusers/${row?.original?.id}`);
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: translate('Power User & Profile Management.MENU_ASSIGN_PROFILES'),
                        icon: <i className='solar-user-check-rounded-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({ ...drawerState, open: true, data: row?.original, type: 'assign_profiles' });
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: translate('Power User & Profile Management.MENU_ASSIGN_RESOURCES'),
                        icon: <i className='solar-user-check-rounded-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({ open: true, data: row?.original, type: 'assign_resources' });
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: translate('Power User & Profile Management.MENU_UNASSIGN_PROFILES'),
                        icon: <i className='solar-user-check-rounded-outline' />,
                        menuItemProps: {
                            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({ open: true, data: row?.original, type: 'unassign' });
                            }
                        }
                    },

                    {
                        text: translate('Power User & Profile Management.MENU_REMOVE_POWER_USER'),
                        className: 'text-error',
                        icon: <i className='solar-user-cross-rounded-outline' />,
                        menuItemProps: {
                            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({ open: true, data: row?.original });
                            }
                        }
                    },
                ]}
            />
        ),
        enableSorting: false,
        flex: 0.1
    }
];

export const profilePowerUsersColumns = (setDeleteConfirmation) => [
    {
        header: 'Username',
        accessorKey: 'username',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'First Name',
        accessorKey: 'firstname',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Last Name',
        accessorKey: 'lastname',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Email',
        accessorKey: 'email',
        flex: 1,
        enableSorting: true
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <OptionMenu
                options={[
                    {
                        text: 'Log in as this Power User',
                        icon: <i className='solar-login-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                console.log('Log in as this Power User');
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: 'Unassign Power User',
                        icon: <i className='solar-user-check-rounded-outline' />,
                        menuItemProps: {
                            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({ open: true, data: row?.original, type: 'deleteOne' })
                            }
                        }
                    },
                ]}
            />
        ),
        enableSorting: false,
        flex: 0.1
    }
];

export const schema = yup.object({
    user_ids: yup.array().of(yup.number()).required(),
});

export const defaultValues = {
    user_ids: []
}
