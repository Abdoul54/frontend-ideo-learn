import { Drawer, Box, Stack, IconButton, List, ListItemText } from '@mui/material';

export default function DrawerFormContainer({
    open,
    onClose,
    width = {
        xs: '100%',
        sm: '75%',
        md: '50%'
    },
    children,
    title,
    description
}) {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width }
            }}

        >
            <Stack sx={{ borderBottom: 1, borderColor: 'divider', }}>
                <Box p={3} display='flex' justifyContent='space-between'>
                    <List>
                        <ListItemText primary={title}
                            secondary={description} />
                    </List>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <IconButton onClick={onClose}>
                            <i className='lucide-x' />
                        </IconButton>
                    </Box>
                </Box>
            </Stack>
            <Box sx={{ width: width - 1, overflow: 'auto', height: '100%' }}>
                <Box p={3} height='100%'>
                    {children}
                </Box>
            </Box>
        </Drawer>
    );
}

