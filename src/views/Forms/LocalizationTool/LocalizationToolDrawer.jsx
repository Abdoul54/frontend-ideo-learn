import DrawerFormContainer from "@/components/DrawerFormContainer";
import SelectInput from "@/components/inputs/SelectInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import TextInput from "@/components/inputs/TextInput";
import { defaultValues, schema } from "@/constants/LocalizationTool";
import { useUpdateLocalizationSettings } from "@/hooks/api/tenant/useLocalization";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Card, CardActions, CardContent, Grid } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const LocalizationToolDrawer = ({ open, onClose, localization }) => {
    const { control, formState: { errors }, reset, handleSubmit } = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultValues
    });

    const updateLocalizationSettings = useUpdateLocalizationSettings();

    useEffect(() => {
        if (localization) {
            reset(localization);
        }
    }, [localization, reset]);

    const onSubmit = (data) => {
        updateLocalizationSettings.mutate({
            id: localization.id,
            data
        }, {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    }

    const cancel = () => {
        reset();
        onClose();
    }

    return (
        <DrawerFormContainer
            title="Language Tool Settings"
            open={open}
            onClose={onClose}
            width="40%"
        >
            <Card
                component='form'
                onSubmit={handleSubmit(onSubmit)}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 0 }}
            >
                <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    p: 2,
                    '&::-webkit-scrollbar': {
                        width: '0.4em'
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'var(--mui-palette-background-paper)'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                        borderRadius: 2
                    }

                }}
                >
                    <Grid container rowSpacing={5} padding={2}>
                        <Grid item xs={12}>
                            <TextInput
                                control={control}
                                name="name"
                                label="Name"
                                error={errors?.name?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <SelectInput
                                control={control}
                                name="direction"
                                label="Direction"
                                error={errors?.direction?.message}
                                options={[
                                    { label: 'Left to Right', value: 'ltr' },
                                    { label: 'Right to Left', value: 'rtl' }
                                ]}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <SwitchInput
                                control={control}
                                name="is_default"
                                label="Default"
                                error={errors?.is_default?.message}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions
                    sx={{
                        justifyContent: 'flex-end',
                        gap: 2,
                        p: 2
                    }}
                >
                    <Button onClick={cancel}>
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        color="primary"
                        type="submit"
                    >
                        Submit
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    )
}

export default LocalizationToolDrawer;