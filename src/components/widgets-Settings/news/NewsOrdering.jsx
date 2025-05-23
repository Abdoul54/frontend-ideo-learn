// frontend/src/components/widgets-Settings/news/NewsOrdering.jsx
import { useState } from 'react';
import {
    Box,
    IconButton,
    Button,
    Card,
    CardContent,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Divider
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

const NewsOrdering = ({ news, setNews, onSave, isSaving = false }) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentNews, setCurrentNews] = useState(null);

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            href_text: '',
            href_link: '',
        }
    });

    const handleMoveUp = (index) => {
        if (index === 0) return;
        const updatedNews = [...news];
        const [movedElement] = updatedNews.splice(index, 1);
        updatedNews.splice(index - 1, 0, movedElement);
        setNews(updatedNews);
    };

    const handleMoveDown = (index) => {
        if (index === news.length - 1) return;
        const updatedNews = [...news];
        const [movedElement] = updatedNews.splice(index, 1);
        updatedNews.splice(index + 1, 0, movedElement);
        setNews(updatedNews);
    };

    const handleEdit = (newsItem) => {
        setCurrentNews(newsItem);
        setValue('title', newsItem.title || '');
        setValue('description', newsItem.description || '');
        setValue('href_text', newsItem.href_text || '');
        setValue('href_link', newsItem.href_link || '');
        setEditDialogOpen(true);
    };

    const handleDeleteNews = (id) => {
        const updatedNews = news.filter((item) => item.id !== id);
        setNews(updatedNews);
    };

    const onEditSubmit = (data) => {
        if (!currentNews) return;

        setNews((prevNews) =>
            prevNews.map((item) =>
                item.id === currentNews.id ? { ...item, ...data } : item
            )
        );

        setEditDialogOpen(false);
        reset();
    };

    if (!news || news.length === 0) {
        return (
            <Typography color="text.secondary" align="center">
                No news items to arrange
            </Typography>
        );
    }

    return (
        <Box>
            {news.map((item, index) => (
                <Card
                    key={item.id}
                    sx={{
                        mb: 2,
                        position: 'relative',
                        borderLeft: '4px solid',
                        borderColor: 'primary.main'
                    }}
                >
                    <CardContent sx={{ pb: '16px !important' }}>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                            {item.title}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 1,
                                maxHeight: 60,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {item.description}
                        </Typography>

                        <Box
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                display: 'flex',
                            }}
                        >
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                            >
                                <i className="lucide-chevron-up" />
                            </IconButton>
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === news.length - 1}
                            >
                                <i className="lucide-chevron-down" />
                            </IconButton>
                            <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleEdit(item)}
                            >
                                <i className="lucide-edit-3" />
                            </IconButton>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteNews(item.id)}
                            >
                                <i className="lucide-trash-2" />
                            </IconButton>
                        </Box>
                    </CardContent>
                </Card>
            ))}

            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={onSave}
                sx={{ mt: 2 }}
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
            >
                {isSaving ? 'Saving...' : 'Save Order'}
            </Button>

            {/* Edit Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <form onSubmit={handleSubmit(onEditSubmit)}>
                    <DialogTitle>Edit News</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Controller
                                name="title"
                                control={control}
                                rules={{ required: 'Title is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Title"
                                        fullWidth
                                        margin="normal"
                                        error={Boolean(errors.title)}
                                        helperText={errors.title?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Description"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        margin="normal"
                                        error={Boolean(errors.description)}
                                        helperText={errors.description?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="href_text"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Button Text"
                                        fullWidth
                                        margin="normal"
                                        error={Boolean(errors.href_text)}
                                        helperText={errors.href_text?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="href_link"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Button Link"
                                        fullWidth
                                        margin="normal"
                                        error={Boolean(errors.href_link)}
                                        helperText={errors.href_link?.message}
                                    />
                                )}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setEditDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary">Save Changes</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default NewsOrdering;