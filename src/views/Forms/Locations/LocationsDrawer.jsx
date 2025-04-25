'use client';

import { useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid2 as Grid,
    List,
    ListItem,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import { useEffect, useState } from "react";
import TextInput from "@/components/inputs/TextInput";
import { useCreateLocation, useUpdateLocation } from "@/hooks/api/tenant/learn/classrooms-locations/useLocations";
import FileInput from "@/components/inputs/FileInput";
import Map from "@/components/Map";
import PhoneInput from "@/components/inputs/PhoneInput";
import { getCountryByCode, getCountryByDialCode } from "@/utils/getters/getCountries";
import CountrySelectInput from "@/components/inputs/CountrySelectInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { locationsDefaultValues, locationsSchema } from "@/constants/ClassroomsLocations";

const LocationsDrawer = ({ open, onClose, data }) => {
    const {
        control,
        handleSubmit,
        watch,
        setError,
        reset
    } = useForm({
        defaultValues: locationsDefaultValues,
        resolver: yupResolver(locationsSchema)
    });

    const [countryCode, setCountryCode] = useState("MA");

    const createLocation = useCreateLocation();
    const updateLocation = useUpdateLocation();

    // Watch the address field to pass to the Map component
    const address = watch("address");

    useEffect(() => {
        // If data is provided, populate the form
        const dialCode = data?.telephone?.split(" ")[0]
        const phoneNumber = data?.telephone?.split(" ")[1]

        if (data) {
            reset({
                name: data.name || "",
                address: data.address || "",
                country: data.country || "Morocco",
                telephone: phoneNumber || "",
                email: data.email || "",
                reaching_info: data.reaching_info || "",
                accomodations: data.accomodations || "",
                other_info: data.other_info || "",
                images: data.images || null
            });
            setCountryCode(getCountryByDialCode(dialCode)?.code || "MA");

        } else {
            reset();
        }
    }, [data, reset]);

    const onSubmit = (submittedData) => {
        const formData = new FormData();

        let imagesIndex = 0;  // Changed from const to let
        let urlsIndex = 0;    // Changed from const to let

        // Append each file to the FormData object
        if (submittedData.images) {
            submittedData.images.forEach((file) => {
                if (file instanceof File) {
                    formData.append(`images[${imagesIndex}]`, file);
                    imagesIndex++;
                } else {
                    // Handle different possible image URL formats
                    const imageUrl = file?.file || file?.url || file;
                    if (imageUrl) {
                        formData.append(`preserved_image_urls[${urlsIndex}]`, imageUrl);
                        urlsIndex++;
                    }
                }
            });
        }

        const dialCode = getCountryByCode(countryCode)?.dialCode;

        const phoneNumber = `${dialCode} ${submittedData?.telephone.replace(/\s/g, "")}`;

        // Append other fields to the FormData object
        formData.append("name", submittedData?.name)
        formData.append("address", submittedData?.address)
        formData.append("country", submittedData?.country)
        if (submittedData?.telephone) {
            formData.append("telephone", phoneNumber)
        }
        formData.append("email", submittedData?.email)
        formData.append("reaching_info", submittedData?.reaching_info)
        formData.append("accomodations", submittedData?.accomodations)
        formData.append("other_info", submittedData?.other_info)

        if (data) {
            formData.append("_method", "PUT");
        }


        if (data) {
            updateLocation.mutateAsync({ id: data.id, data: formData }).then(() => {
                onClose();
                reset();
            })

        } else {
            createLocation.mutateAsync(formData).then(() => {
                onClose();
                reset();
            });
        };
    }

    return (
        <DrawerFormContainer
            title={
                data
                    ? `Update Location: ${data?.name}`
                    : "Create New Location"
            }
            description={
                data
                    ? `Update the details of ${data?.name}`
                    : "Fill in the details to create a new location"
            }
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
                                name="address"
                                label="Address"
                                control={control}
                                type="text"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            {/* Pass the current address value to the Map component */}
                            <Map
                                noForm
                                defaultAddress={address}
                                mapHeight="400px"
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <CountrySelectInput
                                name="country"
                                label="Country"
                                setCountryCode={setCountryCode}
                                control={control}
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <PhoneInput
                                name="telephone"
                                control={control}
                                countryCode={countryCode}
                            />

                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="email"
                                label="Email"
                                control={control}
                                type='email'
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="reaching_info"
                                label="Reaching Info"
                                control={control}
                                type='text'
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="accomodations"
                                label="Accomodations"
                                control={control}
                                type='text'
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <TextInput
                                name="other_info"
                                label="Other Info"
                                control={control}
                                type='text'
                            />
                        </Grid>
                        <Grid item size={12} component={ListItem}>
                            <FileInput
                                name="images"
                                label="Images"
                                control={control}
                                setFormError={setError}
                                accept="image/*"
                                variant='multiple'
                                maxSize={2} // 2048 kilobytes = 2MB
                                helperText="Upload images of the location. Max size: 2MB each."
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={createLocation?.isPending || updateLocation?.isPending}>Cancel</Button>
                    <Button variant="contained" color="primary" type="submit" disabled={createLocation?.isPending || updateLocation?.isPending}>Submit</Button>
                </CardActions>
            </Card>
        </DrawerFormContainer >
    );
};

export default LocationsDrawer;