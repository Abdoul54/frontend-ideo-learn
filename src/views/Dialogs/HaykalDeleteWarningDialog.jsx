import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    DialogActions,
    Button,
    Typography,
    Divider,
    alpha,
    Paper
} from '@mui/material';

const HaykalDeleteWarningDialog = ({ open, onClose, haykalTitle }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                elevation: 5,
                sx: {
                    borderRadius: 1,
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2.5,
                }}
            >
                <i className="solar-danger-bold-duotone" style={{ width: '24px', height: '24px' }} />
                <Typography variant="h5" component="span" fontWeight="bold">
                    Cannot Delete Branch
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        You cannot delete "<strong>{haykalTitle}</strong>" because it contains child branches.
                    </Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            bgcolor: (theme) => alpha(theme.palette.warning.light, 0.3),
                            borderColor: 'warning.main',
                            mb: 3,
                        }}
                    >
                        <Typography variant="body2" color="warning.dark">
                            You must first delete child branches before you can delete this branch. Please navigate to this branch and remove all child items with caution.
                        </Typography>
                    </Paper>
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    size="medium"
                >
                    I Understand
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default HaykalDeleteWarningDialog;