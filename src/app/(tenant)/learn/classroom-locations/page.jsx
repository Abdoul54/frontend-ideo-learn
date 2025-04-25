'use client'
import CustomTabList from "@/@core/components/mui/TabList";
import { TabContext, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Classrooms from "@/views/tabs/classrooms-locations/Classrooms";
import Locations from "@/views/tabs/classrooms-locations/Locations";

export default function Page() {
    const searchParams = useSearchParams();
    const [value, setValue] = useState(() => {
        // Set initial value based on URL parameter
        const tabParam = searchParams.get("tab");
        return tabParam === "locations" ? "1" : "0";
    });

    // Update the value when URL changes
    useEffect(() => {
        const tabParam = searchParams.get("tab");
        setValue(tabParam === "locations" ? "1" : "0");
    }, [searchParams]);

    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    return (
        <Grid container spacing={4}>
            <Grid item size={12} >
                <TabContext value={value}>
                    <Grid container spacing={4}>
                        <Grid item size={12}>
                            <CustomTabList
                                pill='true'
                                onChange={handleChange}
                                variant="fullWidth"
                                sx={{
                                    '& .MuiTabs-flexContainer': {
                                        width: '100%'
                                    }
                                }}
                            >
                                <Tab value="0" label="Classrooms" />
                                <Tab value="1" label="Locations" />
                            </CustomTabList>
                        </Grid>
                        <Grid item size={12}>
                            <TabPanel value="0">
                                <Classrooms />
                            </TabPanel>
                            <TabPanel value="1">
                                <Locations />
                            </TabPanel>
                        </Grid>
                    </Grid>
                </TabContext>
            </Grid>
        </Grid>
    );
}