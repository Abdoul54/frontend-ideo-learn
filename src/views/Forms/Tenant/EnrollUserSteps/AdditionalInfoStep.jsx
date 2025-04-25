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

export default function AdditionalInfoStep({ control, errors, userCount = 0 }) {
    return (
        <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    You are about to enroll {userCount} user{userCount !== 1 ? 's' : ''}
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Choose a level for the users not yet enrolled in the course
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
                                    <MenuItem value={1}>Learner</MenuItem>
                                    <MenuItem value={2}>Tutor</MenuItem>
                                    <MenuItem value={3}>Instructor</MenuItem>
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
                        Enrollment validity period
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
                                label="Enable enrollment validity period"
                            />
                        )}
                    />

                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Set a specific enrollment validity duration
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
                                                        label="Start Date"
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
                                                        label="End Date"
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