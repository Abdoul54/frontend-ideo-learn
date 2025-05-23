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
    Radio,
    RadioGroup,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useMemo, useState } from "react";
import DataView from "@/views/DataView";
import TextInput from "@/components/inputs/TextInput";
import { useFolders } from "@/hooks/api/tenant/repos/useFolders";
import useHistoryNavigation from "@/hooks/useHistoryNavigation";
import FileInput from "@/components/inputs/FileInput";
import { useCreateLearningUnit, useUpdateLearningUnit } from "@/hooks/api/tenant/repos/useLeaningUnits";
import SelectInput from "@/components/inputs/SelectInput";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const LearningUnitDrawer = ({ open, onClose, data, translate }) => {
    const defaultValues = data ? {
        "file": "",
        "version_mode": "override", // new_version |`override`
        "version_comment": "",

    } : {
        "code": "",
        "title": "",
        "type": "scorm", //  scorm | video | pdf | cmi5 | xapi
        "folder_id": "1",
        "file": ""
    }

    const createSchema = yup.object().shape({
        code: yup.string().required("Code is required"),
        title: yup.string().required("Title is required"),
        type: yup.string().required("Type is required"),
    });

    const editSchema = yup.object().shape({
        version_mode: yup.string().required(),
        version_comment: yup.string().when("version_mode", {
            is: "new_version",
            then: (schema) => schema.required("Comment is required for new version"),
            otherwise: (schema) => schema.optional(),
        }),
        file: yup.mixed().required("File is required"),
    });

    const {
        control,
        handleSubmit,
        watch,
        reset,
    } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(data ? editSchema : createSchema),
    });

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});
    const [folderId, setFolderId] = useState(1);

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

    const createLearningUnit = useCreateLearningUnit();
    const updateLearningUnit = useUpdateLearningUnit();

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
        if (data) {
            reset({
                code: data.code,
                title: data.title,
                folder_id: data.folder_id || 1,
            });
        }
    }, [data, reset]);

    const onSubmit = (submittedData) => {


        const formData = new FormData();
        formData.append("file", submittedData.file);


        if (data) {
            formData.append('_method', 'PUT');
            formData.append("version_mode", submittedData.version_mode);
            if (submittedData.version_mode === "new_version") {
                formData.append("version_comment", submittedData.version_comment);
            }
            updateLearningUnit.mutateAsync({ id: data.id, data: formData }).then(() => {
                onClose();
                reset();
            });
        } else {
            formData.append("code", submittedData.code);
            formData.append("folder_id", submittedData.folder_id);
            formData.append("title", submittedData.title);
            formData.append("type", submittedData.type);
            createLearningUnit.mutateAsync(formData).then(() => {
                onClose();
                reset();
            });
        }

    };

    return (
        <DrawerFormContainer
            title={data ? data?.title : translate('CR management.MODAL_TITLE_CREATE_LU')}
            description={data ? translate('CR management.MODAL_DESCRIPTION_EDIT_LU') : translate('CR management.MODAL_DESCRIPTION_CREATE_LU')}
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
                        {!data ?
                            <>
                                <Grid item size={12} component={ListItem}>
                                    <TextInput name="code" control={control} label={translate('common.FIELD_CODE')} />
                                </Grid>
                                <Grid item size={12} component={ListItem}>
                                    <TextInput name="title" control={control} label={translate('common.FIELD_TITLE')}
                                    />
                                </Grid>
                                <Grid item size={12} component={ListItem}>
                                    <SelectInput
                                        name="type"
                                        control={control}
                                        label={translate('CR management.FIELD_TYPE')}
                                        options={[
                                            { value: "scorm", label: "SCORM" },
                                            { value: "video", label: "Video" },
                                            { value: "pdf", label: "PDF" },
                                            { value: "cmi5", label: "CMI5" },
                                            { value: "xapi", label: "XAPI" }
                                        ]}
                                    />
                                </Grid>
                                <Grid item size={12} component={ListItem}>
                                    <Controller
                                        name="folder_id"
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
                                                                header: "Title",
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
                            </>
                            :
                            <>
                                <Grid item size={12} component={ListItem}>
                                    <SelectInput
                                        name="version_mode"
                                        control={control}
                                        label={translate('CR management.FIELD_VERSION_MODE')}
                                        options={[
                                            { value: "override", label: translate('CR management.DROPDOWN_OVERRIDE') },
                                            { value: "new_version", label: translate('CR management.DROPDOWN_NEW_VERSION') }
                                        ]}
                                    />
                                </Grid>
                                {
                                    watch("version_mode") === "new_version" &&
                                    <Grid item size={12} component={ListItem}>
                                        <TextInput name="version_comment" control={control} label={translate('CR management.FIELD_VERSION_COMMENT')} />
                                    </Grid>
                                }
                            </>
                        }
                        <Grid item size={12} component={ListItem}>
                            <FileInput
                                name="file"
                                control={control}
                                label={translate('CR management.FIELD_FILE')}
                                accept="application/zip, application/x-zip-compressed, application/pdf, application/x-pdf, video/*"
                                helperText="Upload a zip file for SCORM or CMI5, or a PDF for PDF type."
                            />
                        </Grid>
                    </Grid>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={createLearningUnit?.isPending || updateLearningUnit?.isPending}>
                        {translate('common.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={createLearningUnit?.isPending || updateLearningUnit?.isPending}
                        startIcon={updateLearningUnit?.isPending ? <i className="svg-spinners-90-ring" /> : null}
                    >
                        {data ? updateLearningUnit?.isPending ? translate('common.saving') : translate('common.save') : createLearningUnit?.isPending ? translate('common.creating') : translate('common.create')}
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default LearningUnitDrawer;
