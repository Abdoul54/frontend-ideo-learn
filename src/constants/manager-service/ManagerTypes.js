import OptionMenu from "@/@core/components/option-menu";
import { Tooltip } from "@mui/material";
import * as yup from "yup";

export const columns = ({ onEdit, onDelete }) => [
    {
        type: 'manager_type_name',
        header: 'Type',
        accessorKey: 'manager_type_name',
        cell: ({ row }) => row?.original?.manager_type_name,
        enableSorting: true
    },
    {
        type: 'manager_type_description',
        header: 'Description',
        accessorKey: 'manager_type_description',
        cell: ({ row }) => row?.original?.manager_type_description,
        enableSorting: true
    },
    {
        type: 'manager_type_active',
        header: 'Active',
        accessorKey: 'manager_type_active',
        cell: ({ row }) => (
            <Tooltip title={row?.original?.manager_type_active ? "Active" : "Inactive"}>
                {row?.original?.manager_type_active
                    ? <i className="solar-check-circle-outline text-success text-xl" />
                    : <i className="solar-close-circle-outline text-error text-xl" />}
            </Tooltip>
        ),
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
                        icon: 'solar-pen-2-line-duotone',
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                onEdit(row.original);
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: 'Delete',
                        icon: 'solar-trash-bin-2-bold-duotone',
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                onDelete(row.original.manager_type_id);
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

// Define validation schema
export const createSchema = () => {
    return yup.object().shape({
        code: yup.string().required('Code is required').max(50, 'Code must not exceed 50 characters'),
        name: yup.object().shape({
            type: yup.string().oneOf(['single_value', 'multi_lang']),
            value: yup.string().when('type', {
                is: 'single_value',
                then: (schema) => schema.required('Name is required').max(255, 'Name must not exceed 255 characters'),
                otherwise: (schema) => schema
            }),
            values: yup.object().when('type', {
                is: 'multi_lang',
                then: (schema) => schema.shape({
                    en: yup.string().required('English name is required'),
                    fr: yup.string().required('French name is required')
                }),
                otherwise: (schema) => schema
            })
        }),
        description: yup.object().shape({
            type: yup.string().oneOf(['single_value', 'multi_lang']),
            value: yup.string().when('type', {
                is: 'single_value',
                then: (schema) => schema.required('Name is required').max(255, 'Name must not exceed 255 characters'),
                otherwise: (schema) => schema
            }),
            values: yup.object().when('type', {
                is: 'multi_lang',
                then: (schema) => schema.shape({
                    en: yup.string().required('English description is required'),
                    fr: yup.string().required('French description is required')
                }),
                otherwise: (schema) => schema
            })
        }),
        is_active: yup.boolean()
    });
};
