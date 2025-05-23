'use client';

import {
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Grid2 as Grid,
    List,
    ListItem,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import DataView from "@/views/DataView";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAddChannelContents, useAvailableContents } from "@/hooks/api/tenant/learn/useChannels";
import { useTranslation } from '@/@core/contexts/translationContext';

const ContentsDrawer = ({ open, onClose, data }) => {
    const { translate } = useTranslation();
    const { handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            "contents": []
        }
    });

    const createChannelContent = useAddChannelContents(data?.id)
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [search, setSearch] = useState('');
    const [customVisibility, setCustomVisibility] = useState({});
    const [sorting, setSorting] = useState([]);

    const { data: contents, isLoading, error } = useAvailableContents({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: search,
        sort: sorting
    });

    const onSubmit = async (data) => {
        try {
            const formData = data?.contents?.map((item) => {
                return {
                    content_id: item?.content_id,
                    content_type: item?.content_type
                }
            });

            await createChannelContent?.mutateAsync({ contents: formData }).then(() => {
                reset();
                onClose();
            });

        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error
        }
    };

    return (
        <DrawerFormContainer
            title={translate('Channel management.DRAWER_TITLE_ASSIGN_CONTENTS', 'Assign Contents')}
            description={translate('Channel management.DRAWER_DESCRIPTION_ASSIGN_CONTENTS', 'Select content to assign to this channel')}
            open={open}
            onClose={onClose}
        >
            <Card
                component={'form'}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                autoComplete="off"
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 0
                }}
            >
                <CardContent
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'auto',
                        p: 2,
                        '&::-webkit-scrollbar': { width: '0.4em' },
                        '&::-webkit-scrollbar-track': { background: 'var(--mui-palette-background-paper)' },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'var(--mui-palette-primary-main)',
                            borderRadius: 2
                        }
                    }}
                >
                    <Grid container rowSpacing={3} padding={2} component={List}>
                        <Grid item size={12} component={ListItem}>
                            <DataView
                                getRowId={(row) => row?.uuid}
                                columns={[
                                    {
                                        accessorKey: 'code',
                                        header: translate('Channel management.TABLE_HEADER_CODE', 'Code'),
                                        flex: 1
                                    },
                                    {
                                        accessorKey: 'name',
                                        header: translate('Channel management.TABLE_HEADER_NAME', 'Name'),
                                        flex: 1
                                    },
                                    {
                                        accessorKey: 'content_type',
                                        header: translate('Channel management.TABLE_HEADER_TYPE', 'Type'),
                                        cell: ({ row }) => {
                                            const type = row?.original?.content_type === 'course' 
                                                ? translate('Channel management.CONTENT_TYPE_COURSE', 'Course') 
                                                : translate('Channel management.CONTENT_TYPE_LEARNING_PLAN', 'Learning Plan');
                                            return <Chip label={type} variant="outlined" color="primary" size="small" />;
                                        },
                                        flex: 1
                                    }
                                ]}
                                data={contents?.data}
                                isLoading={isLoading}
                                error={error}
                                enableSelection
                                height="calc(100vh - 250px)"
                                pagination={{
                                    ...pagination,
                                    total: contents?.meta?.pagination?.total
                                }}
                                setPagination={setPagination}
                                selectedRows={watch('contents')}
                                setSelectedRows={value => setValue('contents', value)}
                                disableMultiSelect
                                slots={{
                                    globalFilter: search,
                                    setGlobalFilter: setSearch,
                                    columnVisibility: customVisibility,
                                    setColumnVisibility: setCustomVisibility,
                                    sorting: sorting,
                                    setSorting: setSorting,
                                    features: {
                                        search: true,
                                        filter: false,
                                        columnVisibility: true
                                    },
                                    emptyState: {
                                        message: translate('Channel management.EMPTY_STATE_NO_CONTENT', 'No content found'),
                                        description: translate('Channel management.EMPTY_STATE_DESCRIPTION', 'Try adjusting your search criteria'),
                                        height: 'calc(100vh - 410px)'
                                    }
                                }}
                                noToolBar
                                noMobileDataTable
                            />
                        </Grid>
                    </Grid>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={createChannelContent?.isLoading}>
                        {translate('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={createChannelContent?.isLoading || watch('contents')?.length === 0}
                    >
                        {createChannelContent?.isLoading 
                            ? translate('common.saving', 'Saving...') 
                            : translate('common.save', 'Save')}
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default ContentsDrawer;