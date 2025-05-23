import { Grid, Typography } from "@mui/material";
import TextInput from "@/components/inputs/TextInput";
import SelectInput from "@/components/inputs/SelectInput";
import DateInput from "@/components/inputs/DateInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import { useTimezonesTenant } from "@/hooks/api/tenant/useTimeLangSettings";
import { useActiveLanguages } from "@/hooks/api/tenant/useLocalization";
import { useTranslation } from "@/@core/contexts/translationContext";

const StepOne = ({ control, watch, isUpdate }) => {
    const { translate } = useTranslation();
    const { data: timezones } = useTimezonesTenant();
    const { data: activeLanguages, isLoading: isLoadingActiveLanguages, error: errorActiveLanguages } = useActiveLanguages();

    return (
        <>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>{translate('User Management.SECTION_BASIC_INFORMATION', 'Basic Information')}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput name="username" control={control} label={translate('User Management.PLACEHOLDER_USERNAME', 'Username')} required />
            </Grid>
            <Grid item xs={12} md={6}>
                <SelectInput
                    name="level"
                    control={control}
                    label={translate('User Management.FIELD_USER_LEVEL', 'User Level')}
                    options={[
                        { value: 6, label: translate('common.user', 'User') },
                        { value: 4, label: translate('common.power_user', 'Power User') },
                        { value: 3, label: translate('common.super_admin', 'Super Admin') }
                    ]}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput name="email" control={control} label={translate('User Management.PLACEHOLDER_EMAIL', 'Email')} required />
            </Grid>
            <Grid item xs={12} md={6}>
                <SelectInput
                    name="email_validation_status"
                    control={control}
                    label={translate('User Management.FIELD_EMAIL_VALIDATION_STATUS', 'Email Validation Status')}
                    options={[
                        { value: 0, label: translate('common.unverified', 'Unverified') },
                        { value: 1, label: translate('common.verified', 'Verified') }
                    ]}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput name="firstname" control={control} label={translate('User Management.PLACEHOLDER_FIRST_NAME', 'First Name')} />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput name="lastname" control={control} label={translate('User Management.PLACEHOLDER_LAST_NAME', 'Last Name')} />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>{translate('User Management.SECTION_PASSWORD', 'Authentication')}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput
                    name="password"
                    control={control}
                    label={isUpdate ? 
                        translate('User Management.PLACEHOLDER_PASSWORD_LEAVE_EMPTY', 'Password (leave empty to keep current)') : 
                        translate('User Management.PLACEHOLDER_PASSWORD', 'Password')}
                    type="password"
                    required={!isUpdate}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextInput
                    name="password_confirmation"
                    control={control}
                    label={isUpdate ? 
                        translate('User Management.PLACEHOLDER_CONFIRM_PASSWORD_IF_CHANGING', 'Confirm Password (if changing)') : 
                        translate('User Management.PLACEHOLDER_CONFIRM_PASSWORD', 'Confirm Password')}
                    type="password"
                    required={!isUpdate}
                />
            </Grid>
            <Grid item xs={12}>
                <SwitchInput
                    name="force_change"
                    control={control}
                    label={translate('User Management.TOGGLE_FORCE_PASSWORD_CHANGE', 'Force user to change password on first login')}
                    checkedValue={1}
                    uncheckedValue={0}
                />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>{translate('User Management.SECTION_EXPIRATION_NOTIFICATION', 'Expiration & Notification')}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <DateInput
                    name="expiration"
                    control={control}
                    label={translate('User Management.PLACEHOLDER_EXPIRATION_DATE', 'Expiration Date')}
                    minDate={new Date()}
                />
            </Grid>
            <Grid item xs={12}>
                <SwitchInput
                    name="send_notification_email"
                    control={control}
                    label={translate('User Management.TOGGLE_SEND_NOTIFICATION', 'Send notification email to user')}
                    checkedValue={true}
                    uncheckedValue={false}
                />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>{translate('User Management.SECTION_USER_PREFERENCES', 'User Preferences')}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <SelectInput
                    name="timezone"
                    control={control}
                    label={translate('User Management.FIELD_TIMEZONE', 'Timezone')}
                    options={timezones || []}
                    labelKey="text"
                    valueKey="id"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <SelectInput
                    name="language"
                    control={control}
                    label={translate('User Management.FIELD_LANGUAGE', 'Language')}
                    options={activeLanguages || []}
                    labelKey="name"
                    valueKey="code"
                    disabled={isLoadingActiveLanguages || errorActiveLanguages}
                />
            </Grid>
        </>
    )
}
export default StepOne;