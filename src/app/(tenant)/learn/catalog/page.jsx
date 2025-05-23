'use client';
import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Alert,
    Snackbar
} from '@mui/material';
import SearchAndSortBar from '@/components/learner/components/mycourses/SearchAndSortBar';
import FilterSidebar from '@/components/learner/components/mycourses/FilterSidebar';
import CatalogCourseGrid from '@/components/learner/components/catalog/CatalogCourseGrid';
import courseCatalogApi from './../../../../../src/constants/courseCatalog';
import { toast } from 'react-hot-toast';

export default function CourseCatalogPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [catalogs, setCatalogs] = useState([]);
    const [filteredCatalogs, setFilteredCatalogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

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
            ilt: false,
            learningPlan: false
        },
        language: 'all'
    });

    const [sortOption, setSortOption] = useState('newest');
    const [enrollmentInProgress, setEnrollmentInProgress] = useState(false);

    // Fetch course catalog when component mounts
    useEffect(() => {
        const fetchCatalog = async () => {
            setIsLoading(true);

            try {
                const catalogData = await courseCatalogApi.fetchCourseCatalog();
                setCatalogs(catalogData.items || []);
                setFilteredCatalogs(catalogData.items || []);

                // Extract enrolled course IDs
                const enrolledIds = [];
                catalogData.items.forEach(catalog => {
                    catalog.data.sub_items.forEach(course => {
                        if (course.is_user_enrolled === "1") {
                            enrolledIds.push(course.item_id);
                        }
                    });
                });
                setEnrolledCourseIds(enrolledIds);
            } catch (error) {
                console.error('Error fetching course catalog:', error);
                toast.error("Failed to load course catalog. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCatalog();
    }, []);

    // Function to handle course enrollment
    const handleEnroll = async (courseId) => {
        if (enrollmentInProgress) return;

        try {
            setEnrollmentInProgress(true);

            await courseCatalogApi.enrollInCourse(courseId);

            // Update enrolled courses list
            setEnrolledCourseIds(prev => [...prev, courseId]);

        } catch (error) {
            console.error('Enrollment error:', error);
            // Toast is already shown in the API function
        } finally {
            setEnrollmentInProgress(false);
        }
    };

    // Apply filters and search
    useEffect(() => {
        if (!catalogs.length) return;

        // Create a deep copy of catalogs to filter
        const catalogsCopy = JSON.parse(JSON.stringify(catalogs));

        // Filter courses within each catalog based on search and filters
        const filtered = catalogsCopy.map(catalog => {
            // Start with a copy of the catalog
            const catalogCopy = { ...catalog };

            // Filter the sub_items (courses)
            catalogCopy.data.sub_items = catalog.data.sub_items.filter(course => {
                // Apply search filter
                if (searchQuery && !course.item_name.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                }

                // Apply language filter
                if (filters.language !== 'all' && course.item_language_code !== filters.language) {
                    return false;
                }

                // Apply type filters if any are selected
                const typeFiltersActive = filters.type.eLearning || filters.type.ilt || filters.type.learningPlan;
                if (typeFiltersActive) {
                    const courseType = course.course_type.toLowerCase();

                    if (filters.type.eLearning && courseType === 'elearning') return true;
                    if (filters.type.ilt && courseType === 'ilt') return true;
                    if (filters.type.learningPlan && courseType === 'learning plan') return true;

                    return false;
                }

                return true;
            });

            // Apply sorting to the courses
            catalogCopy.data.sub_items.sort((a, b) => {
                if (sortOption === 'newest') {
                    return new Date(b.item_create_date) - new Date(a.item_create_date);
                } else if (sortOption === 'oldest') {
                    return new Date(a.item_create_date) - new Date(b.item_create_date);
                } else if (sortOption === 'alphabetical') {
                    return a.item_name.localeCompare(b.item_name);
                }
                return 0;
            });

            return catalogCopy;
        });

        // Remove catalogs with no matching courses
        const nonEmptyCatalogs = filtered.filter(catalog => catalog.data.sub_items.length > 0);

        setFilteredCatalogs(nonEmptyCatalogs);
    }, [searchQuery, filters, catalogs, sortOption]);

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
        setFilters({
            ...filters,
            language: event.target.value
        });
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
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
                ilt: false,
                learningPlan: false
            },
            language: 'all'
        });
        setSearchQuery('');
    };

    const activeFilterCount = Object.values(filters.type).filter(Boolean).length +
        (filters.language !== 'all' ? 1 : 0);
    const isFilterActive = activeFilterCount > 0;

    // Count total courses across all filtered catalogs
    const totalCourses = filteredCatalogs.reduce((count, catalog) => {
        return count + (catalog.data?.sub_items?.length || 0);
    }, 0);

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                    Course Catalog
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Explore and enroll in courses from our comprehensive catalog
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
                        clearFilters={clearFilters}
                        activeFilterCount={activeFilterCount}
                        filteredCoursesCount={totalCourses}
                        // Customization for catalog - hide status filters
                        hideStatusFilters={true}
                    />

                    {/* Catalogs and Courses Grid */}
                    <Box sx={{
                        flexGrow: 1,
                        width: filtersOpen ? { xs: '0%', sm: 'calc(100% - 300px - 24px)' } : '100%',
                        transition: 'width 0.3s ease-in-out',
                        visibility: { xs: filtersOpen ? 'hidden' : 'visible', sm: 'visible' },
                    }}>
                        <CatalogCourseGrid
                            catalogs={filteredCatalogs}
                            isLoading={isLoading}
                            filtersOpen={filtersOpen}
                            onEnroll={handleEnroll}
                            enrolledCourseIds={enrolledCourseIds}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Enrollment in progress indicator */}
            <Snackbar
                open={enrollmentInProgress}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="info">
                    Enrollment in progress...
                </Alert>
            </Snackbar>
        </Container>
    );
}