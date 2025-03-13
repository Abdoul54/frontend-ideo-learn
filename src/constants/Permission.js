import OptionMenu from '@/@core/components/option-menu';
import * as yup from 'yup';


export const columns = (drawerState, setDrawerState) => [
    {
        header: 'Code',
        accessorKey: 'code',
        flex: 1
    },
    {
        header: 'Name',
        accessorKey: 'name',
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
        header: 'Area',
        accessorKey: 'area',
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
                            onClick: (e) => {
                                e.stopPropagation();
                                setDrawerState({ ...drawerState, open: true, data: row?.original });
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
    code: yup.string().required('Code is required'),
    name: yup.string().required('Name is required'),
    description: yup.string(),
    area: yup.string().required('Area is required'),
    is_system: yup.boolean(),
    is_active: yup.boolean(),
    dependencies: yup.array(),
});

export const defaultValues = {
    code: '',
    name: '',
    description: '',
    area: '',
    is_system: false,
    is_active: false,
    dependencies: [],
}