import OptionMenu from "@/@core/components/option-menu";


export const columns = [
    {
        id: 'id',
        header: 'ID',
        cell: ({ row }) => row?.original?.id,
        enableSorting: true
    },
    {
        id: 'subordinate',
        header: 'Subordinate',
        cell: ({ row }) => row?.original?.subordinate?.name,
        enableSorting: true
    },
    {
        id: 'manager',
        header: 'Manager',
        cell: ({ row }) => row?.original?.manager?.name,
        enableSorting: true
    },
    {
        id: 'manager_type',
        header: 'Manager Type',
        cell: ({ row }) => row?.original?.manager_type?.name,
        enableSorting: true
    },
    {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => row?.original?.status,
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
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({ ...drawerState, open: true, data: row?.original });
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: 'Delete',
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmationState({ open: true, data: row?.original });
                            },
                            className: 'flex items-center gap-2 text-error hover:bg-errorLight'
                        }
                    }
                ]}
            />
        ),
        enableSorting: false,
        flex: 0.1
    }
];

// export const schema = yup.object({
//     subordinate_id: yup.number().required('Subordinate is required'),
//     manager_id: yup.number().required('Manager is required'),
//     manager_type_id: yup.number().required('Manager Type is required'),
//     status: yup.string().required('Status is required').oneOf(['confirmed', 'not_confirmed', 'pending', 'imported']),
// })

// export const managerTypes = [
//     {
//         value: 1,
//         label: 'Manager Type 1'
//     },
//     {
//         value: 2,
//         label: 'Manager Type 2'
//     },
//     {
//         value: 3,
//         label: 'Manager Type 3'
//     },
//     {
//         value: 4,
//         label: 'Manager Type 4'
//     }
// ];

// export const statuses = [
//     {
//         value: 'confirmed',
//         label: 'Confirmed'
//     },
//     {
//         value: 'not_confirmed',
//         label: 'Not Confirmed'
//     },
//     {
//         value: 'pending',
//         label: 'Pending'
//     },
//     {
//         value: 'imported',
//         label: 'Imported'
//     }
// ];

// export const defaultValues = {
//     status: 'confirmed'
// }