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
    List,
    ListItem,
    Radio,
    RadioGroup,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useState } from "react";
import TextInput from "@/components/inputs/TextInput";
import { yupResolver } from "@hookform/resolvers/yup";
import DataView from "@/views/DataView";
import { useLocations } from "@/hooks/api/tenant/learn/classrooms-locations/useLocations";
import { useCreateClassroom, useUpdateClassroom } from "@/hooks/api/tenant/learn/classrooms-locations/useClassrooms";
import { classroomSchema } from "@/constants/ClassroomsLocations";

const ClassroomDrawer = ({ open, onClose, data }) => {
    const {
        control,
        handleSubmit,
        reset
    } = useForm({
        defaultValues: {
            "name": "",
            "seats": 0,
            "equipment": "",
            "details": "",
            "id_location": null
        },
        resolver: yupResolver(classroomSchema)
    });

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState({});

    const { data: locations, error: locationsError, isLoading: locationsLoading } = useLocations({
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        search: globalFilter,
        sort: sorting,
    });

    const createClassroom = useCreateClassroom();
    const updateClassroom = useUpdateClassroom()

    useEffect(() => {
        // If data is provided, populate the form
        if (data) {
            reset({
                name: data.name || "",
                seats: data.seats || 0,
                equipment: data.equipment || "",
                details: data.details || "",
                id_location: data.id_location || null
            });
        }
    }, [data, reset]);

    const onSubmit = (submittedData) => {

        if (data) {
            updateClassroom.mutateAsync({ id: data.id, data: submittedData }).then(() => {
                onClose();
                reset();
            })

        } else {
            createClassroom.mutateAsync(submittedData).then(() => {
                onClose();
                reset();
            });
        };
    }

    return (
        <DrawerFormContainer
            title="Create Classroom"
            description="Create a new classroom"
            open={open}
            onClose={onClose}
        >
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
            >
                <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    p: 2,
                    '&::-webkit-scrollbar': {
                        width: '0.4em'
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'var(--mui-palette-background-paper)'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                        borderRadius: 2
                    }
                }}>
                    <Grid container rowSpacing={3} padding={2} component={List}>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="name"
                                label="Name"
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="seats"
                                label="Seats"
                                control={control}
                                type="number"
                                inputProps={{ min: 0 }}

                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="equipment"
                                label="Equipment"
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="details"
                                label="Details"
                                control={control}
                                type="text"
                                maxRows={4}
                                multiline
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <Controller
                                name="id_location"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl error={!!error} fullWidth>
                                        {/* <FormLabel>Select a location</FormLabel> */}
                                        <RadioGroup
                                            {...field}
                                        >
                                            <DataView
                                                title="Groups"
                                                columns={[
                                                    {
                                                        accessorKey: "id",
                                                        header: "",
                                                        cell: ({ row }) => <FormControlLabel
                                                            value={row?.original.id}
                                                            control={<Radio />}
                                                        />,
                                                        flex: .3
                                                    },
                                                    {
                                                        accessorKey: "name",
                                                        header: "Name",
                                                        flex: 1
                                                    },
                                                    {
                                                        accessorKey: "address",
                                                        header: "Address",
                                                        flex: 1
                                                    },
                                                    {
                                                        accessorKey: "country",
                                                        header: "Country",
                                                        flex: 1
                                                    }
                                                ]}
                                                data={locations?.items}
                                                isLoading={locationsLoading}
                                                error={locationsError}
                                                height="calc(100vh - 352px)"
                                                enableSelection={false}
                                                pagination={{ ...pagination, total: locations?.pagination?.total }}
                                                setPagination={setPagination}
                                                slots={{
                                                    globalFilter,
                                                    setGlobalFilter,
                                                    columnVisibility,
                                                    setColumnVisibility,
                                                    sorting,
                                                    setSorting,
                                                    features: {
                                                        search: true,
                                                        filter: false,
                                                        columnVisibility: true
                                                    },
                                                    emptyState: {
                                                        height: 'calc(100vh - 506px)'
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
                    <Button onClick={onClose} disabled={createClassroom?.isPending || updateClassroom?.isPending}>Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={createClassroom?.isPending || updateClassroom?.isPending}>Submit</Button>
                </CardActions>
            </Card>
        </DrawerFormContainer >
    );
};

export default ClassroomDrawer;