import { Controller } from "react-hook-form";
import {
    Box,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    FormControlLabel,
    Checkbox,
    TextField
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { useTranslation } from "@/@core/contexts/translationContext";

export default function AdditionalInfoStep({ control, errors, userCount = 0 }) {
    const { translate } = useTranslation();

    return (
        <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    {translate('Course management.TEXT_ENROLLMENT_COUNT', `You are about to enroll ${userCount} user${userCount !== 1 ? 's' : ''}`)}
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        {translate('Course management.SECTION_USER_LEVEL', 'Choose a level for the users not yet enrolled in the course')}
                    </Typography>

                    <FormControl fullWidth required sx={{ mt: 2 }}>
                        <InputLabel id="level-label">Level</InputLabel>
                        <Controller
                            name="level"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    labelId="level-label"
                                    label="Level"
                                    error={!!errors.level}
                                >
                                    <MenuItem value={1}>{translate('Course management.DROPDOWN_LEARNER', 'Learner')}</MenuItem>
                                    <MenuItem value={2}>{translate('Course management.DROPDOWN_TUTOR', 'Tutor')}</MenuItem>
                                    <MenuItem value={3}>{translate('Course management.DROPDOWN_INSTRUCTOR', 'Instructor')}</MenuItem>
                                </Select>
                            )}
                        />
                        {errors.level && (
                            <Typography color="error" variant="caption">
                                {errors.level.message}
                            </Typography>
                        )}
                    </FormControl>
                </Paper>
            </Grid>

            <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        {translate('Course management.SUB_SECTION_ENROLLMENT_VALIDITY_PERIOD', 'Enrollment validity period')}
                    </Typography>

                    <Controller
                        name="enableValidityPeriod"
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                    />
                                }
                                label={translate('Course management.CHECKBOX_ENABLE_VALIDITY_PERIOD', 'Enable enrollment validity period')}
                            />
                        )}
                    />

                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        {translate('Course management.TEXT_VALIDITY_DESCRIPTION', 'Set a specific enrollment validity duration')}
                    </Typography>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Controller
                            name="enableValidityPeriod"
                            control={control}
                            render={({ field: { value } }) => (
                                value && (
                                    <Grid container spacing={2} sx={{ mt: 2 }}>
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="date_begin_validity"
                                                control={control}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        label={translate('Course management.FIELD_START_DATE', 'Start Date')}
                                                        value={field.value ? dayjs(field.value) : null}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                field.onChange(date);
                                                            }
                                                        }}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                error: !!errors.date_begin_validity,
                                                                helperText: errors.date_begin_validity?.message
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="date_expire_validity"
                                                control={control}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        label={translate('Course management.FIELD_END_DATE', 'End Date')}
                                                        value={field.value ? dayjs(field.value) : null}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                field.onChange(date);
                                                            }
                                                        }}
                                                        slotProps={{
                                                            textField: {
                                                                fullWidth: true,
                                                                error: !!errors.date_expire_validity,
                                                                helperText: errors.date_expire_validity?.message
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                )
                            )}
                        />
                    </LocalizationProvider>
                </Paper>
            </Grid>
        </Grid>
    );
}