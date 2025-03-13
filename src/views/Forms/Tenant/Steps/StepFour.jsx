import { Grid } from "@mui/material";
import SelectInput from "@/components/inputs/SelectInput";
import TextInput from "@/components/inputs/TextInput";

const StepFour = ({ control }) => (
    <>
        <Grid item xs={12}>
            <TextInput
                name="smtp.host"
                control={control}
                label="Host"
            />
        </Grid>
        <Grid item xs={12}>
            <TextInput
                name="smtp.port"
                control={control}
                label="Port"
                type="number"
            />
        </Grid>
        <Grid item xs={12}>
            <TextInput
                control={control}
                name="smtp.username"
                label="Username"
            />
        </Grid>
        <Grid item xs={12}>
            <TextInput
                control={control}
                name="smtp.password"
                label="Password"
                type="password"
            />
        </Grid>
        <Grid item xs={12}>
            <SelectInput
                options={[
                    { value: "ssl", label: "SSL" },
                    { value: "tls", label: "TLS" },
                ]}
                name="smtp.encryption"
                control={control}
                label="Encryption"
            />
        </Grid>
        <Grid item xs={12}>
            <TextInput
                name="smtp.from_address"
                control={control}
                label="From Address"
            />
        </Grid>
        <Grid item xs={12}>
            <TextInput
                name="smtp.from_name"
                control={control}
                label="From Name"
            />
        </Grid>
    </>
);

export default StepFour;