import OptionMenu from "@/@core/components/option-menu";
import { Avatar, Chip } from "@mui/material";

export const columns = (setDeleteConfirmation, router, translate) => [
    {
        accessorKey: 'thumbnail',
        header: translate('Channel management.TABLE_HEADER_THUMBNAIL', 'Thumbnail'),
        cell: ({ row }) => {
            const thumbnail = row?.original?.thumbnail;
            return (
                <Avatar sx={{ width: 36, height: 36, bgcolor: thumbnail?.background_code_color }}>
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
        header: translate('Channel management.TABLE_HEADER_NAME', 'Name'),
        flex: 1
    },
    {
        accessorKey: 'description',
        header: translate('Channel management.TABLE_HEADER_DESCRIPTION', 'Description'),
        flex: 1
    },
    {
        accessorKey: 'visibility',
        header: translate('Channel management.TABLE_HEADER_VISIBILITY', 'Visibility'),
        cell: ({ cell }) => {
            const visibility = cell.getValue();
            return (
                <Chip size="small" label={visibility} variant="outlined" color="primary" />
            );
        },
        flex: 1
    },
    {
        accessorKey: 'status',
        header: translate('Channel management.TABLE_HEADER_STATUS', 'Status'),
        cell: ({ cell }) => {
            const status = cell.getValue();
            return (
                <Chip 
                    size="small" 
                    label={status?.toUpperCase()} 
                    variant="outlined" 
                    color={status === "published" ? "success" : "error"} 
                />
            );
        },
        flex: 1
    },
    {
        id: 'actions',
        header: translate('Channel management.TABLE_HEADER_ACTIONS', ''),
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
                                router.push(`/learn/channels/${row?.original?.id}`);
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