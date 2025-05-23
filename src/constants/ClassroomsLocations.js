import OptionMenu from "@/@core/components/option-menu";
import { Chip } from "@mui/material";
import * as yup from "yup";
import { useTranslation } from '@/@core/contexts/translationContext';

export const classroomColumns = (setDrawerState, setDeleteConfirmation, unassignLocation) => {
    const { translate } = useTranslation();

    return [
        {
            accessorKey: 'name',
            header: translate('common.name', 'Name'),
            flex: 1
        },
        {
            accessorKey: 'seats',
            header: translate('CL management.TABLE_HEADER_SEATS', 'Seats'),
            cell: ({ row }) => {
                const seats = row?.getValue('seats');
                return <Chip variant='outlined' color='primary' size="small" label={seats} />
            },
            flex: 1
        },
        {
            accessorKey: 'equipment',
            header: translate('CL management.TABLE_HEADER_EQUIPMENT', 'Equipment'),
            flex: 1
        },
        {
            accessorKey: 'details',
            header: translate('CL management.TABLE_HEADER_DETAILS', 'Details'),
            flex: 1
        },
        {
            accessorKey: "created_at",
            header: translate('CL management.TABLE_HEADER_CREATED_AT', 'Created At'),
            cell: ({ row }) => {
                const date = new Date(row?.getValue('created_at'));
                return date.toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            },
            flex: 1
        },
        {
            accessorKey: "updated_at",
            header: translate('CL management.TABLE_HEADER_UPDATED_AT', 'Updated At'),
            cell: ({ row }) => {
                const date = new Date(row?.getValue('updated_at'));
                return date.toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            },
            flex: 1
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <OptionMenu
                    options={[
                        {
                            text: translate('common.edit', 'Edit'),
                            icon: <i className='solar-pen-outline' />,
                            menuItemProps: {
                                disabled: false,
                                onClick: (e) => {
                                    e.stopPropagation();
                                    setDrawerState({ open: true, data: row.original, type: 'edit_classroom' });
                                }
                            }
                        },
                        {
                            text: translate('CL management.MENU_ASSIGN_TO_LOCATION', 'Assign to a Location'),
                            icon: <i className='solar-link-outline' />,
                            menuItemProps: {
                                disabled: false,
                                onClick: (e) => {
                                    e.stopPropagation();
                                    setDrawerState({ open: true, data: row.original, type: 'assign' });
                                }

                            }
                        },
                        {
                            text: translate('CL management.MENU_UNASSIGN_FROM_LOCATION', 'Unassign from a Location'),
                            icon: <i className='solar-link-broken-outline' />,
                            menuItemProps: {
                                disabled: !row?.original?.id_location,
                                onClick: (e) => {
                                    e.stopPropagation();
                                    unassignLocation.mutateAsync(row.original?.id)
                                }
                            }
                        },
                        {
                            text: translate('common.delete', 'Delete'),
                            icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                            menuItemProps: {
                                className: 'text-error',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmation({
                                        open: true,
                                        data: row?.original,
                                        type: 'deleteOne',
                                        variant: 'default'
                                    })
                                }
                            }
                        }
                    ]}
                />
            ),
            flex: .1
        }
    ];
};

export const classroomDefaultValues = {
}

export const classroomSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    seats: yup.number().min(0, "Seats must be a positive number").required("Seats are required"),
    equipment: yup.string(),
    details: yup.string(),
    id_location: yup.number().nullable()
});


export const locationsColumns = (setDrawerState, setDeleteConfirmation) => {
    const { translate } = useTranslation();

    return [
        {
            accessorKey: 'name',
            header: translate('common.name', 'Name'),
            flex: 1
        },
        {
            accessorKey: 'address',
            header: translate('CL management.PLACEHOLDER_ADDRESS', 'Address'),
            flex: 1
        },
        {
            accessorKey: 'country',
            header: translate('CL management.TABLE_HEADER_COUNTRY', 'Country'),
            flex: 1
        },
        {
            accessorKey: 'telephone',
            header: translate('CL management.TABLE_HEADER_TELEPHONE', 'Telephone'),
            flex: 1
        },
        {
            accessorKey: 'email',
            header: translate('CL management.TABLE_HEADER_EMAIL', 'Email'),
            flex: 1
        },
        {
            accessorKey: 'reaching_info',
            header: translate('CL management.TABLE_HEADER_REACHING_INFO', 'Reaching Info'),
            flex: 1
        },
        {
            accessorKey: 'accomodations',
            header: translate('CL management.TABLE_HEADER_ACCOMODATIONS', 'Accomodations'),
            flex: 1
        },
        {
            accessorKey: 'other_info',
            header: translate('CL management.TABLE_HEADER_OTHER_INFO', 'Other Info'),
            flex: 1
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <OptionMenu
                    options={[
                        {
                            text: translate('CL management.MENU_VIEW', 'View'),
                            icon: <i className='solar-eye-outline' />,
                            menuItemProps: {
                                onClick: (e) => {
                                    e.stopPropagation();
                                    console.log('view', row);
                                }
                            }
                        },
                        {
                            text: translate('CL management.MENU_EDIT', 'Edit'),
                            icon: <i className='solar-pen-outline' />,
                            menuItemProps: {
                                disabled: false,
                                onClick: (e) => {
                                    e.stopPropagation();
                                    setDrawerState({ open: true, data: row.original, type: 'edit_location' });
                                }
                            }
                        },
                        {
                            text: translate('CL management.MENU_DELETE', 'Delete'),
                            icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                            menuItemProps: {
                                className: 'text-error',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmation({
                                        open: true,
                                        data: row?.original,
                                        type: 'deleteOne',
                                        variant: 'default'
                                    })
                                }
                            }
                        }
                    ]}
                />
            ),
            flex: .1
        }
    ];
};


export const locationsDefaultValues = {
    "name": "",
    "address": "",
    "country": "Morocco",
    "telephone": "",
    "email": "",
    "reaching_info": "",
    "accomodations": "",
    "other_info": "",
    "images": null
}

export const locationsSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    address: yup.string().required("Address is required"),
    country: yup.string().required("Country is required"),
    telephone: yup.string(),
    email: yup.string().email("Invalid email"),
    reaching_info: yup.string(),
    accomodations: yup.string(),
    other_info: yup.string()
})