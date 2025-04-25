import CustomTabList from "@/@core/components/mui/TabList";
import { TabContext, TabPanel } from "@mui/lab";
import {
    Button,
    CardActions,
    Grid,
    List,
    ListItem,
    Paper,
    Tab,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import General from "./Properties/General";
import { useLearningPlan, useUpdateLearningPlan } from "@/hooks/api/tenant/learn/useLearningPlan";
import { defaultValues, schema } from "@/constants/LearningPlan";
import { yupResolver } from "@hookform/resolvers/yup";
import EnrollementOptions from "./Properties/EnrollementOptions";
import TimeOptions from "./Properties/TimeOptions";


const Action = ({ text, disabled }) => {
    return (
        <CardActions>
            <Grid container justifyContent="flex-end">
                <Grid item>
                    <Button
                        variant="contained"
                        type="submit"
                        color="primary"
                        disabled={disabled}
                    >
                        {text || "Save"}
                    </Button>
                </Grid>
            </Grid>
        </CardActions>
    );
};

const Properties = ({ data, isLoading }) => {
    const [tab, setTab] = useState("0");
    const [enableTimeOptions, setEnableTimeOptions] = useState(false);
    const [UUID, setUUID] = useState("");

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset
    } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
    });

    const updateLearningPlan = useUpdateLearningPlan();


    useEffect(() => {
        // If data is provided, populate the form
        if (data) {
            setUUID(data?.uuid);
            if (data?.time_options?.validity_time || data?.time_options?.validity_time_type || data?.time_options?.validity_time_update_existing) {
                setEnableTimeOptions(true);
            }

            reset({
                title: data?.title,
                code: data?.code,
                status: data?.status,
                short_description: data?.short_description,
                description: data?.description,
                image: data?.image,
                language: data?.lang_code,
                enable_deep_link: data?.enrollment_options?.enable_deep_link,
                validity_time: data?.time_options?.validity_time,
                validity_time_type: data?.time_options?.validity_time_type,
                validity_time_update_existing: data?.time_options?.validity_time_update_existing === 1 ? true : false,
            });
        }
    }, [data, reset]);

    const onSubmit = (submittedData) => {
        console.log("Submitted Data:", submittedData);

        if (!enableTimeOptions) {
            submittedData.validity_time = '';
            submittedData.validity_time_type = '';
            submittedData.validity_time_update_existing = '';
        }

        if (!submittedData.image) {
            console.log("Image is empty:", submittedData.image);

            submittedData.image = '';
        }

        // Here you can handle the form submission
        const formData = new FormData();

        // Append all form data to FormData object
        Object.keys(submittedData).forEach((key) => {
            if (key === "validity_time" && submittedData[key] === '') {
                return;
            }
            formData.append(key, submittedData[key]);
        });

        formData.append("_method", "PUT");

        updateLearningPlan.mutateAsync({
            learningPlanId: data?.id,
            data: formData,
        })
    };

    const handleChange = (_, newValue) => {
        setTab(newValue);
    };

    return (
        <>
            <Grid container spacing={4} component={List}>
                <Grid item xs={12} component={ListItem}>
                    <TabContext value={tab}>
                        <Grid container spacing={2}>
                            <Grid item xs={2}>
                                <Paper elevation={0} sx={{
                                    bgcolor: 'background.default',
                                }}>
                                    <CustomTabList
                                        orientation='vertical'
                                        onChange={handleChange}
                                        color="primary"
                                        vertical="true"
                                    >
                                        <Tab value="0" label="General" disabled={isLoading} />
                                        <Tab value="1" label="Enrollements Options" disabled={isLoading} />
                                        <Tab value="2" label="Time Options" disabled={isLoading} />
                                        {/* <Tab value="3" label="Catalogs & e-commerce" />
                                        <Tab value="4" label="Credits (CEUs)" />
                                        <Tab value="5" label="Player" />
                                        <Tab value="6" label="Certificate template" />
                                        <Tab value="7" label="Certifications and retraining" /> */}
                                    </CustomTabList>
                                </Paper>
                            </Grid>
                            <Grid item xs={10}>
                                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', padding: 3 }} component='form' onSubmit={handleSubmit(onSubmit)}>
                                    <TabPanel value="0">
                                        {tab === "0" && <General Action={<Action
                                            text={updateLearningPlan?.isPending ? "Saving..." : "Save"}
                                            disable={updateLearningPlan?.isPending}
                                        />}
                                            control={control}
                                            UUID={UUID}
                                            setValue={setValue}
                                            watch={watch} />}
                                    </TabPanel>
                                    <TabPanel value="1">
                                        {tab === "1" && <EnrollementOptions Action={<Action
                                            text={updateLearningPlan?.isPending ? "Saving..." : "Save"}
                                            disable={updateLearningPlan?.isPending}
                                        />}
                                            control={control}
                                            setValue={setValue}
                                            watch={watch} />}
                                    </TabPanel>
                                    <TabPanel value="2">
                                        {tab === "2" && <TimeOptions Action={<Action
                                            text={updateLearningPlan?.isPending ? "Saving..." : "Save"}
                                            disable={updateLearningPlan?.isPending}
                                        />}
                                            control={control}
                                            enableTimeOptions={enableTimeOptions}
                                            setEnableTimeOptions={setEnableTimeOptions} />}
                                    </TabPanel>
                                </Paper>
                            </Grid>
                        </Grid>
                    </TabContext>
                </Grid>
            </Grid>
        </>
    );
};

export default Properties;