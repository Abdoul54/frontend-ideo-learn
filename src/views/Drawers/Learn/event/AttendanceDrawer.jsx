// AttendanceDrawer.jsx
'use client';
import React, { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    Button,
    RadioGroup,
    Radio,
    FormControlLabel,
    IconButton,
    Divider,
    CircularProgress
} from '@mui/material';
import { useUpdateAttendance } from '@/hooks/api/tenant/learn/sessions/useSessionEvents';

const AttendanceDrawer = ({ open, onClose, eventId, attendanceData }) => {
    const [status, setStatus] = useState(attendanceData?.status || 'not_set');
    const updateAttendanceMutation = useUpdateAttendance();
    
    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };
    
    const handleSubmit = async () => {
        try {
            await updateAttendanceMutation.mutateAsync({
                eventId,
                attendanceId: attendanceData.id,
                status: status
            });
            onClose();
        } catch (error) {
            console.error('Error updating attendance:', error);
        }
    };
    
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 400 },
                    p: 3
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Attendance sheet</Typography>
                <IconButton onClick={onClose}>
                    <i className="lucide-x" fontSize="small" />
                </IconButton>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Mark the attendance of the selected user
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {attendanceData && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
                        {attendanceData.user?.full_name || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {attendanceData.user?.email || 'No email'}
                    </Typography>
                    
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Event effective time
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" display="block" color="text.secondary">
                            Effective Time
                        </Typography>
                        <Typography variant="body2">
                            {attendanceData.event?.duration_minutes 
                                ? `${Math.floor(attendanceData.event.duration_minutes / 60)}h ${attendanceData.event.duration_minutes % 60}m` 
                                : '00:00'}
                        </Typography>
                    </Box>
                    
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Attendance status
                    </Typography>
                    
                    <RadioGroup
                        value={status}
                        onChange={handleStatusChange}
                        sx={{ mb: 4 }}
                    >
                        <FormControlLabel 
                            value="present" 
                            control={<Radio />} 
                            label="Present" 
                            sx={{ mb: 1 }}
                        />
                        <FormControlLabel 
                            value="absent" 
                            control={<Radio />} 
                            label="Absent" 
                            sx={{ mb: 1 }}
                        />
                        <FormControlLabel 
                            value="not_set" 
                            control={<Radio />} 
                            label="Not set" 
                        />
                    </RadioGroup>
                </Box>
            )}
            
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                <Button 
                    variant="outlined" 
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button 
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={updateAttendanceMutation.isPending}
                    startIcon={updateAttendanceMutation.isPending ? <CircularProgress size={20} /> : null}
                >
                    Mark attendance
                </Button>
            </Box>
        </Drawer>
    );
};

export default AttendanceDrawer;