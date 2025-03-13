// frontend/src/views/Forms/Tenant/UserSteps/MassUpdateStepOne.jsx
import { Grid, Typography } from "@mui/material";
import TextInput from "@/components/inputs/TextInput";
import SelectInput from "@/components/inputs/SelectInput";
import DateInput from "@/components/inputs/DateInput";
import { useTimezonesTenant } from "@/hooks/api/tenant/useTimeLangSettings";

const MassUpdateStepOne = ({ control }) => {
    const { data: timezones } = useTimezonesTenant();

    return (
        <>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Authentication</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Leave fields empty to keep current values for each user
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput 
                    name="password" 
                    control={control} 
                    label="New Password" 
                    type="password" 
                    helperText="If provided, will update all selected users' passwords"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput 
                    name="password_confirmation" 
                    control={control} 
                    label="Confirm Password" 
                    type="password" 
                />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom mt={2}>User Preferences</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <DateInput
                    name="expiration"
                    control={control}
                    label="Expiration Date"
                    minDate={new Date()}
                    clearable
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <SelectInput
                    name="email_status"
                    control={control}
                    label="Email Validation Status"
                    options={[
                        { value: "", label: "Keep current" },
                        { value: 0, label: 'Unverified' },
                        { value: 1, label: 'Verified' }
                    ]}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <SelectInput
                    name="timezone"
                    control={control}
                    label="Timezone"
                    options={[
                        { value: "", label: "Keep current" },
                        ...(timezones || [])
                    ]}
                    labelKey="text"
                    valueKey="id"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <SelectInput
                    name="language"
                    control={control}
                    label="Language"
                    options={[
                        { value: "", label: "Keep current" },
                        { value: 'en', label: 'English' },
                        { value: 'fr', label: 'French' }
                    ]}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <SelectInput
                    name="date_format"
                    control={control}
                    label="Date Format"
                    options={[
                        { value: "", label: "Keep current" },
                        { value: 'd/m/Y', label: 'DD/MM/YYYY' },
                        { value: 'm/d/Y', label: 'MM/DD/YYYY' },
                        { value: 'Y-m-d', label: 'YYYY-MM-DD' }
                    ]}
                />
            </Grid>
        </>
    );
};

export default MassUpdateStepOne;