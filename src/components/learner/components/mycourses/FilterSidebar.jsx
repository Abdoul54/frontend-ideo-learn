import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Divider,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Select,
    MenuItem,
    FormControl,
    Radio,
    IconButton,
    Button,
    FormLabel,
    RadioGroup,
    TextField,
    CircularProgress
} from '@mui/material';
import { useActiveLanguages } from '@/hooks/api/tenant/useLocalization';

/**
 * FilterSidebar component - displays and manages course filters
 * 
 * @param {Object} props
 * @param {boolean} props.filtersOpen - Whether the filters sidebar is open
 * @param {Function} props.toggleFilters - Function to toggle filters sidebar
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.handleStatusChange - Handler for status filter changes
 * @param {Function} props.handleTypeChange - Handler for type filter changes
 * @param {Function} props.handleLanguageChange - Handler for language filter changes
 * @param {Function} props.handleDeadlineChange - Handler for deadline filter changes
 * @param {Function} props.handleDurationChange - Handler for duration filter changes
 * @param {Function} props.clearFilters - Function to clear all filters
 * @param {number} props.activeFilterCount - Number of active filters
 * @param {number} props.filteredCoursesCount - Number of courses after filtering
 * @returns {JSX.Element}
 */
const FilterSidebar = ({
    filtersOpen,
    toggleFilters,
    filters,
    handleStatusChange,
    handleTypeChange,
    handleLanguageChange,
    handleDeadlineChange,
    handleDurationChange,
    clearFilters,
    activeFilterCount,
    filteredCoursesCount,
}) => {
    // Helper function to handle duration input changes
    const onDurationChange = (type, value) => {
        // Allow any input but only update parent if valid
        const durationRegex = /^(\d+[hm]?)?$/; // More permissive regex for typing

        // Always update local state to allow typing
        const min = type === 'min' ? value : filters.duration.min;
        const max = type === 'max' ? value : filters.duration.max;

        // Only validate and update parent when valid or empty
        if (value === '' || durationRegex.test(value)) {
            handleDurationChange(min, max);
        }

        // Update error state
        setDurationError(prev => ({
            ...prev,
            [type]: value ? !/^\d+[hm]$/.test(value) : false
        }));
    };

    // Fetch active languages from API
    const { data: activeLanguages, isLoading: isLoadingLanguages, error: languagesError } = useActiveLanguages();

    // Function to determine if a language is selected
    const isLanguageSelected = (langCode) => {
        return filters.language.includes(langCode);
    };

    // Handle language checkbox changes
    const handleLanguageSelectionChange = (langCode) => {
        let newSelection;

        if (langCode === 'all') {
            // If "all" is selected, clear all selections
            newSelection = [];
        } else if (filters.language.includes(langCode)) {
            // If already selected, remove it
            newSelection = filters.language.filter(code => code !== langCode);
        } else {
            // Otherwise add it to selection
            newSelection = [...filters.language, langCode];
        }

        // Pass the new language array to the parent component
        handleLanguageChange({ target: { value: newSelection } });

        // Log for debugging
        console.log('Updated language selection:', newSelection);
    };

    // For duration input validation
    const [durationError, setDurationError] = useState({ min: false, max: false });

    // Validate duration on blur
    const validateDuration = (type, value) => {
        if (!value) {
            setDurationError(prev => ({ ...prev, [type]: false }));
            return;
        }

        const durationRegex = /^(\d+)([hm])$/;
        setDurationError(prev => ({
            ...prev,
            [type]: !durationRegex.test(value)
        }));
    };

    return (
        <Box
            sx={{
                width: filtersOpen ? { xs: '100%', sm: 300 } : 0,
                flexShrink: 0,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                mr: filtersOpen ? 3 : 0,
                position: { xs: filtersOpen ? 'absolute' : 'static', sm: 'static' },
                height: { xs: filtersOpen ? '100%' : 0, sm: '100%', xs: 'auto' },
                zIndex: { xs: filtersOpen ? 10 : -1, sm: 'auto' },
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: filtersOpen ? '1px solid' : 'none',
                borderColor: 'divider',
                boxShadow: filtersOpen ? 1 : 0,
            }}
        >
            <Box sx={{
                p: 3,
                visibility: filtersOpen ? 'visible' : 'hidden',
                opacity: filtersOpen ? 1 : 0,
                transition: 'opacity 0.3s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Filter Panel Header */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="solar-tuning-square-bold-duotone"
                            style={{ color: 'var(--mui-palette-primary-main)' }}
                        />
                        <Typography variant="subtitle1" fontWeight="medium">
                            Filtres
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {activeFilterCount > 0 && (
                            <Typography
                                variant="body2"
                                color="primary"
                                sx={{ cursor: 'pointer' }}
                                onClick={clearFilters}
                            >
                                Réinitialiser
                            </Typography>
                        )}
                        <IconButton
                            size="small"
                            onClick={toggleFilters}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1
                            }}
                        >
                            <i className="solar-close-circle-bold-duotone" />
                        </IconButton>
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {activeFilterCount > 0
                        ? `${activeFilterCount} filtre${activeFilterCount > 1 ? 's' : ''} actif${activeFilterCount > 1 ? 's' : ''}`
                        : 'Aucun filtre actif'
                    }
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Filter Content - scrollable area */}
                <Box sx={{
                    overflowY: 'auto',
                    flexGrow: 1,
                    pb: 2,
                    pr: 1,
                    pl: 1,
                    mr: -1 // Compensate for padding to align scrollbar
                }}>
                    {/* Status Filter */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1.5,
                            gap: 1
                        }}>
                            <i className="solar-user-check-bold-duotone"
                                style={{ color: 'var(--mui-palette-primary-main)' }}
                            />
                            <Typography variant="subtitle2" fontWeight="medium">
                                Statut d'inscription
                            </Typography>
                        </Box>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filters.status.notStarted}
                                        onChange={handleStatusChange}
                                        name="notStarted"
                                        size="small"
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2">Non débuté</Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filters.status.inProgress}
                                        onChange={handleStatusChange}
                                        name="inProgress"
                                        size="small"
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2">En cours</Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filters.status.completed}
                                        onChange={handleStatusChange}
                                        name="completed"
                                        size="small"
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2">Terminé</Typography>
                                    </Box>
                                }
                            />
                        </FormGroup>
                    </Box>

                    {/* Type Filter */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1.5,
                            gap: 1
                        }}>
                            <i className="solar-widget-add-bold-duotone"
                                style={{ color: 'var(--mui-palette-primary-main)' }}
                            />
                            <Typography variant="subtitle2" fontWeight="medium">
                                Type
                            </Typography>
                        </Box>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filters.type.eLearning}
                                        onChange={handleTypeChange}
                                        name="eLearning"
                                        size="small"
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">E-learning</Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filters.type.classroom}
                                        onChange={handleTypeChange}
                                        name="classroom"
                                        size="small"
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">Formation dirigée</Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filters.type.learningPlan}
                                        onChange={handleTypeChange}
                                        name="learningPlan"
                                        size="small"
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">Plan de formation</Typography>
                                    </Box>
                                }
                            />
                        </FormGroup>
                    </Box>

                    {/* Language Filter */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1.5,
                            gap: 1
                        }}>
                            <i className="solar-global-bold-duotone"
                                style={{ color: 'var(--mui-palette-primary-main)' }}
                            />
                            <Typography variant="subtitle2" fontWeight="medium">
                                Langue
                            </Typography>
                        </Box>
                        {isLoadingLanguages ? (
                            <Box display="flex" justifyContent="center" my={2}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : languagesError ? (
                            <Typography color="error" variant="body2">
                                Impossible de charger les langues
                            </Typography>
                        ) : (
                            <FormGroup>
                                {/* Option for all languages */}
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.language.length === 0}
                                            onChange={() => handleLanguageSelectionChange('all')}
                                            name="all"
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2">Toutes les langues</Typography>
                                        </Box>
                                    }
                                />

                                {/* Map over actual languages from API */}
                                {activeLanguages && activeLanguages.map(lang => (
                                    <FormControlLabel
                                        key={lang.code}
                                        control={
                                            <Checkbox
                                                checked={filters.language.includes(lang.code)}
                                                onChange={() => handleLanguageSelectionChange(lang.code)}
                                                name={lang.code}
                                                size="small"
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2">
                                                    {lang.name || lang.native_name || lang.code}
                                                    {lang.is_default && " (Default)"}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                ))}

                                {/* Fallback if no languages are returned from API */}
                                {(!activeLanguages || activeLanguages.length === 0) && (
                                    <>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={filters.language.includes('en')}
                                                    onChange={() => handleLanguageSelectionChange('en')}
                                                    name="en"
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2">Anglais</Typography>
                                                </Box>
                                            }
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={filters.language.includes('fr')}
                                                    onChange={() => handleLanguageSelectionChange('fr')}
                                                    name="fr"
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2">Français</Typography>
                                                </Box>
                                            }
                                        />
                                    </>
                                )}
                            </FormGroup>
                        )}
                    </Box>


                    {/* Deadline Filter */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1.5,
                            gap: 1
                        }}>
                            <i className="solar-calendar-mark-bold-duotone"
                                style={{ color: 'var(--mui-palette-primary-main)' }}
                            />
                            <Typography variant="subtitle2" fontWeight="medium">
                                Échéance
                            </Typography>
                        </Box>
                        <FormControl>
                            <RadioGroup
                                aria-labelledby="deadline-filter-group"
                                value={filters.deadline}
                                onChange={handleDeadlineChange}
                                name="deadline-group"
                            >
                                <FormControlLabel value="all" control={<Radio size='small' />} label="Toutes les échéances" />
                                <FormControlLabel value="this_week" control={<Radio size='small' />} label="Cette semaine" />
                                <FormControlLabel value="this_month" control={<Radio size='small' />} label="Ce mois" />
                                <FormControlLabel value="this_year" control={<Radio size='small' />} label="Cette année" />
                                <FormControlLabel value="expired" control={<Radio size='small' />} label="Expiré" />
                                <FormControlLabel value="no_deadline" control={<Radio size='small' />} label="Sans échéance" />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    {/* Duration */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1.5,
                            gap: 1
                        }}>
                            <i className="solar-clock-circle-bold-duotone"
                                style={{ color: 'var(--mui-palette-primary-main)' }}
                            />
                            <Typography variant="subtitle2" fontWeight="medium">
                                Durée
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                            <TextField
                                label="Min"
                                size="small"
                                placeholder="1h"
                                value={filters.duration.min || ''}
                                onChange={(e) => {
                                    // Allow any input but filter invalid characters
                                    const val = e.target.value.replace(/[^0-9hm]/g, '');
                                    onDurationChange('min', val);
                                }}
                                onBlur={(e) => validateDuration('min', e.target.value)}
                                error={durationError.min}
                                helperText={durationError.min ? "Format: 30m, 1h" : "Ex: 30m, 1h"}
                                InputProps={{
                                    inputProps: {
                                        pattern: "[0-9]+[hm]"
                                    }
                                }}
                                sx={{
                                    minWidth: 95
                                }}
                            />
                            <Typography variant="body2">à</Typography>
                            <TextField
                                label="Max"
                                size="small"
                                placeholder="10h"
                                value={filters.duration.max || ''}
                                onChange={(e) => {
                                    // Allow any input but filter invalid characters
                                    const val = e.target.value.replace(/[^0-9hm]/g, '');
                                    onDurationChange('max', val);
                                }}
                                onBlur={(e) => validateDuration('max', e.target.value)}
                                error={durationError.max}
                                helperText={durationError.max ? "Format: 30m, 1h" : "Ex: 5h, 120m"}
                                InputProps={{
                                    inputProps: {
                                        pattern: "[0-9]+[hm]"
                                    }
                                }}
                                sx={{
                                    minWidth: 95
                                }}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Apply Filters Button - Mobile Only */}
                <Button
                    variant="contained"
                    fullWidth
                    sx={{
                        mt: 2,
                        display: { xs: 'block', sm: 'none' }
                    }}
                    onClick={toggleFilters}
                >
                    Appliquer les filtres ({filteredCoursesCount})
                </Button>
            </Box>
        </Box>
    );
};

export default FilterSidebar;