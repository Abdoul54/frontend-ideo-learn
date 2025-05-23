'use client';

import { Controller, useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    FormControl,
    FormControlLabel,
    Grid2 as Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Radio,
    RadioGroup,
    Switch,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useMemo, useState } from "react";
import DataView from "@/views/DataView";
import TextInput from "@/components/inputs/TextInput";
import SmartMultilangTextInput from "@/components/inputs/MultilangInput";
import { useCreateFolder, useFolder, useFolders, useUpdateFolder } from "@/hooks/api/tenant/repos/useFolders";
import useHistoryNavigation from "@/hooks/useHistoryNavigation";

const FolderDrawer = ({ open, onClose, data, translate }) => {
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset
    } = useForm({
        defaultValues: {
            code: "",
            id_parent: 1,
            translations: { all: "" }
        },
    });

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});
    const [isAll, setIsAll] = useState(false);
    const [folderId, setFolderId] = useState(1);

    const { data: folder, error: folderError } = useFolder(data?.id);
    const { history, currentItem, goForward, goToBreadcrumb, goBack } =
        useHistoryNavigation({ id: 1, title: 'IDEO' });

    const { data: folders, error: foldersError, isLoading: foldersLoading } =
        useFolders({
            page: pagination.pageIndex + 1,
            folderId,
            page_size: pagination.pageSize,
            search: globalFilter,
            sort: sorting,
            search_type: 2,
        });

    const createFolder = useCreateFolder();
    const updateFolder = useUpdateFolder();

    const clickableBreadcrumbs = useMemo(
        () =>
            history?.map(item => ({
                ...item,
                onClick: () => goToBreadcrumb(item),
                isActive: item.id === currentItem.id,
            })),
        [history, currentItem, goToBreadcrumb]
    );

    // Sync folderId whenever currentItem changes
    useEffect(() => {
        if (currentItem?.id !== undefined) {
            setFolderId(currentItem.id);
        }
    }, [currentItem]);

    // Populate form on open/edit
    useEffect(() => {
        if (folder) {
            reset({
                code: folder.code,
                id_parent: folder.idParent || 1,
                translations: { ...folder.translations },
            });
        }
    }, [folder, reset]);

    const onSubmit = (submittedData) => {
        const { code, id_parent, translations } = submittedData;

        if (isAll) {
            translations = {
                all: translations.all
            }
        } else {
            delete translations.all;

            translations = {
                ...translations
            }
        }

        const folderData = {
            code,
            id_parent,
            translations
        };

        if (data) {
            updateFolder.mutateAsync({ id: data.id, data: folderData });
        } else {
            createFolder.mutateAsync(folderData);
        }

        onClose();
    };

    return (
        <DrawerFormContainer
            title={data ? data?.title : "Create Folder"}
            description={data ? "Edit folder details" : "Create a new folder to organize your content."}
            open={open}
            onClose={onClose}
        >
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
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
                            <FormControl>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isAll}
                                            onChange={e => setIsAll(e.target.checked)}
                                        />
                                    }
                                    label={
                                        <ListItemText
                                            primary={translate('common.ALL_LANGUAGES')}
                                            secondary={translate('common.APPLY_TO_ALL_LANGUAGES')}
                                        />
                                    }
                                />
                            </FormControl>
                        </Grid>

                        <Grid item size={12} component={ListItem}>
                            <TextInput name="code" control={control} label={translate('common.FIELD_CODE')} />
                        </Grid>

                        {isAll ? (
                            <Grid item size={12} component={ListItem}>
                                <TextInput
                                    name="translations.all"
                                    control={control}
                                    rules={{ required: "Title is required" }}
                                    label={translate('common.FIELD_TITLE')}
                                />
                            </Grid>
                        ) : (
                            <Grid item size={12} component={ListItem}>
                                <SmartMultilangTextInput
                                    name="translations"
                                    control={control}
                                    label={translate('common.FIELD_TITLE')}
                                    watch={watch}
                                    getValues={getValues}
                                    setValue={setValue}
                                />
                            </Grid>
                        )}
                        <Grid item size={12} component={ListItem}>
                            <Controller
                                name="id_parent"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl error={!!error} fullWidth>
                                        <RadioGroup {...field}>
                                            <DataView
                                                title="Folders"
                                                columns={[
                                                    {
                                                        accessorKey: "id",
                                                        header: "",
                                                        cell: ({ row }) => (
                                                            <FormControlLabel
                                                                value={row.original.id}
                                                                control={<Radio />}
                                                            />
                                                        ),
                                                        flex: .1
                                                    },
                                                    {
                                                        accessorKey: "title",
                                                        header: translate('CR management.TABLE_HEADER_FOLDER_TITLE'),
                                                        flex: 1
                                                    },
                                                    {
                                                        accessorKey: "action",
                                                        header: "",
                                                        cell: ({ row }) =>
                                                            row.original.has_child && (
                                                                <IconButton
                                                                    onClick={() => {
                                                                        const next = {
                                                                            id: row.original.id,
                                                                            title: row.original.title
                                                                        };
                                                                        goForward(next);
                                                                    }}
                                                                    size="small"
                                                                >
                                                                    <i className="ri-arrow-right-s-line" />
                                                                </IconButton>
                                                            ),
                                                        flex: .075
                                                    }
                                                ]}
                                                data={folders?.items}
                                                isLoading={foldersLoading}
                                                error={foldersError}
                                                height="calc(100vh - 370px)"
                                                enableSelection={false}
                                                pagination={{
                                                    ...pagination,
                                                    total: folders?.pagination?.total
                                                }}
                                                setPagination={setPagination}
                                                slots={{
                                                    globalFilter,
                                                    setGlobalFilter,
                                                    columnVisibility,
                                                    setColumnVisibility,
                                                    sorting,
                                                    setSorting,
                                                    goBack,
                                                    breadcrumbs: clickableBreadcrumbs,
                                                    features: {
                                                        search: true,
                                                        filter: false,
                                                        columnVisibility: true,
                                                        breadcrumbs: true,
                                                        goBack: true,
                                                    },
                                                    emptyState: {
                                                        height: 'calc(100vh - 524px)'
                                                    }
                                                }}
                                                noToolBar
                                                disableMultiSelect
                                                noMobileDataTable
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                    </Grid>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={createFolder?.isPending || updateFolder?.isPending}>
                        {translate('common.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={createFolder?.isPending || updateFolder?.isPending}
                    >
                        {data ?
                            updateFolder?.isPending
                                ? translate('common.saving')
                                : translate('common.save')
                            : createFolder?.isPending
                                ? translate('common.creating')
                                : translate('common.create')
                        }
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default FolderDrawer;
