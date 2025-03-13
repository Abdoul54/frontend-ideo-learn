import { Grid, InputAdornment } from "@mui/material";
import SelectInput from "@/components/inputs/SelectInput";
import TextInput from "@/components/inputs/TextInput";
import DateInput from "@/components/inputs/DateInput";
import dayjs from "dayjs";
import { useAppDomain, useLangs, useTimezones } from "@/hooks/api/central/useGetters";
import CheckboxInput from "@/components/inputs/CheckboxInput";

const StepOne = ({ control, watch }) => {
    const { data: langs } = useLangs()
    const { data: timezones } = useTimezones()
    const { data: appDomain } = useAppDomain()

    return (
        <>
            <Grid item xs={12}>
                <TextInput
                    name="platform_name"
                    control={control}
                    label="Platform Name"
                />
            </Grid>
            <Grid item xs={12}>
                <TextInput
                    name="subdomain"
                    control={control}
                    label="Subdomain"
                    InputProps={{
                        endAdornment: <InputAdornment position="end">.{appDomain}</InputAdornment>,
                    }}
                />
            </Grid>
            <Grid item xs={12}>
                <SelectInput
                    control={control}
                    name="default_language"
                    label="Default Language"
                    options={langs || []}
                    labelKey="name"
                    valueKey="code"
                />
            </Grid>
            <Grid item xs={12}>
                <SelectInput
                    control={control}
                    name="default_timezone"
                    label="Default Timezone"
                    options={timezones || []}
                    labelKey="text"
                    valueKey="id"
                />
            </Grid>
            <Grid item xs={12}>
                <TextInput
                    name="max_active_users"
                    control={control}
                    label="Max Active Users"
                    type="number"
                />
            </Grid>
            <Grid item xs={12}>
                <DateInput
                    name="service_start_date"
                    control={control}
                    label="Service Start Date"
                    minDate={new Date()}
                    maxDate={watch('service_end_date')}
                />
            </Grid>
            <Grid item xs={12}>
                <DateInput
                    name="service_end_date"
                    control={control}
                    label="Service End Date"
                    minDate={dayjs(watch('service_start_date')).add(1, 'day')}
                />
            </Grid>
            <Grid item xs={12}>
                <CheckboxInput
                    name="configure_smtp"
                    control={control}
                    label="Configure SMTP"
                />
            </Grid>
        </>
    )
}
export default StepOne;
