import OptionMenu from "@/@core/components/option-menu";

export const columns = [
    {
        accessorKey: 'id',
        header: 'ID',
        flex: 1
    },
    {
        accessorKey: 'smtpServer',
        header: 'SMTP Server',
        flex: 1
    },
    {
        accessorKey: 'port',
        header: 'Port',
        flex: 1
    },
    {
        accessorKey: 'username',
        header: 'Username',
        flex: 1
    },
    {
        accessorKey: 'password',
        header: 'Password',
        flex: 1
    },
    {
        accessorKey: 'sslEnabled',
        header: 'SSL Enabled',
        flex: 1
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <OptionMenu
                options={[
                    {
                        text: 'View',
                        icon: <i className='solar-eye-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                console.log('view', row);
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: 'Edit',
                        icon: <i className='solar-pen-outline' />,
                        menuItemProps: {
                            disabled: false,
                            onClick: (e) => {
                                e.stopPropagation();
                                console.log('edit', row);
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: 'Delete',
                        icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                        menuItemProps: {
                            className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                            onClick: (e) => {
                                e.stopPropagation();
                                console.log('delete', row);
                            }
                        }
                    }
                ]}
            />
        ),
        enableSorting: false,
        flex: .1
    }
];