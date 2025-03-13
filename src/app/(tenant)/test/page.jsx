'use client';

import { Button, Grid } from "@mui/material";
import { useSession } from "next-auth/react";

const Page = () => {
    const { update, data } = useSession();

    console.log(data);

    const handleSession = () => {
        update({
            error: "SessionExpired",
        });
    }
    return (
        <Grid container>
            <Grid item xs={12}>
                <Button variant="contained" color="primary" loading onClick={handleSession}>Test</Button>
            </Grid>
        </Grid>
    )
}

export default Page;