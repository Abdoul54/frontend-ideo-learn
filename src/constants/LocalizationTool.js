import OptionMenu from '@/@core/components/option-menu';
import { Tooltip } from '@mui/material';
import * as yup from 'yup';


export const columns = (drawerState, setDrawerState, changeLocalizationStatus) => [
    {
        header: 'Code',
        accessorKey: 'code',
        flex: 1
    },
    {
        header: 'Native Language',
        accessorKey: 'native_name',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Language',
        accessorKey: 'name',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Regional',
        accessorKey: 'regional',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Direction',
        accessorKey: 'direction',
        flex: 1,
        enableSorting: true
    },
    {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (
            <Tooltip
                title={row?.original?.is_default ? "Default" : row?.original?.is_active ? 'Active' : 'Inactive'}
                componentsProps={{
                    tooltip: {
                        sx: {
                            bgcolor: row?.original?.is_default ? "info.main" : row?.original?.is_active ? 'success.main' : 'error.main',
                            color: 'white',
                        }
                    }
                }}
            >
                <i className={`${row?.original?.is_default ? "solar-check-circle-bold-duotone text-info" : row?.original?.is_active ? "solar-check-circle-outline text-success" : "solar-close-circle-outline text-error"} text-xl`} />
            </Tooltip>
        ),
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
                        text: row?.original?.is_active ? 'Deactivate' : 'Activate',
                        icon: <i className={`${row?.original?.is_active ? 'solar-close-circle-outline' : 'solar-check-circle-outline'}`} />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                changeLocalizationStatus.mutate({ id: row?.original?.id })
                            },
                            className: `flex items-center gap-2 ${row?.original?.is_active ? 'text-error' : 'text-success'}`
                        }
                    },
                    {
                        text: 'Translate',
                        icon: <i className='solar-globus-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                console.log('translating..', row);
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: 'Edit',
                        icon: <i className='solar-pen-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({ ...drawerState, open: true, data: row?.original });
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: 'Export',
                        icon: <i className='solar-export-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                console.log('exporting..', row);
                            },
                            className: 'flex items-center gap-2'
                        }
                    }
                ]}
            />
        ),
        enableSorting: false,
        flex: 0.1
    }
];


export const schema = yup.object({
    name: yup.string().required('Name is required'),
    direction: yup.string().required('Direction is required').oneOf(['ltr', 'rtl']),
    is_default: yup.boolean().required('Default is required'),
})

export const defaultValues = {
    name: '',
    direction: 'ltr',
    is_default: false,
}