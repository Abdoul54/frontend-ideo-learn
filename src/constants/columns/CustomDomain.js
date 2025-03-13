import OptionMenu from "@/@core/components/option-menu";

export const columns = [
    {
        accessorKey: "tenant",
        header: "Tenant",
        flex: 1
    },
    {
        accessorKey: "url",
        header: "URL",
        flex: 1
    },
    {
        accessorKey: "status",
        header: "Status",
        flex: 1
    },
    {
        accessorKey: "ssl.status",
        header: "SSL Status",
        flex: 1
    },
    {
        accessorKey: "creation_date",
        header: "Creation Date",
        flex: 1
    },
    {
        accessorKey: "updated_at",
        header: "Last Updated",
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
                            }
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
                            }
                        }
                    },
                    {
                        text: 'Delete',
                        icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                        menuItemProps: {
                            className: 'text-error',
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