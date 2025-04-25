import OptionMenu from "@/@core/components/option-menu";
import { Chip } from "@mui/material";
import * as yup from "yup";

export const classroomColumns = (setDrawerState, setDeleteConfirmation, unassignLocation) => [
    {
        accessorKey: "name",
        header: "Name",
        flex: 1
    },
    {
        accessorKey: "seats",
        header: "Seats",
        cell: ({ row }) => {
            const seats = row?.getValue('seats');
            return <Chip variant='outlined' color='primary' size="small" label={seats} />
        },
        flex: 1
    },
    {
        accessorKey: "equipment",
        header: "Equipment",
        flex: 1
    },
    {
        accessorKey: "details",
        header: "Details",
        flex: 1
    },
    {
        accessorKey: "created_at",
        header: "Created At",
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
        header: "Updated At",
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
                        text: 'Edit',
                        icon: <i className='solar-pen-outline' />,
                        menuItemProps: {
                            disabled: false,
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({ open: true, data: row.original, type: 'edit' });
                            }
                        }
                    },
                    {
                        text: 'Assign to a Location',
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
                        text: 'Unassign from a Location',
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
                        text: 'Delete',
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
]


export const classroomDefaultValues = {
}

export const classroomSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    seats: yup.number().min(0, "Seats must be a positive number").required("Seats are required"),
    equipment: yup.string(),
    details: yup.string(),
    id_location: yup.number().nullable()
})


export const locationsColumns = (setDrawerState, setDeleteConfirmation) => [
    {
        accessorKey: "name",
        header: "Name",
        flex: 1
    },
    {
        accessorKey: "address",
        header: "Address",
        flex: 1
    },
    {
        accessorKey: "country",
        header: "Country",
        flex: 1
    },
    {
        accessorKey: "telephone",
        header: "Telephone",
        flex: 1
    },
    {
        accessorKey: "email",
        header: "Email",
        flex: 1
    },
    {
        accessorKey: "reaching_info",
        header: "Reaching Info",
        flex: 1
    },
    {
        accessorKey: "accomodations",
        header: "Accomodations",
        flex: 1
    },
    {
        accessorKey: "other_info",
        header: "Other Info",
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
                                setDrawerState({ open: true, data: row.original });
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
]


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