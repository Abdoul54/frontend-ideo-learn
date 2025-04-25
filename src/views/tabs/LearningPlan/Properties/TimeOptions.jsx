import SelectInput from "@/components/inputs/SelectInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import TextInput from "@/components/inputs/TextInput";
import { validityTimeTypes } from "@/constants/LearningPlan";
import { Card, CardContent, Collapse, FormControl, FormControlLabel, Grid, InputAdornment, List, ListItem, ListItemText, Switch } from "@mui/material";

const TimeOptions = ({ Action, control, enableTimeOptions, setEnableTimeOptions }) => {

    return (
        <Card
            sx={{
                border: 0,
            }}
        >
            <CardContent>
                <Grid container spacing={4} component={List}>
                    <Grid item xs={12} component={ListItem}>
                        <ListItemText primary='Time Options'
                            secondary="Control the validity time of the learning plan"
                            primaryTypographyProps={{
                                variant: 'h5',
                                sx: {
                                    fontWeight: 600,
                                    fontSize: '1.2rem',
                                }
                            }}
                            secondaryTypographyProps={{
                                color: 'text.secondary',
                                variant: 'body2',
                                sx: { mb: 2 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <FormControl >
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="enable_time_options"
                                        onChange={(e) => setEnableTimeOptions(e.target.checked)}
                                        defaultChecked={enableTimeOptions}
                                        checkedValue={true}
                                        uncheckedValue={false}
                                    />
                                }
                                label={<ListItemText
                                    primary="Enable time options"
                                    secondary="Control the validity time of the learning plan"
                                />}
                            />
                        </FormControl>
                    </Grid>
                    <Collapse in={enableTimeOptions}
                        timeout="auto"
                        unmountOnExit
                        sx={{
                            width: '100%',
                            padding: 0,
                            margin: 0,
                            '& .MuiCollapse-wrapper': {
                                width: '100%',
                                padding: 0,
                                margin: 0,
                            },
                            '& .MuiCollapse-wrapperInner': {
                                width: '100%',
                                padding: 0,
                                margin: 0,
                            }
                        }}
                    >
                        <Grid item xs={12} component={ListItem}>
                            <TextInput
                                name="validity_time"
                                label="Validity Time"
                                control={control}
                                type='number'

                                InputProps={{
                                    slotProps: {
                                        input: {
                                            min: 0
                                        }
                                    },
                                    endAdornment: <InputAdornment position="end">Days</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <SelectInput
                                name="validity_time_type"
                                label="Validity Time Type"
                                control={control}
                                options={validityTimeTypes}
                                labelKey="label"
                                valueKey="value"
                            />
                        </Grid>
                        <Grid item xs={12} component={ListItem}>
                            <SwitchInput
                                name="validity_time_update_existing"
                                label={<ListItemText primary="Update existing enrollments"
                                    secondary="Allow users to update existing enrollments with new validity time" />}
                                control={control}
                                checkedValue={true}
                                uncheckedValue={false}
                            />
                        </Grid>
                    </Collapse>

                </Grid>
            </CardContent>
            {Action}
        </Card>
    );
}

export default TimeOptions;