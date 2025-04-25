
import CheckboxInput from "@/components/inputs/CheckboxInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Card, CardActions, CardContent, CardHeader, Grid, ListItemText, Typography } from "@mui/material";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as yup from 'yup';

const schema = yup.object().shape({
    privacy_policy: yup.boolean().isTrue('You must agree to the terms.'),// should be true
});

const ConditionsOfUse = () => {
    const { control, handleSubmit } = useForm({
        defaultValues: {
            privacy_policy: false,
        },
        resolver: yupResolver(schema)
    });

    const onSubmit = (data) => {
        console.log('Form submitted with:', data);
        // data.avatar will be the File object for uploading
    };

    return (
        <Card component="form" onSubmit={handleSubmit(onSubmit)}>
            <CardHeader title={
                <ListItemText
                    primary="Conditions of use"
                    secondary="Manage your preferences for the platform privacy policy and terms and conditions"
                    primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                />
            }
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }} />
            <CardContent component={Grid} container spacing={3} >
                {/* Avatar input section */}
                <Grid item xs={12} mt={4} >
                    <ListItemText
                        primary="Privacy policy"
                        secondary="Please note that agreeing to the mandatory privacy policy settings is required to register and access our platform. If you choose not to agree, you will be unable to proceed."
                        primaryTypographyProps={{ variant: 'h6' }}
                    />
                </Grid>
                <Grid item xs={6} >
                    <CheckboxInput
                        name="privacy_policy"
                        control={control}
                        label={<ListItemText primary="I agree to the privacy policy"
                            secondary={<Typography variant="caption" color="primary" component={Link} href='#' passHref>Read the privacy policy</Typography>}
                            primaryTypographyProps={{ variant: 'body1' }}
                        />}
                        checkedValue={true}
                        uncheckedValue={false}
                    />
                </Grid>

            </CardContent>
            <CardActions>
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Button type="submit" variant="contained" color="primary">
                            Save Changes
                        </Button>
                    </Grid>
                </Grid>
            </CardActions>
        </Card >
    );
}

export default ConditionsOfUse;