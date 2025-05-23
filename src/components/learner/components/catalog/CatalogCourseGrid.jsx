import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import MoocCard from '@/components/learner/components/Cards/MoocCard';
import Slider from '@/components/Slider';

/**
 * CatalogCourseGrid component - displays courses grouped by catalogs using Slider for navigation
 * 
 * @param {Object} props
 * @param {Array} props.catalogs - List of catalog objects with courses
 * @param {boolean} props.isLoading - Whether the courses are loading
 * @param {boolean} props.filtersOpen - Whether the filters sidebar is open
 * @param {Function} props.onEnroll - Function to handle enrollment
 * @param {Array} props.enrolledCourseIds - Array of course IDs the user is already enrolled in
 * @returns {JSX.Element}
 */
const CatalogCourseGrid = ({
    catalogs = [],
    isLoading,
    filtersOpen,
    onEnroll,
    enrolledCourseIds = []
}) => {
    // Count total courses across all catalogs
    const totalCourses = React.useMemo(() => {
        return catalogs.reduce((count, catalog) => {
            return count + (catalog.data?.sub_items?.length || 0);
        }, 0);
    }, [catalogs]);

    // Calculate responsive slides per view
    const getSlidesPerView = (isSidebarOpen) => ({
        base: 1,
        sm: 2,
        md: isSidebarOpen ? 2 : 3,
        lg: isSidebarOpen ? 3 : 4,
        xl: isSidebarOpen ? 4 : 6
    });

    return (
        <>
            {/* Item Count */}
            <Typography variant="body2" sx={{ mb: 3 }}>
                {totalCourses} courses available for enrollment
            </Typography>

            {isLoading ? (
                // Loading skeleton
                <>
                    {Array(2).fill(0).map((_, catalogIndex) => (
                        <Box key={`catalog-skeleton-${catalogIndex}`} sx={{ mb: 6 }}>
                            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
                            <Box sx={{ height: '320px', width: '100%' }}>
                                <Skeleton variant="rectangular" height="100%" width="100%" sx={{ borderRadius: 1 }} />
                            </Box>
                        </Box>
                    ))}
                </>
            ) : catalogs.length > 0 ? (
                // Catalogs and courses with Slider
                <>
                    {catalogs.map((catalog) => {
                        const courses = catalog.data.sub_items || [];

                        // Skip rendering if no courses
                        if (courses.length === 0) return null;

                        // Create slides for the slider
                        const slides = courses.map(course => {
                            const isEnrolled = enrolledCourseIds.includes(course.item_id);
                            const isNew = course.is_new === true;

                            return (
                                <Box key={course.item_id} sx={{
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '10px',
                                    width: '100%'
                                }}>
                                    <MoocCard
                                        id={course.item_id}
                                        Type={course.course_type === 'elearning' ? 'E-learning' : course.course_type}
                                        Title={course.item_name}
                                        Language={course.item_language_code}
                                        image={course.item_thumbnail || '/images/books/2.png'}
                                        showEnrollButton={true}
                                        onEnroll={onEnroll}
                                        isEnrollable={course.item_can_enroll === '2'} // Assume '2' means can enroll
                                        enrollmentStatus={isEnrolled ? "enrolled" : "not-enrolled"}
                                        isNew={isNew}
                                        status={null} // We'll handle status differently
                                        price={course.item_price === "0" ? "FREE" : course.item_price}
                                        isUserEnrolled={isEnrolled}
                                    />
                                </Box>
                            );
                        });

                        return (
                            <Box key={catalog.extra_data.id} sx={{ mb: 6 }}>
                                {/* Category header */}
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2
                                }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight={600}>
                                            {catalog.extra_data.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {catalog.extra_data.description?.replace(/<\/?p>/g, '') || 'IDEO'}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Course slider */}
                                <Box sx={{
                                    position: 'relative',
                                    height: '350px',
                                    overflow: 'hidden',
                                    zIndex: 1
                                }}>
                                    <Slider
                                        key={`${catalog.extra_data.id}-${filtersOpen}`}
                                        slides={slides}
                                        navigation={true}
                                        slidesPerView={getSlidesPerView(filtersOpen)}
                                        spaceBetween={3}
                                        sx={{
                                            height: '100%',
                                            '& .swiper': {
                                                paddingTop: '10px',
                                                paddingBottom: '60px'
                                            },
                                            '& .swiper-slide': {
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }
                                        }}
                                        navigationOptions={{
                                            color: '#c5262c',
                                            buttonsBgColor: 'white',
                                            buttonsShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                            buttonsRadius: '8px',
                                            size: '36px',
                                            visibleOnlyOnHover: true,
                                            buttonsPosition: {
                                                top: '45%',
                                                transform: 'translateY(-50%)'
                                            },
                                            zIndex: 5
                                        }}
                                    />
                                </Box>
                            </Box>
                        );
                    })}
                </>
            ) : (
                // No results
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 10
                }}>
                    <i className="solar-magnifier-broken" style={{ fontSize: '3rem', color: 'text.disabled', marginBottom: '1rem' }} />
                    <Typography variant="h6" color="text.secondary">
                        No courses found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters or search query
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default CatalogCourseGrid;