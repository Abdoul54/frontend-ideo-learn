import FileInput from "@/components/inputs/FileInput";
import SelectInput from "@/components/inputs/SelectInput";
import TextEditorInput from "@/components/inputs/TextEditorInput";
import TextInput from "@/components/inputs/TextInput";
import { useActiveLanguages } from "@/hooks/api/tenant/useLocalization";
import { Card, CardContent, Grid, List, ListItem, ListItemText, TextField } from "@mui/material";

const General = ({ Action, control, setValue, watch, UUID }) => {

    const { data: activeLanguages, isLoading: isLoadingActiveLanguages, error: errorActiveLanguages } = useActiveLanguages();

    const description = watch("description") || "";
    const handleEditorUpdate = (content) => {
        setValue("description", content);
    };

    return (
        <Card
            sx={{
                border: 0,
            }}
        >
            <CardContent>
                <Grid container spacing={4} component={List}>
                    <Grid item xs={12} component={ListItem}>
                        <ListItemText primary='Information'
                            secondary="Fill in the details of the learning plan"
                            primaryTypographyProps={{
                                variant: 'h5',
                                sx: {
                                    fontWeight: 600,
                                    fontSize: '1.2rem',
                                }
                            }}
                            secondaryTypographyProps={{
                                color: 'text.secondary',
                                variant: 'body2',
                                sx: { mb: 2 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="title"
                            label="Title"
                            fullWidth
                            control={control}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="code"
                            label="Code"
                            fullWidth
                            control={control}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextField
                            name="uuid"
                            label="UUID"
                            value={UUID}
                            fullWidth
                            InputProps={{
                                readOnly: true
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <TextInput
                            name="short_description"
                            label="Short Description"
                            fullWidth
                            control={control}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem} sx={{ display: 'block', width: '100%' }}>
                        <ListItemText
                            primary="Description"
                            primaryTypographyProps={{
                                variant: 'h6',
                                sx: { mb: 1 }
                            }}
                        />
                        <TextEditorInput
                            content={description}
                            onUpdate={handleEditorUpdate}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <ListItemText primary='Language'
                            secondary="Select the language of the learning plan"
                            primaryTypographyProps={{
                                variant: 'h5',
                                sx: {
                                    fontWeight: 600,
                                    fontSize: '1.2rem',
                                }
                            }}
                            secondaryTypographyProps={{
                                color: 'text.secondary',
                                variant: 'body2',
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <SelectInput
                            name="language"
                            label="Language"
                            control={control}
                            options={activeLanguages}
                            labelKey="name"
                            valueKey="code"
                            disabled={isLoadingActiveLanguages || errorActiveLanguages}
                        />
                    </Grid>
                    <Grid item xs={12} component={ListItem}>
                        <ListItemText primary='Thumbnail'
                            secondary="Upload a thumbnail for the learning plan"
                            primaryTypographyProps={{
                                variant: 'h5',
                                sx: {
                                    fontWeight: 600,
                                    fontSize: '1.2rem',
                                }
                            }}
                            secondaryTypographyProps={{
                                color: 'text.secondary',
                                variant: 'body2',
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <FileInput
                            name="image"
                            control={control}
                            label="Upload File"
                            accept="image/*"
                            variant="default" // or just omit, as default is the default
                            helperText="Supports images"
                        />
                    </Grid>
                </Grid>
            </CardContent>
            {Action}
        </Card>
    );
}

export default General;