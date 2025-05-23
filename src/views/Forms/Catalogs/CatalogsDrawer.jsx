'use client';

import { Controller, useForm } from "react-hook-form";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    FormHelperText,
    Grid2 as Grid,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import { FixedSizeGrid } from 'react-window';
import DrawerFormContainer from "@/components/DrawerFormContainer";
import TextInput from "@/components/inputs/TextInput";
import { useCreateCatalog, useUpdateCatalog } from "@/hooks/api/tenant/learn/catalog/useCatalog";
import ColorInput from "@/components/inputs/ColorInput";
import CustomDropdown from "@/@core/components/custom-dropdown";
import SelectInput from "@/components/inputs/SelectInput";
import { Lucide } from "@/utils/getters/getLucide";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useTranslation } from '@/@core/contexts/translationContext';

// Constants for the icon grid
const CELL_SIZE = 48;
const GRID_COLUMNS = 8;

// Default values for form initialization
const DEFAULT_FORM_VALUES = {
    name: "",
    code: "",
    description: "",
    thumbnail: {
        icon: "solar-book-bold-duotone", // Default icon
        icon_code_color: "#ffffff", // Default text color
        backgroud_code_color: "#3498db" // Default background color
    },
    sorting: "name_asc"
};

// Catalog sorting options
const catalogsSorting = [
    { label: 'Name Ascending', value: 'name_asc' },
    { label: 'Name Descending', value: 'name_desc' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Newest', value: 'newest' }
];

/**
 * Virtualized grid of icons for efficient rendering
 */
const VirtualizedIconGrid = ({ icons = [], onChange }) => {
    const rowCount = Math.ceil(icons.length / GRID_COLUMNS);

    const Cell = ({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * GRID_COLUMNS + columnIndex;
        if (index >= icons.length) return null;

        const icn = icons[index];

        return (
            <Box style={style} display="flex" alignItems="center" justifyContent="center">
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange(icn);
                    }}
                    sx={{ borderRadius: 1 }}
                >
                    <i className={icn} style={{ fontSize: 20 }} />
                </IconButton>
            </Box>
        );
    };

    return (
        <FixedSizeGrid
            columnCount={GRID_COLUMNS}
            columnWidth={CELL_SIZE}
            height={240}
            rowCount={rowCount}
            rowHeight={CELL_SIZE}
            width={400}
        >
            {Cell}
        </FixedSizeGrid>
    );
};

/**
 * Component to display and change the catalog icon
 */
const ChangeIcon = ({ icon, onChange, icons = [], color, bgcolor }) => {
    const { translate } = useTranslation();

    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 56, height: 56, bgcolor: bgcolor || '#3498db' }}>
                <i className={icon || 'solar-book-bold-duotone'} style={{
                    color: color || '#ffffff',
                    fontSize: 24,
                }} />
            </Avatar>

            <CustomDropdown
                Icon={Button}
                leftAlignMenu
                iconButtonProps={{
                    label: translate('Catalog management.BUTTON_CHANGE_ICON', 'Change Icon'),
                    variant: 'outlined',
                    size: 'medium',
                }}
                items={<VirtualizedIconGrid icons={icons} onChange={onChange} />}
            />
        </Stack>
    );
};

/**
 * CatalogsDrawer component for creating and editing catalogs
 */
const CatalogsDrawer = ({ open, onClose, data }) => {
    const queryClient = useQueryClient();
    const { translate } = useTranslation();

    // Determine if we're in edit mode
    const isEditMode = data && data.id !== undefined;

    // Format initial data for the form
    const initialData = isEditMode ? data : DEFAULT_FORM_VALUES;

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: initialData,
    });

    // Watch color values for the icon preview
    const bgColor = watch('thumbnail.backgroud_code_color');
    const color = watch('thumbnail.icon_code_color');
    const icon = watch('thumbnail.icon');

    // Initialize mutations
    const createCatalogMutation = useCreateCatalog();
    const updateCatalogMutation = useUpdateCatalog();

    // Reset the form when the drawer opens or closes, or when data changes
    useEffect(() => {
        if (open) {
            // Use the provided data (for edit) or default values (for create)
            reset(isEditMode ? data : DEFAULT_FORM_VALUES);
        }
    }, [open, data, reset, isEditMode]);

    // Form submission handler
    const onSubmit = async (formData) => {
        try {
            if (isEditMode) {
                // Update existing catalog
                await updateCatalogMutation.mutateAsync({
                    id: data.id,
                    data: formData
                });
                toast.success(translate('Catalog management.TOAST_SUCCESS_UPDATE', "Catalog updated successfully!"));
            } else {
                // Create new catalog
                await createCatalogMutation.mutateAsync(formData);
                toast.success(translate('Catalog management.TOAST_SUCCESS_CREATE', "Catalog created successfully!"));
            }

            // Invalidate the catalogs query to refresh the list
            queryClient.invalidateQueries(['catalogs']);
            queryClient.invalidateQueries(['catalog']);

            // Reset form and close drawer
            reset();
            onClose();
        } catch (error) {
            // Show error message
            toast.error(
                error.message ||
                translate(
                    isEditMode ? 'Catalog management.ERROR_FAILED_UPDATE' : 'Catalog management.ERROR_FAILED_CREATE',
                    { item: translate('catalog.ITEM_NAME', 'catalog') }
                )
            );
            console.error(`Catalog ${isEditMode ? 'update' : 'creation'} error:`, error);
        }
    };

    return (
        <DrawerFormContainer
            title={isEditMode
                ? translate('Catalog management.DRAWER_TITLE_EDIT', `Edit Catalog: ${data.name}`)
                : translate('Catalog management.DRAWER_TITLE_CREATE', "Create Catalog")}
            description={isEditMode
                ? translate('Catalog management.DRAWER_DESCRIPTION_EDIT', "Update catalog details and appearance")
                : translate('Catalog management.DRAWER_DESCRIPTION_CREATE', "Add a new catalog to organize your courses")}
            open={open}
            onClose={onClose}
        >
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 0
                }}
            >
                <CardContent
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'auto',
                        p: 2,
                        '&::-webkit-scrollbar': { width: '0.4em' },
                        '&::-webkit-scrollbar-track': { background: 'var(--mui-palette-background-paper)' },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'var(--mui-palette-primary-main)',
                            borderRadius: 2
                        }
                    }}
                >
                    <Grid container spacing={4} padding={2}>
                        <Grid item size={{ xs: 12 }}>
                            <TextInput
                                name="name"
                                control={control}
                                label={translate('Catalog management.FIELD_CATALOG_NAME', "Catalog Name")}
                                rules={{
                                    required: translate('Catalog management.VALIDATION_NAME_REQUIRED', "Name is required"),
                                    minLength: {
                                        value: 3,
                                        message: translate('Catalog management.VALIDATION_NAME_MIN_LENGTH', "Name must be at least 3 characters")
                                    },
                                }}
                                fullWidth
                                autoFocus
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12 }}>
                            <TextInput
                                name="code"
                                control={control}
                                label={translate('Catalog management.FIELD_CATALOG_CODE', "Catalog Code")}
                                rules={{
                                    minLength: {
                                        value: 2,
                                        message: translate('Catalog management.VALIDATION_CODE_MIN_LENGTH', "Code must be at least 2 characters")
                                    },
                                }}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                helperText={translate('Catalog management.HELPER_CATALOG_CODE', "Optional unique identifier for this catalog")}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12 }}>
                            <TextInput
                                name="description"
                                control={control}
                                label={translate('common.description', "Description")}
                                rules={{
                                    required: translate('Catalog management.VALIDATION_DESCRIPTION_REQUIRED', "Description is required"),
                                    minLength: {
                                        value: 10,
                                        message: translate('Catalog management.VALIDATION_DESCRIPTION_MIN_LENGTH', "Description must be at least 10 characters")
                                    },
                                }}
                                fullWidth
                                multiline
                                rows={3}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12 }}>
                            <Typography variant="h6" sx={{ mb: 1, mt: 5 }}>
                                {translate('Catalog management.SECTION_THUMBNAIL', "Thumbnail Composer")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {translate('Catalog management.SECTION_THUMBNAIL_DESC', "Choose an icon and colors for the catalog")}
                            </Typography>

                            <Controller
                                control={control}
                                name="thumbnail.icon"
                                rules={{ required: translate('Catalog management.VALIDATION_ICON_REQUIRED', "Icon is required") }}
                                render={({ field, fieldState }) => (
                                    <Box sx={{ mb: 3 }}>
                                        <ChangeIcon
                                            icon={field.value}
                                            onChange={field.onChange}
                                            color={color}
                                            bgcolor={bgColor}
                                            icons={Lucide}
                                        />
                                        {fieldState.error && (
                                            <FormHelperText error sx={{ mt: 1 }}>
                                                {fieldState.error.message}
                                            </FormHelperText>
                                        )}
                                    </Box>
                                )}
                            />

                            <Grid container spacing={3}>
                                <Grid item size={{ xs: 12, sm: 6 }}>
                                    <ColorInput
                                        control={control}
                                        name="thumbnail.icon_code_color"
                                        label={translate('Catalog management.FIELD_ICON_COLOR', "Icon Color")}
                                        rules={{ required: translate('Catalog management.VALIDATION_ICON_COLOR_REQUIRED', "Icon color is required") }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item size={{ xs: 12, sm: 6 }}>
                                    <ColorInput
                                        control={control}
                                        name="thumbnail.backgroud_code_color"
                                        label={translate('Catalog management.FIELD_BACKGROUND_COLOR', "Background Color")}
                                        rules={{ required: translate('Catalog management.VALIDATION_BG_COLOR_REQUIRED', "Background color is required") }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item size={{ xs: 12 }}>
                            <Typography variant="h6" sx={{ mb: 1, mt: 5 }}>
                                {translate('Catalog management.SECTION_DISPLAY_SETTINGS', "Display Settings")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {translate('Catalog management.SECTION_DISPLAY_SETTINGS_DESC', "Configure how courses are sorted in this catalog")}
                            </Typography>

                            <SelectInput
                                label={translate('Catalog management.FIELD_DEFAULT_SORTING', "Default Sorting")}
                                name="sorting"
                                control={control}
                                options={catalogsSorting}
                                labelKey="label"
                                valueKey="value"
                                rules={{ required: translate('Catalog management.VALIDATION_SORTING_REQUIRED', "Sorting option is required") }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Button
                        onClick={onClose}
                        disabled={createCatalogMutation.isPending || updateCatalogMutation.isPending || isSubmitting}
                    >
                        {translate('common.cancel', "Cancel")}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={createCatalogMutation.isPending || updateCatalogMutation.isPending || isSubmitting}
                        startIcon={isSubmitting || createCatalogMutation.isPending || updateCatalogMutation.isPending ?
                            <CircularProgress size={20} color="inherit" /> : null
                        }
                    >
                        {isSubmitting || createCatalogMutation.isPending || updateCatalogMutation.isPending
                            ? (isEditMode ? translate('common.updating', "Updating...") : translate('common.creating', "Creating..."))
                            : (isEditMode ? translate('common.update', "Update Catalog") : translate('common.create', "Create Catalog"))
                        }
                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default CatalogsDrawer;