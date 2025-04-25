import { Chip } from "@mui/material";
import * as yup from "yup";


export const FIELDS = [{
    value: "username",
    label: "Username",
},
{
    value: "first_name",
    label: "First name",
},
{
    value: "last_name",
    label: "Last name",
},
{
    value: "email",
    label: "Email",
},
{
    value: "branch_code",
    label: "Branch code",
}
]

export const schema = yup.object().shape({
    display_name: yup.string().required('Display name is required'),
    is_active: yup.boolean(),
    username_attribute: yup.string().oneOf(['email', 'username'], 'Please select a valid field').nullable(),
    enable_user_provisioning: yup.boolean(),
    provisioning_fields: yup.array().when('enable_user_provisioning', (enable_user_provisioning) => {
        return enable_user_provisioning
            ? yup.array().of(
                yup.object().shape({
                    field: yup.string().required('Please select a field'),
                    attribute: yup.string().required('Attribute is required'),
                    required: yup.boolean()
                })
            )
            : yup.array();
    })
});


export const defaultValues = {
    display_name: '',
    is_active: false,
    username_attribute: '',
    enable_user_provisioning: false,
    provisioning_fields: []
}


export const provisioningFieldsColumns = [
    {
        accessorKey: 'field',
        header: 'Field',
        flex: 1,
        cell: ({ row }) => FIELDS.find(field => field.value === row?.original?.field)?.label,
        enableSorting: false
    },
    {
        accessorKey: 'attribute',
        header: 'Attribute',
        flex: 1,
        enableSorting: false
    },
    {
        accessorKey: 'required',
        header: 'Required',
        flex: 1,
        cell: ({ row }) => (
            row.required ? <i className='solar-check-circle-outline text-xl text-success' /> : <i className='solar-close-circle-outline text-xl text-error' />
        ),
        enableSorting: false
    }
]

export const logsColumns = [
    {
        accessorKey: 'action',
        header: 'Action',
        id: 'action',
        flex: 1,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        id: 'status',
        cell: ({ row }) => <Chip variant='outlined' label={row?.original?.status === 'success' ? 'Success' : 'Failed'} color={row?.original?.status === 'success' ? 'success' : 'error'} />,
        flex: 1,
    },
    {
        accessorKey: 'user.name',
        header: 'User',
        id: 'user.name',
        flex: 1,
    },
    {
        accessorKey: 'partner.name',
        header: 'Partner',
        id: 'partner.name',
        flex: 1,
    },
    {
        accessorKey: 'details',
        header: 'Details',
        id: 'details',
        flex: 1,
    },
    {
        accessorKey: 'ip_address',
        header: 'IP Address',
        id: 'ip_address',
        flex: 1,
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        id: 'created_at',
        flex: 1,
    },
    {
        accessorKey: 'time_ago',
        header: 'Time Ago',
        id: 'time_ago',
        type: 'select',
        options: [
            {
                value: 'yesterday',
                label: 'Yesterday'
            },
            {
                value: 'today',
                label: 'Today'
            },
            {
                value: 'last_week',
                label: 'Last Week'
            },
            {
                value: 'last_month',
                label: 'Last Month'
            },
            {
                value: 'last_year',
                label: 'Last Year'
            }
        ],
        flex: 1,
    }
]