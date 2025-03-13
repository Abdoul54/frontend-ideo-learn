import { Grid, List, ListItemText } from "@mui/material";
import ColorInput from "@/components/inputs/ColorInput";

const StepThree = ({ control }) => (
    <>
        <Grid item xs={12}>
            <List>
                <ListItemText primary="Navigation" />
            </List>
        </Grid>
        <Grid item xs={6}>
            <ColorInput
                name="colors.background_color"
                control={control}
                label="Background Color"
            />
        </Grid>
        <Grid item xs={6}>
            <ColorInput
                name="colors.icon_color"
                control={control}
                label="Icon Color"
            />
        </Grid>
        <Grid item xs={12}>
            <List>
                <ListItemText primary="Body" />
            </List>
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.primary.main"
                control={control}
                label="Primary Main"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.primary.light"
                control={control}
                label="Primary Light"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.primary.dark"
                control={control}
                label="Primary Dark"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.secondary.main"
                control={control}
                label="Secondary Main"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.secondary.light"
                control={control}
                label="Secondary Light"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.secondary.dark"
                control={control}
                label="Secondary Dark"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.info.main"
                control={control}
                label="Info Main"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.info.light"
                control={control}
                label="Info Light"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.info.dark"
                control={control}
                label="Info Dark"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.success.main"
                control={control}
                label="Success Main"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.success.light"
                control={control}
                label="Success Light"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.success.dark"
                control={control}
                label="Success Dark"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.warning.main"
                control={control}
                label="Warning Main"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.warning.light"
                control={control}
                label="Warning Light"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.warning.dark"
                control={control}
                label="Warning Dark"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.error.main"
                control={control}
                label="Error Main"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.error.light"
                control={control}
                label="Error Light"
            />
        </Grid>
        <Grid item xs={4}>
            <ColorInput
                name="colors.error.dark"
                control={control}
                label="Error Dark"
            />
        </Grid>
    </>
);

export default StepThree;