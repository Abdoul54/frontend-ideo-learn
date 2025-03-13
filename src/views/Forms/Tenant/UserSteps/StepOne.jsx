import { Grid, Typography } from "@mui/material";
import TextInput from "@/components/inputs/TextInput";
import SelectInput from "@/components/inputs/SelectInput";
import DateInput from "@/components/inputs/DateInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import { useTimezonesTenant } from "@/hooks/api/tenant/useTimeLangSettings";

const StepOne = ({ control, watch, isUpdate }) => { // Add isUpdate prop
    const { data: timezones } = useTimezonesTenant()

    return (
        <>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput name="username" control={control} label="Username" required />
            </Grid>
            <Grid item xs={12} md={6}>
                <SelectInput
                    name="level"
                    control={control}
                    label="User Level"
                    options={[
                        { value: 6, label: 'User' },
                        { value: 4, label: 'Power User' },
                        { value: 3, label: 'Super Admin' }
                    ]}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput name="email" control={control} label="Email" required />
            </Grid>
            <Grid item xs={12} md={6}>
                <SelectInput
                    name="email_validation_status"
                    control={control}
                    label="Email Validation Status"
                    options={[
                        { value: 0, label: 'Unverified' },
                        { value: 1, label: 'Verified' }
                    ]}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput name="firstname" control={control} label="First Name" />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput name="lastname" control={control} label="Last Name" />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Authentication</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput
                    name="password"
                    control={control}
                    label={isUpdate ? "Password (leave empty to keep current)" : "Password"}
                    type="password"
                    required={!isUpdate} // Only required for create
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput
                    name="password_confirmation"
                    control={control}
                    label={isUpdate ? "Confirm Password (if changing)" : "Confirm Password"}
                    type="password"
                    required={!isUpdate} // Only required for create
                />
            </Grid>
            <Grid item xs={12}>
                <SwitchInput
                    name="force_change"
                    control={control}
                    label="Force user to change password on first login"
                    checkedValue={1}
                    uncheckedValue={0}
                />
            </Grid>
            {/* <Grid item xs={12}>
                <SwitchInput
                    name="valid"
                    control={control}
                    label="Activate user at the end of the creation process"
                    checkedValue={1}
                    uncheckedValue={0}
                />
            </Grid> */}

            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Expiration & Notification</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <DateInput
                    name="expiration"
                    control={control}
                    label="Expiration Date"
                    minDate={new Date()}
                />
            </Grid>
            <Grid item xs={12}>
                <SwitchInput
                    name="send_notification_email"
                    control={control}
                    label="Send notification email to user"
                    checkedValue={true}
                    uncheckedValue={false}
                />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>User Preferences</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <SelectInput
                    name="timezone"
                    control={control}
                    label="Timezone"
                    options={timezones || []}
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
                        { value: 'en', label: 'English' },
                        { value: 'fr', label: 'French' }
                    ]}
                />
            </Grid>
        </>
    )
}
export default StepOne;