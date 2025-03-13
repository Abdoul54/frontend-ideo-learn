import * as yup from "yup";
import OptionMenu from "@/@core/components/option-menu";
import { Chip, Link } from "@mui/material";

export const columns = (setDeleteConfirmation, router) => [
    {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => {
            return <Link href={`/manage/groups/${row?.original?.id}`} underline="false" className="text-textPrimary hover:text-primary transition-colors ease-in-out delay-100">{row?.original?.name}</Link>
        },
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Description',
        accessorKey: 'description',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Type',
        accessorKey: 'type',
        cell: ({ row }) => <Chip variant='tonal' label={row?.original?.type === 'manual' ? 'Manual' : 'Automatic'} color="info" />,
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
                        icon: <i className="lucide-pen-line text-base" />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                router.push(`/manage/groups/${row?.original?.id}`)
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    // {
                    //     text: 'Duplicate',
                    //     icon: <i className="lucide-copy-plus text-base" />,
                    //     menuItemProps: {
                    //         onClick: (e) => {
                    //             e.stopPropagation();
                    //             setDrawerState({
                    //                 open: true, data: row.original
                    //             })
                    //         },
                    //         className: 'flex items-center gap-2'
                    //     }
                    // },
                    {
                        text: 'Delete',
                        icon: <i className="lucide-trash  text-base" />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({
                                    open: true, data: row.original
                                })
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

export const groupsUsersColumns = (setDeleteConfirmation) => [
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
        header: 'Username',
        accessorKey: 'username',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Relation Type',
        accessorKey: 'relation_type',
        cell: ({ row }) => <Chip variant='tonal' label={row?.original?.relation_type === 'manual' ? 'Manual' : 'Automatic'} color="info" />,
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
                        text: 'Remove from group',
                        icon: <i className='solar-trash-bin-minimalistic-2-outline' />,
                        menuItemProps: {
                            className: 'text-error',
                            onClick: (e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({
                                    open: true, data: row.original
                                })
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


export const defaultValues = {
    name: '',
    description: '',
    type: ''
}


export const schema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().nullable(),
    type: yup.string().required('Type is required')
})


export const updateGroupSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    description: yup.string().nullable(),
    exclude_deactivated_users: yup.boolean().nullable(),
    ruleset: yup.object().shape({
        operator: yup.string().required('Match Type is required'),
        sets: yup.array().of(yup.object().shape({
            rules_operator: yup.string().required('Rules Operator is required'),
            rules: yup.array().of(yup.object().shape({
                type: yup.string().required('Rule Type is required'),
                payload: yup.object().nullable()
            }))
        })).min(1, 'At least one rule set is required')
    })
});

export const updateDefaultValue = {
    name: '',
    description: '',
    exclude_deactivated_users: false,
    ruleset: {
        operator: "AND",
        sets: []
    }
}


export const SET_OPERATORS = [
    { label: 'Match ALL (AND)', value: 'AND' },
    { label: 'Match ANY (OR)', value: 'OR' }
];



export const setsSchema = yup.object({
    rules_operator: yup.string()
        .required('Rules operator is required')
        .oneOf(['AND', 'OR'], 'Rules operator must be AND or OR'),
    rules: yup.array().of(
        yup.object({
            type: yup.string()
                .required('Rule type is required')
                .oneOf(['enrollment_status', 'branch', 'user', 'userfield'], 'Invalid rule type'),
            payload: yup.object().when('type', {
                // Enrollment Status validation
                is: 'enrollment_status',
                then: () => yup.object({
                    course_id: yup.number()
                        .required('Course ID is required')
                        .positive('Course ID must be positive')
                        .integer('Course ID must be an integer')
                        .typeError('Course ID must be a number'),
                    enrollment_status: yup.string()
                        .required('Enrollment status is required')
                        .oneOf(['enrolled', 'completed', 'in_progress'], 'Invalid enrollment status'),
                }),
                // Branch validation
                otherwise: (schema) => schema.when('type', {
                    is: 'branch',
                    then: () => yup.object({
                        branch_id: yup.number()
                            .required('Branch ID is required')
                            .positive('Branch ID must be positive')
                            .integer('Branch ID must be an integer')
                            .typeError('Branch ID must be a number'),
                    }),
                    // User validation
                    otherwise: (schema) => schema.when('type', {
                        is: 'user',
                        then: () => yup.object({
                            field: yup.string()
                                .required('Field is required')
                                .oneOf(['email', 'name', 'firstname', 'lastname'], 'Invalid field'),
                            operator: yup.string()
                                .required('Operator is required')
                                .oneOf(['is_equal', 'is_not_equal', 'contains', 'does_not_contain'], 'Invalid operator'),
                            value: yup.string()
                                .required('Value is required')
                                .max(255, 'Value must be less than 255 characters'),
                        }),
                        // Userfield validation
                        otherwise: () => yup.object({
                            userfield_id: yup.number()
                                .required('User Field ID is required')
                                .positive('User Field ID must be positive')
                                .integer('User Field ID must be an integer')
                                .typeError('User Field ID must be a number'),
                            operator: yup.string()
                                .required('Operator is required')
                                .oneOf(['is_equal', 'is_not_equal', 'contains', 'does_not_contain'], 'Invalid operator'),
                            value: yup.string()
                                .required('Value is required')
                                .max(255, 'Value must be less than 255 characters'),
                        }),
                    }),
                }),
            }),
        })
    ).min(1, 'At least one rule is required'),
});



// Rule type options
export const ruleTypes = [
    { value: 'enrollment_status', label: 'Enrollment Status' },
    { value: 'branch', label: 'Branch' },
    { value: 'user', label: 'User' },
    { value: 'userfield', label: 'User Field' },
];

// User fields options
export const userFieldsOptions = [
    { value: 'email', label: 'Email' },
    { value: 'name', label: 'Name' },
    { value: 'firstname', label: 'First Name' },
    { value: 'lastname', label: 'Last Name' },
];

// Operators
export const operators = [
    { value: 'is_equal', label: 'Equals' },
    { value: 'is_not_equal', label: 'Not Equals' },
];

// Enrollment statuses
export const enrollmentStatuses = [
    { value: 'enrolled', label: 'Enrolled' },
    { value: 'completed', label: 'Completed' },
    { value: 'in_progress', label: 'In Progress' },
];