'use client';
import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
} from '@mui/material';
import SearchAndSortBar from '@/components/learner/components/mycourses/SearchAndSortBar';
import FilterSidebar from '@/components/learner/components/mycourses/FilterSidebar';
import CourseGrid from '@/components/learner/components/mycourses/CourseGrid';
import { useMyCourses } from '@/hooks/api/tenant/learn/course/useCourse';

export default function MesFormationsPage() {
    // Search and sort state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('newest_to_oldest');

    // Mapping for sort options to API parameters
    const sortMapping = {
        'newest_to_oldest': { attr: 'enrollment_date', dir: 'desc' },
        'oldest_to_newest': { attr: 'enrollment_date', dir: 'asc' },
        'name_az': { attr: 'name', dir: 'asc' },
        'name_za': { attr: 'name', dir: 'desc' },
        'code_az': { attr: 'code', dir: 'asc' },
        'code_za': { attr: 'code', dir: 'desc' },
        'nearest_expiration': { attr: 'expiration_date', dir: 'asc' },
        'farthest_expiration': { attr: 'expiration_date', dir: 'desc' },
    };

    // Filter states
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: {
            notStarted: false,
            inProgress: false,
            completed: false
        },
        type: {
            eLearning: false,
            classroom: false,
            learningPlan: false
        },
        language: [],
        deadline: 'all',
        duration: {
            min: null,
            max: null
        }
    });

    // Derived filter values for API
    const apiFilters = {
        status: Object.entries(filters.status)
            .filter(([_, value]) => value)
            .map(([key, _]) => {
                // Map UI filter keys to API status values
                switch (key) {
                    case 'notStarted': return 'enrolled';
                    case 'inProgress': return 'in_progress';
                    case 'completed': return 'completed';
                    default: return '';
                }
            })
            .filter(status => status !== ''),

        type: Object.entries(filters.type)
            .filter(([_, value]) => value)
            .map(([key, _]) => {
                // Map UI filter keys to API type values
                switch (key) {
                    case 'eLearning': return 'ELEARNING';
                    case 'classroom': return 'CLASSROOM';
                    case 'learningPlan': return 'LEARNINGPLAN';
                    default: return '';
                }
            })
            .filter(type => type !== ''),

        language: filters.language,
        // Only pass deadline if it's not 'all'
        deadline: filters.deadline !== 'all' ? filters.deadline : undefined,
        // Pass duration filters if they exist
        duration_min: filters.duration.min || undefined,
        duration_max: filters.duration.max || undefined
    };

    // Query the API using our custom hook
    const {
        data: coursesData,
        isLoading,
        error
    } = useMyCourses({
        search_text: searchQuery,
        sort_attr: sortMapping[sortOption]?.attr || 'enrollment_date',
        sort_dir: sortMapping[sortOption]?.dir || 'desc',
        status: apiFilters.status,
        type: apiFilters.type,
        language: apiFilters.language,
        deadline: apiFilters.deadline,
        duration_min: apiFilters.duration_min,
        duration_max: apiFilters.duration_max
    });

    // Filter toggle handler
    const toggleFilters = () => {
        setFiltersOpen(!filtersOpen);
    };

    // Filter change handlers
    const handleStatusChange = (event) => {
        setFilters({
            ...filters,
            status: {
                ...filters.status,
                [event.target.name]: event.target.checked
            }
        });
    };

    const handleTypeChange = (event) => {
        setFilters({
            ...filters,
            type: {
                ...filters.type,
                [event.target.name]: event.target.checked
            }
        });
    };

    const handleLanguageChange = (event) => {
        // The event.target.value will now be an array of language codes
        setFilters({
            ...filters,
            language: event.target.value
        });
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const handleDeadlineChange = (event) => {
        setFilters({
            ...filters,
            deadline: event.target.value
        });
    };

    const handleDurationChange = (min, max) => {
        setFilters({
            ...filters,
            duration: {
                min: min || null,
                max: max || null
            }
        });
    };

    const clearFilters = () => {
        setFilters({
            status: {
                notStarted: false,
                inProgress: false,
                completed: false
            },
            type: {
                eLearning: false,
                classroom: false,
                learningPlan: false
            },
            language: [],
            deadline: 'all',
            duration: {
                min: null,
                max: null
            }
        });
        setSearchQuery('');
    };

    const activeFilterCount =
        Object.values(filters.status).filter(Boolean).length +
        Object.values(filters.type).filter(Boolean).length +
        (filters.language.length > 0 ? 1 : 0) +
        (filters.deadline !== 'all' ? 1 : 0) +
        ((filters.duration.min || filters.duration.max) ? 1 : 0);

    const isFilterActive = activeFilterCount > 0;

    // Extract courses from API response
    const courses = coursesData?.items || [];

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                    Mes Formations
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Parcourez et accédez à toutes vos formations en un seul endroit
                </Typography>

                {/* Search and Sort Bar */}
                <SearchAndSortBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortOption={sortOption}
                    handleSortChange={handleSortChange}
                    toggleFilters={toggleFilters}
                    isFilterActive={isFilterActive}
                    activeFilterCount={activeFilterCount}
                />

                <Box sx={{
                    display: 'flex',
                    position: 'relative',
                }}>
                    {/* Filters Panel */}
                    <FilterSidebar
                        filtersOpen={filtersOpen}
                        toggleFilters={toggleFilters}
                        filters={filters}
                        handleStatusChange={handleStatusChange}
                        handleTypeChange={handleTypeChange}
                        handleLanguageChange={handleLanguageChange}
                        handleDeadlineChange={handleDeadlineChange}
                        handleDurationChange={handleDurationChange}
                        clearFilters={clearFilters}
                        activeFilterCount={activeFilterCount}
                        filteredCoursesCount={courses.length}
                    />

                    {/* Item Count and Courses Grid */}
                    <Box sx={{
                        flexGrow: 1,
                        width: filtersOpen ? { xs: '0%', sm: 'calc(100% - 300px - 24px)' } : '100%',
                        transition: 'width 0.3s ease-in-out',
                        visibility: { xs: filtersOpen ? 'hidden' : 'visible', sm: 'visible' },
                    }}>
                        <CourseGrid
                            courses={courses}
                            isLoading={isLoading}
                            error={error}
                            filtersOpen={filtersOpen}
                        />
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}