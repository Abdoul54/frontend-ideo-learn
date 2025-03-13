import OptionMenu from "@/@core/components/option-menu";

export const columns = [
    {
        header: 'First Name',
        accessorKey: 'firstName',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Last Name',
        accessorKey: 'lastName',
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
        header: 'Age',
        accessorKey: 'age',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'City',
        accessorKey: 'city',
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
                            disabled: true,
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