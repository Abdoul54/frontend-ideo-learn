import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, FormControlLabel, Checkbox, Tooltip } from "@mui/material";
import { toast } from "react-hot-toast";
import { useDeleteTenant, useDestroyTenant, useMoveTenantDown, useMoveTenantUp } from "@/hooks/api/central/useTenant";
import OptionMenu from "@/@core/components/option-menu";
import * as yup from "yup";

export const columns = [
    {
        accessorKey: "name",
        header: "Tenant Name",
        flex: 1,
    },
    {
        accessorKey: "status",
        header: "Status",
        flex: 1,
        cell: ({ row }) => (
            <Tooltip title={row.original.status === "enable" ? "Active" : "Inactive"}>
                <i className={`solar-check-circle-outline text-${row.original.status === "enable" ? "success" : "error"} text-xl`} />
            </Tooltip>
        )
    },
    {
        accessorKey: "creation_date",
        header: "Created At",
        flex: 1,
    },
    {
        accessorKey: "main_domain",
        header: "Main Domain URL",
        flex: 1,
        cell: ({ row }) =>
            row.original.main_domain?.url ? (
                <a
                    href={row.original.main_domain.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {row.original.main_domain.url}
                </a>
            ) : (
                "N/A"
            ),
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            const deleteTenant = useDeleteTenant();
            const destroyTenant = useDestroyTenant();
            const [open, setOpen] = useState(false);
            const [confirmText, setConfirmText] = useState("");
            const [permanentDelete, setPermanentDelete] = useState(false);

            const tenantName = row.original.name;

            const handleDelete = () => {
                const mutation = permanentDelete ? destroyTenant : deleteTenant;

                mutation.mutate(row.original.id, {
                    onSuccess: () => {
                        toast.success(
                            permanentDelete
                                ? `Tenant "${tenantName}" permanently deleted`
                                : `Tenant "${tenantName}" deleted successfully`
                        );
                        setOpen(false);
                    },
                    onError: (error) => {
                        toast.error(`Error: ${error.response?.data?.name || "Failed to delete tenant"}`);
                    },
                });
            };

            // Mutations
            const moveTenantUpMutation = useMoveTenantUp();
            const moveTenantDownMutation = useMoveTenantDown();

            // Handle move up/down with confirmation
            const [confirmationModal, setConfirmationModal] = useState({
                open: false,
                tenantId: null,
                tenantName: "",
                action: null,
            });

            const handleMoveTenant = (tenantId, tenantName, action) => {
                setConfirmationModal({
                    open: true,
                    tenantId,
                    tenantName,
                    action,
                });
            };

            const handleConfirmAction = () => {
                const { tenantId, action } = confirmationModal;

                if (action === "up") {
                    moveTenantUpMutation.mutate(tenantId, {
                        onSuccess: () => {
                            toast.success(`Tenant "${confirmationModal.tenantName}" enabled successfully`);
                        },
                        onError: (error) => {
                            toast.error(`Error: ${error.response?.data?.name || "Failed to enable tenant"}`);
                        },
                    });
                } else if (action === "down") {
                    moveTenantDownMutation.mutate(tenantId, {
                        onSuccess: () => {
                            toast.success(`Tenant "${confirmationModal.tenantName}" disabled successfully`);
                        },
                        onError: (error) => {
                            toast.error(`Error: ${error.response?.data?.name || "Failed to disable tenant"}`);
                        },
                    });
                }

                setConfirmationModal({ open: false, tenantId: null, tenantName: "", action: null });
            };

            return (
                <>
                    <OptionMenu
                        options={[
                            {
                                text: "Enable Tenant", //up a tenant
                                icon: <i className="solar-play-circle-bold-duotone" />,
                                menuItemProps: {
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        handleMoveTenant(row.original.id, row.original.name, "up");

                                    },
                                    className: 'flex items-center gap-2'
                                },
                            },
                            {
                                text: "Disable Tenant", //down a tenant
                                icon: <i className="solar-stop-circle-bold-duotone" />,
                                menuItemProps: {
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        handleMoveTenant(row.original.id, row.original.name, "down");
                                    },
                                    className: 'flex items-center gap-2 text-error hover:bg-errorLight'

                                },
                            },
                            {
                                text: "Delete",
                                icon: <i className="solar-trash-bin-minimalistic-2-outline" />,
                                menuItemProps: {
                                    className: 'flex items-center gap-2 text-error hover:bg-errorLight',
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        setOpen(true);
                                    },
                                },
                            },
                        ]}
                    />

                    {/* Confirmation Dialog for Delete */}
                    <Dialog open={open} onClose={() => setOpen(false)}>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogContent>
                            <Typography>
                                To confirm, type the tenant's name: <strong>{tenantName}</strong>
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                margin="dense"
                                label="Tenant Name"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={permanentDelete}
                                        onChange={(e) => setPermanentDelete(e.target.checked)}
                                    />
                                }
                                label="Permanently delete this tenant (Cannot be restored)"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleDelete}
                                color="error"
                                disabled={confirmText !== tenantName}
                            >
                                {permanentDelete ? "Destroy" : "Delete"}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Confirmation Dialog for Move Up/Down */}
                    <Dialog
                        open={confirmationModal.open}
                        onClose={() => setConfirmationModal({ open: false, tenantId: null, tenantName: "", action: null })}
                    >
                        <DialogTitle>Confirm Action</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to {confirmationModal.action === "up" ? "enable" : "disable"} the tenant{" "}
                                <strong>{confirmationModal.tenantName}</strong>?
                            </Typography>
                            <Typography>
                                To confirm, type the tenant's name: <strong>{tenantName}</strong>
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                margin="dense"
                                label="Tenant Name"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setConfirmationModal({ open: false, tenantId: null, tenantName: "", action: null })}>
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmAction}
                                color="primary"
                                disabled={confirmText !== tenantName}
                            >
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            );
        },
        enableSorting: false,
        flex: 0.1,
    },
];


export const defaultValues = {
    platform_name: "",
    subdomain: "",
    default_language: "fr",
    default_timezone: "Africa/Casablanca",
    max_active_users: 500,
    service_start_date: null,
    service_end_date: null,
    configure_smtp: true,
    header: {
        header_message: {
            status: "disabled",
            content: ""
        },
        page_title: "",
        logo: null,
        favicon: null,
    },
    sign_in_page: {
        type: "color",
        color_data: "#FFFFFF",
        bg_data: null,
        bg_video_data: {
            video: null,
            fallback_image: null,
        },
    },
    colors: {
        background_color: '#FFFFFF',
        icon_color: '#000000',
        primary: {
            main: '#1976D2',  // Blue
            light: '#BBDEFB',
            dark: '#0D47A1',
        },
        secondary: {
            main: '#9C27B0',  // Purple
            light: '#E1BEE7',
            dark: '#6A1B9A',
        },
        info: {
            main: '#0288D1',  // Light Blue
            light: '#B3E5FC',
            dark: '#01579B',
        },
        success: {
            main: '#388E3C',  // Green
            light: '#C8E6C9',
            dark: '#1B5E20',
        },
        error: {
            main: '#D32F2F',  // Red
            light: '#FFCDD2',
            dark: '#B71C1C',
        },
        warning: {
            main: '#FBC02D',  // Yellow
            light: '#FFF9C4',
            dark: '#F57F17',
        }
    },
    smtp: {
        host: "",
        port: null,
        username: "",
        password: "",
        encryption: "",
        from_address: "",
        from_name: ""
    }
}


const smtpSchema = yup.object({
    host: yup.string().required('SMTP host is required'),
    port: yup.number().required('SMTP port is required'),
    username: yup.string().required('SMTP username is required'),
    password: yup.string().required('SMTP password is required'),
    encryption: yup.string().required('SMTP encryption is required'),
    from_address: yup.string().required('SMTP from address is required'),
    from_name: yup.string().required('SMTP from name is required'),
});

export const schema = yup.object({
    platform_name: yup.string().required('Platform name is required'),
    subdomain: yup.string().nullable(),
    default_language: yup.string().nullable(),
    default_timezone: yup.string().nullable(),
    max_active_users: yup.number().nullable(),
    service_start_date: yup.date().nullable(),
    service_end_date: yup.date().nullable(),
    configure_smtp: yup.boolean().nullable(),
    header: yup.object({
        page_title: yup.string().nullable(),
        header_message: yup.object({
            status: yup.string().oneOf(['enabled', 'disabled']).nullable(),
            content: yup.string().nullable(),
        }),
        logo: yup.mixed().nullable(),
        favicon: yup.mixed().nullable(),
    }),
    sign_in_page: yup.object({
        type: yup.string().nullable(),
        color_data: yup.string().nullable(),
        bg_data: yup.mixed().nullable(),
        bg_video_data: yup.object({
            video: yup.mixed().nullable(),
            fallback_image: yup.mixed().nullable(),
        }),
    }),
    colors: yup.object({
        background_color: yup.string().nullable(),
        icon_color: yup.string().nullable(),
        primary: yup.object({
            main: yup.string().nullable(),
            light: yup.string().nullable(),
            dark: yup.string().nullable(),
        }),
        secondary: yup.object({
            main: yup.string().nullable(),
            light: yup.string().nullable(),
            dark: yup.string().nullable(),
        }),
        info: yup.object({
            main: yup.string().nullable(),
            light: yup.string().nullable(),
            dark: yup.string().nullable(),
        }),
        success: yup.object({
            main: yup.string().nullable(),
            light: yup.string().nullable(),
            dark: yup.string().nullable(),
        }),
        error: yup.object({
            main: yup.string().nullable(),
            light: yup.string().nullable(),
            dark: yup.string().nullable(),
        }),
        warning: yup.object({
            main: yup.string().nullable(),
            light: yup.string().nullable(),
            dark: yup.string().nullable(),
        }),
    }),
    smtp: yup.mixed().when('configure_smtp', {
        is: true,
        then: () => smtpSchema,
        otherwise: () => yup.object().nullable()
    })
})
