import OptionMenu from '@/@core/components/option-menu';
import * as yup from 'yup';

export const columns = (grantPowerUserDrawerState, setGrantPowerUserDrawerState, router, translate) => [
    {
        header: translate('Power User & Profile Management.TABLE_HEADER_NAME'),
        accessorKey: 'name',
        flex: 1,
        enableSorting: true
    },
    {
        header: translate('Power User & Profile Management.TABLE_HEADER_DESCRIPTION'),
        accessorKey: 'description',
        flex: 1,
        enableSorting: true
    },
    {
        header: translate('Power User & Profile Management.TABLE_HEADER_ASSIGNED_POWER_USERS'),
        accessorKey: 'assigned_power_users',
        flex: 1,
        enableSorting: true,
        type: 'number'
    },

    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <OptionMenu
                options={[
                    {
                        text: translate('Power User & Profile Management.MENU_EDIT_PROFILE'),
                        icon: <i className='solar-pen-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                router.push(`/powerusers/profiles/${row?.original.id}`);
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                    {
                        text: translate('Power User & Profile Management.MENU_GRANT_POWER_USER'),
                        icon: <i className='solar-user-check-rounded-outline' />,
                        menuItemProps: {
                            onClick: (e) => {
                                e.stopPropagation();
                                setGrantPowerUserDrawerState({ ...grantPowerUserDrawerState, open: true, data: row?.original });
                            },
                            className: 'flex items-center gap-2'
                        }
                    },
                ]}
            />
        ),
        enableSorting: false,
        flex: 0.1
    }
];

export const schema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().nullable(),
});

export const defaultValues = {
    name: '',
    description: '',
}
