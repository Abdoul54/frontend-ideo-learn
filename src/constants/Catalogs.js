import OptionMenu from "@/@core/components/option-menu";
import { Avatar, Box, Chip } from "@mui/material";
import { useTranslation } from '@/@core/contexts/translationContext';

export const columns = (setDeleteConfirmation, router, setDrawerState) => {
    const { translate } = useTranslation();

    return [
        {
            accessorKey: 'thumbnail',
            header: translate('Catalog management.TABLE_HEADER_THUMBNAIL', 'Thumbnail'),
            cell: ({ row }) => {
                const thumbnail = row?.original?.thumbnail;
                return (
                    <Avatar sx={{ width: 36, height: 36, bgcolor: thumbnail?.backgroud_code_color }}>
                        <i className={thumbnail?.icon} style={{
                            color: thumbnail?.icon_code_color,
                            fontSize: 16,
                        }} />
                    </Avatar>
                );
            },
            flex: 1
        },
        {
            accessorKey: 'name',
            header: translate('Catalog management.TABLE_HEADER_NAME', 'Name'),
            cell: ({ row }) => (
                <Box
                    sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        '&:hover': {
                            textDecoration: 'underline'
                        }
                    }}
                    component="a"
                    href={`/learn/course-catalog/${row.original.id}`}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    {row.original.name}
                </Box>
            ),
            flex: 1
        },
        {
            accessorKey: 'description',
            header: translate('Catalog management.TABLE_HEADER_DESCRIPTION', 'Description'),
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
                                    setDrawerState({
                                        open: true,
                                        type: 'edit_catalog',
                                        data: row?.original
                                    });
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
            enableSorting: false,
            flex: 0.1
        }
    ];
}