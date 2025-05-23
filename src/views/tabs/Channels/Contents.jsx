'use client'

import { useState } from "react";
import DataView from "@/views/DataView";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import OptionMenu from "@/@core/components/option-menu";
import { useChannelContents, useDeleteChannelContents } from "@/hooks/api/tenant/learn/useChannels";
import { useRouter } from "next/navigation";
import { useTranslation } from '@/@core/contexts/translationContext';

const Contents = ({ channelId }) => {
    const { translate } = useTranslation();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const [columnVisibility, setColumnVisibility] = useState({});

    const { data, isLoading, error } = useChannelContents({
        channelId: 1,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting,
    })

    const router = useRouter()

    const deleteContent = useDeleteChannelContents(channelId);

    const handleDeleteSubmit = async () => {
        try {
            if (deleteConfirmation?.type === 'deleteOne') {
                // Return the Promise so the dialog knows to wait
                return deleteContent.mutateAsync({ content_ids: [deleteConfirmation?.data?.id] });
            }
            else if (deleteConfirmation?.type === 'deleteMany') {
                // Return the Promise so the dialog knows to wait
                return deleteContent.mutateAsync({
                    content_ids: selectedRows?.map(row => row?.id),
                });
            }
        } catch (error) {
            console.error('Error deleting classroom:', error);
            throw error; // Re-throw so dialog can handle it
        }
    }

    return (
        <>
            <DataView
                title={translate('Channel management.TAB_CONTENTS', 'Contents')}
                columns={[
                    {
                        accessorKey: 'title',
                        header: translate('Channel management.TABLE_HEADER_TITLE', 'Title'),
                        cell: ({ row }) => {
                            const { content } = row.original;
                            return content?.title || content?.name
                        },
                        flex: 1
                    },
                    {
                        accessorKey: 'content.short_description',
                        header: translate('Channel management.TABLE_HEADER_SHORT_DESCRIPTION', 'Short Description'),
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
                                                const url = row?.original?.content_type === 'learningplan' ? `/learn/learning-plans/${row?.original?.content_id}` : `/learn/course/edit/${row?.original?.content_id}`;
                                                router.push(url);
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
                                                    type: 'deleteOne'
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

                ]}
                data={data?.items}
                height="calc(100vh - 326px)"
                isLoading={isLoading}
                error={error}
                pagination={{ ...pagination, total: data?.pagination?.total }}
                setPagination={setPagination}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                enableSelection
                noToolbar
                slots={{
                    globalFilter,
                    setGlobalFilter,
                    sorting,
                    setSorting,
                    columnVisibility,
                    setColumnVisibility,
                    features: {
                        search: true,
                        filter: false,
                        columnVisibility: true
                    }, 
                    emptyState: {
                        message: translate('Channel management.EMPTY_STATE_NO_CONTENT', 'No content found'),
                        description: translate('Channel management.EMPTY_STATE_ADD_CONTENT', 'Assign content to this channel to get started'),
                        height: 'calc(100vh - 480px)'
                    }
                }}
                multiselectionActionBar={{
                    selectedRows,
                    total: data?.pagination?.total,
                    onClearSelection: () => setSelectedRows([]),
                    primaryActions: [
                        {
                            id: 'delete',
                            label: translate('Channel management.BUTTON_UNASSIGN_CONTENT', 'Unassign Content'),
                            color: 'error',
                            handler: () => {
                                deleteConfirmation({
                                    open: true,
                                    data: selectedRows,
                                    type: 'deleteMany',
                                    variant: 'default'
                                })
                            },
                        }
                    ]
                }}
                datatablemulti
            />

            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={translate(
  deleteConfirmation?.type === 'deleteMany' 
    ? 'Channel management.DIALOG_TITLE_UNASSIGN_MULTIPLE' 
    : 'Channel management.DIALOG_TITLE_UNASSIGN_SINGLE'
)}
message={
  deleteConfirmation?.type === 'deleteMany'
    ? translate('Channel management.DIALOG_MESSAGE_UNASSIGN_MULTIPLE')
    : translate('Channel management.DIALOG_MESSAGE_UNASSIGN_SINGLE', {
        contentName: deleteConfirmation?.data?.content?.title || 
                     deleteConfirmation?.data?.content?.name || 
                     translate('Channel management.DIALOG_MESSAGE_CONTENT', 'content')
      })
}
                    onClose={() => setDeleteConfirmation({ open: false, data: null, type: null })}
                    actions={{
                        toast: {
                            show: false,
                        },
                        icons: {
                            confirm: null,
                            cancel: null
                        },
                        buttons: {
                            confirm: translate('Channel management.BUTTON_UNASSIGN', 'Unassign'),
                            cancel: translate('common.cancel', 'Cancel'),
                            processing: translate('Channel management.PROCESSING_UNASSIGNING', 'Unassigning...'),
                        },
                        onConfirm: handleDeleteSubmit,
                        isLoading: deleteContent.isPending,
                    }}
                    confirmationWord={deleteConfirmation?.data?.content?.title || deleteConfirmation?.data?.content?.name}
                    typingConfirmation={deleteConfirmation?.type === 'deleteMany' ? false : true}
                    isAsync
                />
            }
        </>
    );
};

export default Contents
