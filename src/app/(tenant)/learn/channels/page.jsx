'use client';

import DataView from "@/views/DataView";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChannels, useDeleteChannel } from "@/hooks/api/tenant/learn/useChannels";
import ChannelsDrawer from "@/views/Forms/Channels/ChannelsDrawer";
import { columns } from "@/constants/Channels";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useTranslation } from '@/@core/contexts/translationContext';

const Page = () => {
    const { translate } = useTranslation();
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [drawerState, setDrawerState] = useState({
        open: false,
        type: null,
        data: null
    });

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        data: null,
        type: null,
        variant: 'default'
    });

    const [columnVisibility, setColumnVisibility] = useState({});

    const { data: channels, isLoading, error } = useChannels({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting
    });

    const router = useRouter()


    const deleteChannel = useDeleteChannel();

    const handleDeleteSubmit = async () => {
        try {

            const result = await deleteChannel.mutateAsync(deleteConfirmation?.data?.id);
            return result;

        } catch (error) {
            console.error('Error deleting channel:', error);
            throw error;
        }
    }

    return (
        <>
            <DataView
                title={translate('Channel management.PAGE_TITLE', 'Channels')}
                columns={columns(setDeleteConfirmation, router, translate)}
                toolbar={{
                    breadcrumbs: [{ label: translate('Channel management.BREADCRUMB_CHANNELS', 'Channels'), link: '/learn/channels' }],
                    buttonGroup: [
                        {
                            text: translate('Channel management.BUTTON_CREATE_CHANNEL', 'Create Channel'),
                            variant: 'contained',
                            tooltip: translate('Channel management.TOOLTIP_CREATE_CHANNEL', 'Create a new channel'),
                            icon: 'solar-add-circle-linear',
                            onClick: () => setDrawerState({ open: true, data: null, type: 'add_channel' })
                        }
                    ]
                }}
                data={channels?.items}
                isLoading={isLoading}
                error={error}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                pagination={{ ...pagination, total: channels?.pagination?.total }}
                setPagination={setPagination}
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
                        message: translate('Channel management.EMPTY_STATE_NO_CHANNELS', 'No channels found'),
                        description: translate('Channel management.EMPTY_STATE_DESCRIPTION', 'Create a new channel to get started'),
                        height: 'calc(100vh - 400px)'
                    }
                }}
                datatablemulti
                enableSelection={false}
            />
            {
                deleteConfirmation.open && <ConfirmationDialog
                    type='error'
                    isOpen={deleteConfirmation.open}
                    title={translate('Channel management.DIALOG_TITLE_DELETE_CHANNEL', 'Delete Channel')}
                    message={translate('Channel management.DIALOG_MESSAGE_DELETE_CHANNEL', { name: deleteConfirmation?.data?.name })}
                    onClose={() => setDeleteConfirmation({ open: false, data: null })}
                    actions={{
                        toast: {
                            show: false,
                        },
                        icons: {
                            confirm: null,
                            cancel: null
                        },
                        buttons: {
                            confirm: translate('common.delete', 'Delete'),
                            cancel: translate('common.cancel', 'Cancel'),
                            processing: translate('common.deleting', 'Deleting...'),
                        },
                        onConfirm: handleDeleteSubmit,
                        isLoading: deleteChannel.isLoading,
                    }}
                    confirmationWord={deleteConfirmation?.data?.name}
                    typingConfirmation={true}
                    isAsync
                />
            }
            {
                drawerState?.open && drawerState?.type === 'add_channel' &&
                <ChannelsDrawer
                    open={drawerState?.open}
                    data={drawerState?.data}
                    onClose={() => setDrawerState({ open: false, type: null, data: null })}
                />
            }
        </>
    );
}

export default Page;