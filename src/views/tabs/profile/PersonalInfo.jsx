import FileInput from "@/components/inputs/FileInput";
import TextInput from "@/components/inputs/TextInput";
import UserFieldInput from "@/components/inputs/UserFieldInput";
import { useUserFields } from "@/hooks/api/tenant/useUserFields";
import { useGetUser, useUpdateUserWithFiles } from "@/hooks/api/useUsers";
import { useLanguage } from "@/providers/LanguageProvider";
import { stringAvatar } from "@/utils/avatarGenerator";
import { Box, Button, Card, CardActions, CardContent, CardHeader, Divider, Grid, ListItemText, Stack, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const PersonalInfo = () => {
    const { data: session } = useSession();
    const { language } = useLanguage()

    const [currentLanguage, setCurrentLanguage] = useState(language?.locale || 'fr');
    const {
        data: userFields
    } = useUserFields({
        user_id: session?.user?.id,
        with_pagination: false,
        skip_all: true,
    });

    const { data: user } = useGetUser(session?.user?.id)

    const userAvailable = !!(user?.firstname && user?.lastname && typeof user.firstname === 'string' && typeof user.lastname === 'string')
    const avatarSX = userAvailable ? stringAvatar(`${user?.firstname?.toUpperCase()} ${user?.lastname?.toUpperCase()}`)?.sx : {};

    const updateProfile = useUpdateUserWithFiles()

    const { control, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            avatar: session?.user?.avatar,
            username: '',
            email: '',
            firstname: '',
            level: '',
            lastname: '',
            additional_fields: {}
        },
    });

    useEffect(() => {
        // Set basic user information when available
        if (user) {
            setValue('username', user?.username);
            setValue('level', user?.string_level);
            setValue('email', user?.email);
            setValue('firstname', user?.firstname);
            setValue('lastname', user?.lastname);
            setValue('avatar', user?.avatar || session?.user?.avatar);
        }

        // Handle additional fields
        if (userFields?.length) {
            // Initialize additional fields as an empty object instead of null
            const initialFields = {};

            // Process each field
            userFields?.forEach(field => {
                // Get the existing value from user data if available, otherwise use empty string
                const fieldValue = user?.additional_fields?.[field.id] ?? '';
                initialFields[field.id] = fieldValue;
            });

            // Set all additional fields in a single operation
            setValue('additional_fields', initialFields);
        }
    }, [userFields, user, setValue, session?.user?.avatar]);


    const onSubmit = async (data) => {
        const formData = new FormData();

        // Append basic user data
        formData.append('username', data.username);
        formData.append('email', data.email);
        formData.append('firstname', data.firstname);
        formData.append('lastname', data.lastname);
        formData.append('_method', 'PUT');

        // Append avatar if it's a File object
        if (data.avatar instanceof File) {
            formData.append('avatar', data.avatar);
        }

        // Append additional fields
        if (data.additional_fields) {
            for (const key in data.additional_fields) {
                formData.append(`additional_fields[${key}]`, data.additional_fields[key]);
            }
        }

        // Pass the formData to the update function
        updateProfile.mutateAsync({
            id: session?.user?.id,
            data: formData  // Use the FormData object instead of the raw data
        });
    };

    return (
        <Card component="form" onSubmit={handleSubmit(onSubmit)}>
            <CardHeader title={
                <ListItemText
                    primary="Personal Information"
                    secondary="Manage your profile details and additional information"
                    primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                />
            }
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }} />
            <CardContent component={Grid} container spacing={3} >
                {/* Avatar input section */}
                <Grid item xs={12} md={12} component={Stack} direction="row" gap={4} alignItems="center" mt={4} >

                    <Box>
                        <FileInput
                            name="avatar"
                            control={control}
                            variant="avatar"
                            avatarSize='medium'

                            avatarName={`${user?.firstname?.toUpperCase()} ${user?.lastname?.toUpperCase()}`}
                            avatarColor={avatarSX?.bgcolor}
                            avatarTextColor={avatarSX?.color}
                            useNameColors={userAvailable}
                        />
                    </Box>
                    <ListItemText
                        primary="Avatar"
                        secondary={
                            <Stack direction="column">
                                <Typography variant="caption" color="text.secondary">
                                    Click on the avatar to change it
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    The minimum suggested image dimension is 400x400px
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    The maximum file size is 4MB
                                </Typography>
                            </Stack>
                        }
                        primaryTypographyProps={{ variant: 'h6' }}
                    />
                </Grid>
                <Grid item xs={12} >
                    <Divider />
                </Grid>
                <Grid item xs={12} mb={2}>
                    <Typography variant="h6">Details</Typography>
                </Grid>
                <Grid item xs={6} >
                    <TextInput
                        name="username"
                        label="Username"
                        control={control}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </Grid>
                <Grid item xs={6} >
                    <TextInput
                        name="level"
                        label="Level"
                        control={control}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </Grid>
                <Grid item xs={6} >
                    <TextInput
                        name="firstname"
                        label="First Name"
                        control={control}
                    />
                </Grid>
                <Grid item xs={6} >
                    <TextInput
                        name="lastname"
                        label="Last Name"
                        control={control}
                    />
                </Grid>
                <Grid item xs={6} >
                    <TextInput
                        name="email"
                        label="Email"
                        control={control}
                    />
                </Grid>
                {
                    watch('additional_fields') && Object.keys(watch('additional_fields')).length > 0 &&
                    <>
                        <Grid item xs={12} my={2}>
                            <Typography variant="h6">Additional fields</Typography>
                        </Grid>
                        {userFields?.map((userField) => {
                            return (
                                <Grid item xs={12} md={6} key={userField.id}>
                                    <UserFieldInput
                                        userField={userField}
                                        control={control}
                                        language={currentLanguage}
                                        languages={['fr', 'en']}
                                        countryOptions={[]}
                                        onChange={(value) => {
                                            // Optional callback for individual field changes
                                            console.log(`Field ${userField.id} changed:`, value);
                                        }}
                                        onLanguageChange={setCurrentLanguage}
                                    />
                                </Grid>
                            );
                        })}
                        {/* {userFields?.map((field) => {
                            const fieldType = field.type === 'textfield' ? 'text' : field.type;
                            return (
                                <Grid item xs={12} md={6} key={field.id}>
                                    <TextInput
                                        name={`additional_fields.${field.id}`}
                                        label={field.title}
                                        control={control}
                                        type={fieldType}
                                    />
                                </Grid>
                            );
                        })} */}
                    </>
                }

            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={updateProfile.isLoading}
                        >
                            {updateProfile.isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Grid>
                </Grid>
            </CardActions>
        </Card >
    );
}

export default PersonalInfo;