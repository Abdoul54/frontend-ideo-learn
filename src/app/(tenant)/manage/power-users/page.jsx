'use client'
import CustomTabList from "@/@core/components/mui/TabList";
import PowerUsers from "@/views/tabs/power-users/PowerUsers";
import Profile from "@/views/tabs/power-users/Profile";
import { TabContext, TabPanel } from "@mui/lab";
import { Grid, Tab } from "@mui/material";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
    const searchParams = useSearchParams();
    const [value, setValue] = useState(() => {
        // Set initial value based on URL parameter
        const tabParam = searchParams.get("tab");
        return tabParam === "profiles" ? "1" : "0";
    });

    // Update the value when URL changes
    useEffect(() => {
        const tabParam = searchParams.get("tab");
        setValue(tabParam === "profiles" ? "1" : "0");
    }, [searchParams]);

    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <TabContext value={value}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
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
                                <Tab value="0" label="Power Users" />
                                <Tab value="1" label="Profiles" />
                            </CustomTabList>
                        </Grid>
                        <Grid item xs={12}>
                            <TabPanel value="0">
                                <PowerUsers />
                            </TabPanel>
                            <TabPanel value="1">
                                <Profile />
                            </TabPanel>
                        </Grid>
                    </Grid>
                </TabContext>
            </Grid>
        </Grid>
    );
}