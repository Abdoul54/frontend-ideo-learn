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

const BranchDeleteConfirmationDialog = ({ open, onClose, onConfirm, haykalTitle }) => {
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
                <i className="solar-danger-bold-duotone" style={{ width: '24px', height: '24px', color: (theme) => theme.palette.warning.main }} />
                <Typography variant="h5" component="span" fontWeight="bold">
                    Confirm Branch Deletion
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to delete "<strong>{haykalTitle}</strong>"?
                    </Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            bgcolor: (theme) => alpha(theme.palette.warning.light, 0.1),
                            borderColor: 'warning.main',
                            mb: 3,
                        }}
                    >
                        <Typography variant="body2" color="warning.dark">
                            If this branch contains users, the deletion will fail. This action cannot be undone.
                        </Typography>
                    </Paper>
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    size="medium"
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    size="medium"
                >
                    Delete Branch
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BranchDeleteConfirmationDialog;