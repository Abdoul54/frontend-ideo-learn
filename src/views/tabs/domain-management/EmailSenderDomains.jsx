// MainDomain.tsx
import { useEmailSender, useTestEmailSender } from "@/hooks/api/tenant/useEmailSender";
import EmailSenderDialog from "@/views/Dialogs/EmailSender";
import EmailSenderDomainDrawer from "@/views/Forms/EmailSenderDomain/EmailDomainSenderDrawer";
import { Box, Button, ButtonGroup, Grid, List, ListItem, ListItemText, TextField } from "@mui/material";
import { useState } from "react";

const EmailSenderDomains = () => {

    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const { data } = useEmailSender()

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} >
                <Grid container spacing={3} component={List}>
                    <Grid item component={ListItem} xs={6}>
                        <ListItemText
                            primary="Host"
                            secondary={data?.host || 'N/A'}
                        />
                    </Grid>
                    <Grid item component={ListItem} xs={6}>
                        <ListItemText
                            primary="Port"
                            secondary={data?.port || 'N/A'}
                        />
                    </Grid>
                    <Grid item component={ListItem} xs={6}>
                        <ListItemText
                            primary="Username"
                            secondary={data?.username || 'N/A'}
                        />
                    </Grid>
                    <Grid item component={ListItem} xs={6}>
                        <ListItemText
                            primary="Encryption"
                            secondary={data?.encryption || 'N/A'}
                        />
                    </Grid>
                    <Grid item component={ListItem} xs={6}>
                        <ListItemText
                            primary="From Address"
                            secondary={data?.from_address || 'N/A'}
                        />
                    </Grid>
                    <Grid item component={ListItem} xs={6}>
                        <ListItemText
                            primary="From Name"
                            secondary={data?.from_name || 'N/A'}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}
            >
                <ButtonGroup>
                    <Button
                        onClick={() => setOpenDialog(true)}
                    >
                        Test Configuration
                    </Button>
                    <Button
                        variant='outlined'
                        color="primary"
                        onClick={() => setOpen(true)}
                    >
                        Edit
                    </Button>
                </ButtonGroup>
            </Grid>
            <EmailSenderDomainDrawer open={open} onClose={() => setOpen(false)} data={data} />
            <EmailSenderDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            />
        </Grid>
    )
}
export default EmailSenderDomains;