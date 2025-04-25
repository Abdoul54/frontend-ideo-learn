
import SwitchInput from "@/components/inputs/SwitchInput";;
import { Card, CardContent, Grid, List, ListItem, ListItemText } from "@mui/material";

const EnrollementOptions = ({ Action, control, setValue, watch }) => {

    return (
        <Card
            sx={{
                border: 0,
            }}
        >
            <CardContent>
                <Grid container spacing={4} component={List}>
                    <Grid item xs={12} component={ListItem}>
                        <ListItemText primary='Enrollment link'
                            secondary="Fill in the details of the learning plan"
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
                        <SwitchInput
                            name="enable_deep_link"
                            label={<ListItemText primary="Enable deep link"
                                secondary="Allow users to enroll in this learning plan using a deep link" />}
                            control={control}
                            checkedValue={true}
                            uncheckedValue={false}
                        />
                    </Grid>

                </Grid>
            </CardContent>
            {Action}
        </Card>
    );
}

export default EnrollementOptions;