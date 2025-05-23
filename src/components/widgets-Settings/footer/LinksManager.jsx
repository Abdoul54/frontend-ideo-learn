'use client';
import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
    CircularProgress,
    Paper
} from '@mui/material';
import { useUpdateFooterLinks } from '@/hooks/api/tenant/widgets/useWidgets';
import { v4 as uuidv4 } from 'uuid';

// Link edit dialog component
const LinkDialog = ({ open, onClose, link = {}, onSave, isNew = false }) => {
    const [title, setTitle] = useState(link.title || '');
    const [url, setUrl] = useState(link.url || '');
    const [errors, setErrors] = useState({});

    const handleSave = () => {
        const newErrors = {};
        let hasErrors = false;

        if (!title.trim()) {
            newErrors.title = 'Title is required';
            hasErrors = true;
        }

        if (!url.trim()) {
            newErrors.url = 'URL is required';
            hasErrors = true;
        }

        if (hasErrors) {
            setErrors(newErrors);
            return;
        }

        onSave({
            id: link.id || uuidv4(),
            title,
            url
        });

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isNew ? 'Add New Link' : 'Edit Link'}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        error={Boolean(errors.title)}
                        helperText={errors.title}
                    />
                    <TextField
                        label="URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        fullWidth
                        error={Boolean(errors.url)}
                        helperText={errors.url}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const LinksManager = ({ links = [], setLinks, refetchData }) => {
    const updateLinksMutation = useUpdateFooterLinks();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [newDialogOpen, setNewDialogOpen] = useState(false);
    const [currentLink, setCurrentLink] = useState(null);

    const handleMoveUp = (index) => {
        if (index === 0) return;

        const newLinks = [...links];
        const temp = newLinks[index];
        newLinks[index] = newLinks[index - 1];
        newLinks[index - 1] = temp;

        setLinks(newLinks);
    };

    const handleMoveDown = (index) => {
        if (index === links.length - 1) return;

        const newLinks = [...links];
        const temp = newLinks[index];
        newLinks[index] = newLinks[index + 1];
        newLinks[index + 1] = temp;

        setLinks(newLinks);
    };

    const handleDelete = (id) => {
        setLinks(links.filter(link => link.id !== id));
    };

    const handleEdit = (link) => {
        setCurrentLink(link);
        setEditDialogOpen(true);
    };

    const handleEditSave = (updatedLink) => {
        setLinks(links.map(link =>
            link.id === updatedLink.id ? updatedLink : link
        ));
    };

    const handleAddNew = () => {
        setNewDialogOpen(true);
    };

    const handleAddSave = (newLink) => {
        setLinks([...links, newLink]);
    };

    const handleSaveAll = async () => {
        try {
            await updateLinksMutation.mutateAsync(links, {
                onSuccess: () => {
                    refetchData?.();
                }
            });
        } catch (error) {
            console.error('Error saving links:', error);
        }
    };

    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Manage the useful links displayed in the footer. Use the arrow buttons to reorder.
                </Typography>
            </Box>

            <Box sx={{ mb: 3, minHeight: '50px' }}>
                {links.length === 0 ? (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            textAlign: 'center',
                            color: 'text.secondary'
                        }}
                    >
                        No links added yet. Click "Add Link" to create one.
                    </Paper>
                ) : (
                    links.map((link, index) => (
                        <Paper
                            key={link.id}
                            variant="outlined"
                            sx={{
                                p: 2,
                                mb: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                }
                            }}
                        >
                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                <Typography variant="body1" noWrap>{link.title}</Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    component="div"
                                >
                                    {link.url}
                                </Typography>
                            </Box>
                            <Box>
                                <IconButton
                                    size="small"
                                    onClick={() => handleMoveUp(index)}
                                    disabled={index === 0}
                                >
                                    <i className="solar-alt-arrow-up-line-duotone" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleMoveDown(index)}
                                    disabled={index === links.length - 1}
                                >
                                    <i className="solar-alt-arrow-down-line-duotone" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEdit(link)}
                                >
                                    <i className="solar-pen-2-line-duotone" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDelete(link.id)}
                                >
                                    <i className="solar-trash-bin-trash-line-duotone" />
                                </IconButton>
                            </Box>
                        </Paper>
                    ))
                )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveAll}
                    disabled={updateLinksMutation.isLoading}
                    startIcon={updateLinksMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {updateLinksMutation.isLoading ? 'Saving...' : 'Save All Links'}
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleAddNew}
                    startIcon={<i className="solar-add-square-bold-duotone" />}
                >
                    Add Link
                </Button>
            </Box>

            {/* Edit Dialog */}
            {currentLink && (
                <LinkDialog
                    open={editDialogOpen}
                    onClose={() => {
                        setEditDialogOpen(false);
                        setCurrentLink(null);
                    }}
                    link={currentLink}
                    onSave={handleEditSave}
                />
            )}

            {/* New Link Dialog */}
            <LinkDialog
                open={newDialogOpen}
                onClose={() => setNewDialogOpen(false)}
                onSave={handleAddSave}
                isNew
            />
        </>
    );
};

export default LinksManager;