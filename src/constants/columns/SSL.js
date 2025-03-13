import OptionMenu from "@/@core/components/option-menu";

export const columns = [
    {
        accessorKey: 'name',
        header: 'Name',
        flex: 1
    },
    {
        accessorKey: 'status',
        header: 'Status',
        flex: 1
    },
    {
        accessorKey: 'creation_date',
        header: 'Valid From',
        flex: 1
    },
    {
        accessorKey: 'expiration_date',
        header: 'Valid To',
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
                        text: 'Assign Domain',
                        icon: <i className='solar-diploma-verified-line-duotone' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                console.log('Assign Domain', row);
                            },
                            className: 'flex items-center gap-2'
                        }
                    }
                ]}
            />
        ),
        enableSorting: false,
        flex: .1
    }
];