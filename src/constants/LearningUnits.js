import OptionMenu from '@/@core/components/option-menu';
import { Chip } from '@mui/material';
import * as yup from 'yup';

export const columns = (setDrawerState, setDeleteConfirmation, translate) => [
    {
        accessorKey: 'title',
        header: translate('CR management.TABLE_HEADER_TITLE'),
        flex: 1
    },
    {
        accessorKey: 'type',
        header: 'Type',
        cell: (({ row }) => {
            const type = row?.original?.type;
            return (
                <Chip
                    variant='outlined'
                    size='small'
                    color='primary'
                    label={type?.toUpperCase()}
                />
            );
        }),
        flex: 1
    },
    {
        accessorKey: 'total_versions',
        header: translate('CR management.TABLE_HEADER_VERSIONS'),
        cell: (({ row }) => {
            const versionsCount = row?.original?.total_versions || 0
            return <Chip variant='outlined' size='small' color="primary" label={`${versionsCount} version${versionsCount !== 1 ? 's' : ''}`} />
        }),
        flex: 1
    },
    {
        accessorKey: 'created_at',
        header: translate('CR management.TABLE_HEADER_CREATION_DATE'),
        cell: (({ row }) => {
            const date = new Date(row?.original?.created_at);
            return date.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }),
        flex: 1
    },
    {
        accessorKey: 'updated_at',
        header: translate('CR management.TABLE_HEADER_UPDATED_AT'),
        cell: (({ row }) => {
            const date = new Date(row?.original?.updated_at);
            return date.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }),
        flex: 1
    },
    {

        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <OptionMenu
                options={[
                    {
                        text: translate('CR management.MENU_PREVIEW'),
                        icon: <i className='solar-eye-outline text-base' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({ open: true, data: row?.original, type: 'preview_learning_unit' });
                            },
                            className: 'flex items-center gap-2 text-base'
                        }
                    },
                    {
                        text: translate('common.edit'),
                        icon: <i className='solar-pen-outline text-base' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({ open: true, data: row?.original, type: 'edit_learning_unit' });
                            },
                            className: 'flex items-center gap-2 text-base'
                        }
                    },
                    {
                        text: translate('CR management.MENU_ASSIGN_TO_COURSE'),
                        icon: <i className='solar-checklist-outline text-base' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({ open: true, data: row?.original, type: 'assign_learning_unit_to_course' });
                            },
                            className: 'flex items-center gap-2 text-base'
                        }
                    },
                    {
                        icon: <i className='solar-trash-bin-minimalistic-2-outline text-base' />,
                        text: translate('common.delete'),
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                console.log('Deleting', row?.original);
                                setDeleteConfirmation({ open: true, data: row.original, type: 'delete_learning_unit' })
                            },
                            className: 'flex items-center gap-2 text-error  text-base'
                        }
                    }
                ]}
            />
        ),
        flex: .2
    }
]

export const schema = yup.object({
    host: yup.string().required('Host is required'),
    port: yup.string().matches(/^[0-9]+$/, 'Port must be numeric').required('Port is required'),
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    encryption: yup.string().required('Encryption is required'),
    from_address: yup.string().required('From Address is required').email('Invalid email address'),
    from_name: yup.string().required('From Name is required')
})

export const defaultValues = {
    host: "",
    port: "",
    username: "",
    password: "",
    encryption: "",
    from_address: "",
    from_name: ""
}