// frontend/src/components/widgets-Settings/news/AddNews.jsx
import { useState } from 'react';
import {
    TextField,
    FormControl,
    FormHelperText,
    Button,
    Box,
    CircularProgress,
    Typography
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import { useForm, Controller } from 'react-hook-form';
import FileDropzone from '@/components/inputs/FileDropzone';

const defaultValues = {
    title: '',
    description: '',
    href_text: '',
    href_link: '',
};

const AddNews = ({ onSubmit, isSubmitting = false }) => {
    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues,
        mode: 'onChange'
    });
    const [image, setImage] = useState(null);
    const [document, setDocument] = useState(null);

    const handleFormSubmit = (data) => {
        const formData = {
            ...data,
            image: image?.file,
            document: document?.file
        };

        onSubmit(formData);

        // Reset the form after submission
        reset();
        setImage(null);
        setDocument(null);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={3}>
                <Grid item size={{ xs: 12 }}>
                    <FormControl fullWidth>
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: 'Title is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Title"
                                    placeholder="Enter news title"
                                    error={Boolean(errors.title)}
                                    helperText={errors.title?.message}
                                    disabled={isSubmitting}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                <Grid item size={{ xs: 12 }}>
                    <FormControl fullWidth>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Description"
                                    placeholder="Enter news description"
                                    multiline
                                    rows={4}
                                    error={Boolean(errors.description)}
                                    helperText={errors.description?.message}
                                    disabled={isSubmitting}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                <Grid item size={{ xs: 12 }}>
                    <FormControl fullWidth>
                        <Controller
                            name="href_text"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Button Text"
                                    placeholder="Text for the button (optional)"
                                    error={Boolean(errors.href_text)}
                                    helperText={errors.href_text?.message}
                                    disabled={isSubmitting}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                <Grid item size={{ xs: 12 }}>
                    <FormControl fullWidth>
                        <Controller
                            name="href_link"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Button Link"
                                    placeholder="URL for the button (optional)"
                                    error={Boolean(errors.href_link)}
                                    helperText={errors.href_link?.message}
                                    disabled={isSubmitting}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                <Grid item size={{ xs: 12 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>News Image (Optional)</Typography>
                        <FileDropzone
                            type="image"
                            maxSize={5242880}
                            onFileSelect={(file) => setImage(file)}
                            label="Upload News Image"
                            selectedFile={image}
                            disabled={isSubmitting}
                        />
                    </Box>
                </Grid>

                <Grid item size={{ xs: 12 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>News Document (Optional)</Typography>
                        <FileDropzone
                            type="document"
                            maxSize={15728640} // 15MB
                            onFileSelect={(file) => setDocument(file)}
                            accept={['.pdf', '.doc', '.docx']}
                            label="Upload News Document"
                            selectedFile={document}
                            disabled={isSubmitting}
                        />
                    </Box>
                </Grid>

                <Grid item size={{ xs: 12 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSubmitting ? 'Adding...' : 'Add News'}
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default AddNews;