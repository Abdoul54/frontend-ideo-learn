import OptionMenu from '@/@core/components/option-menu';
import * as yup from 'yup';

export const columns = (drawerState, setDrawerState, grantProfileDrawerState, setGrantProfileDrawerState, setDeleteConfirmation) => [
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
                        text: 'Edit',
                        icon: <i className='solar-pen-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({ ...drawerState, open: true, data: row?.original });
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: 'Assign Profiles',
                        icon: <i className='solar-user-check-rounded-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setGrantProfileDrawerState({ ...grantProfileDrawerState, open: true, data: row?.original });
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: 'Unassign Profiles',
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
                        text: 'Remove Power User',
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
                                setDeleteConfirmation({ open: true, data: row?.original, type: 'unassign-poweruser', variant: 'simple' });
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
