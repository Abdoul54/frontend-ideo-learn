import { Controller } from "react-hook-form";
import {
    Typography,
    Grid,
    Paper,
    FormControlLabel,
    Checkbox,
    Box,
    Divider,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    Stack,
    Badge
} from "@mui/material";
import dayjs from "dayjs";

export default function NotificationsStep({
    control,
    errors,
    bulkEnrollment = false,
    courseCount = 0,
    groupCount = 0,
    branchCount = 0
}) {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sx={{ mb: 2, mt: 4 }}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Notification Settings
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                        {/* <Controller
                            name="send_notification"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={value}
                                            onChange={(e) => onChange(e.target.checked)}
                                        />
                                    }
                                    label="Send notification email to enrolled users"
                                />
                            )}
                        /> */}

                        <Typography variant="body2" color="text.secondary">
                            There are no notification settings available for now.
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Users will receive an email notification about their enrollment in {bulkEnrollment ? 'these courses' : 'this course'}.
                    </Typography>
                </Paper>
            </Grid>

            <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Enrollment Summary
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', mb: 3, gap: 3, flexWrap: 'wrap' }}>
                        {/* Users summary */}
                        <Controller
                            name="users"
                            control={control}
                            render={({ field: { value } }) => (
                                <Box sx={{ minWidth: 180 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        <Badge
                                            badgeContent={value.length}
                                            color="primary"
                                            max={999}
                                            sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', height: 20, minWidth: 20 } }}
                                        >
                                            <span style={{ marginRight: 10 }}>Selected Users</span>
                                        </Badge>
                                    </Typography>

                                    {value.length > 0 && (
                                        <List dense sx={{ mt: 1, maxHeight: 150, overflow: 'auto' }}>
                                            {value.slice(0, 5).map(user => (
                                                <ListItem key={user.id} dense>
                                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                                        <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24, fontSize: '0.75rem' }}>
                                                            {user.firstname?.[0] || user.first_name?.[0]}{user.lastname?.[0] || user.last_name?.[0]}
                                                        </Avatar>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={`${user.firstname || user.first_name} ${user.lastname || user.last_name}`}
                                                        primaryTypographyProps={{ variant: 'body2' }}
                                                    />
                                                </ListItem>
                                            ))}
                                            {value.length > 5 && (
                                                <ListItem dense>
                                                    <ListItemText
                                                        primary={`And ${value.length - 5} more users...`}
                                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                    />
                                                </ListItem>
                                            )}
                                        </List>
                                    )}
                                </Box>
                            )}
                        />

                        {/* Groups summary */}
                        {groupCount > 0 && (
                            <Box sx={{ minWidth: 180 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    <Badge
                                        badgeContent={groupCount}
                                        color="primary"
                                        max={999}
                                        sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', height: 20, minWidth: 20 } }}
                                    >
                                        <span style={{ marginRight: 10 }}>Selected Groups</span>
                                    </Badge>
                                </Typography>

                                <Controller
                                    name="group_ids"
                                    control={control}
                                    render={({ field: { value } }) => (
                                        <Box sx={{ mt: 1 }}>
                                            <Chip
                                                label={`${value.length} groups selected`}
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Box>
                                    )}
                                />
                            </Box>
                        )}

                        {/* Branches summary */}
                        {branchCount > 0 && (
                            <Box sx={{ minWidth: 180 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    <Badge
                                        badgeContent={branchCount}
                                        color="primary"
                                        max={999}
                                        sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', height: 20, minWidth: 20 } }}
                                    >
                                        <span style={{ marginRight: 10 }}>Selected Branches</span>
                                    </Badge>
                                </Typography>

                                <Controller
                                    name="branches"
                                    control={control}
                                    render={({ field: { value } }) => (
                                        <Box sx={{ mt: 1 }}>
                                            <Chip
                                                label={`${value.length} branches selected`}
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Box>
                                    )}
                                />
                            </Box>
                        )}

                        {/* Courses summary - only for bulk enrollment */}
                        {bulkEnrollment && courseCount > 0 && (
                            <Box sx={{ minWidth: 180 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    <Badge
                                        badgeContent={courseCount}
                                        color="primary"
                                        max={999}
                                        sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem', height: 20, minWidth: 20 } }}
                                    >
                                        <span style={{ marginRight: 10 }}>Selected Courses</span>
                                    </Badge>
                                </Typography>

                                <Box sx={{ mt: 1 }}>
                                    <Chip
                                        label={`${courseCount} courses selected`}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Enrollment Details
                        </Typography>

                        <Stack spacing={2}>
                            <Controller
                                name="enrollmentType"
                                control={control}
                                render={({ field: { value } }) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ width: 150, fontWeight: 500 }}>
                                            Enrollment type:
                                        </Typography>
                                        <Chip
                                            label={value === 'course' ? 'Course enrollment' : 'Session enrollment'}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                )}
                            />

                            <Controller
                                name="enrollmentType"
                                control={control}
                                render={({ field: { value } }) => (
                                    value === 'session' && (
                                        <Controller
                                            name="session_id"
                                            control={control}
                                            render={({ field: { value: sessionId } }) => (
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2" sx={{ width: 150, fontWeight: 500 }}>
                                                        Selected session:
                                                    </Typography>
                                                    <Chip
                                                        label={`ID: ${sessionId}`}
                                                        color="primary"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Box>
                                            )}
                                        />
                                    )
                                )}
                            />

                            <Controller
                                name="level"
                                control={control}
                                render={({ field: { value } }) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ width: 150, fontWeight: 500 }}>
                                            User level:
                                        </Typography>
                                        <Chip
                                            label={
                                                value === 1 ? 'Learner' :
                                                    value === 2 ? 'Tutor' :
                                                        value === 3 ? 'Instructor' : 'Unknown'
                                            }
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                )}
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ width: 150, fontWeight: 500 }}>
                                    Validity period:
                                </Typography>

                                <Controller
                                    name="date_begin_validity"
                                    control={control}
                                    render={({ field: { value: startDate } }) => (
                                        <Controller
                                            name="date_expire_validity"
                                            control={control}
                                            render={({ field: { value: endDate } }) => (
                                                startDate || endDate ? (
                                                    <Chip
                                                        label={`${startDate ? dayjs(startDate).format('DD/MM/YYYY') : 'No start date'} to ${endDate ? dayjs(endDate).format('DD/MM/YYYY') : 'No end date'}`}
                                                        color="primary"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="No validity period set"
                                                        color="default"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                )
                                            )}
                                        />
                                    )}
                                />
                            </Box>

                            <Controller
                                name="send_notification"
                                control={control}
                                render={({ field: { value } }) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ width: 150, fontWeight: 500 }}>
                                            Send notifications:
                                        </Typography>
                                        <Chip
                                            label={value ? 'Yes' : 'No'}
                                            color={value ? 'success' : 'default'}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                )}
                            />
                        </Stack>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
}