import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import MoocCard from '@/components/learner/components/Cards/MoocCard';

/**
 * CourseGrid component - displays a grid of courses with loading and empty states
 * 
 * @param {Object} props
 * @param {Array} props.courses - List of course objects to display
 * @param {boolean} props.isLoading - Whether the courses are loading
 * @param {boolean} props.filtersOpen - Whether the filters sidebar is open
 * @returns {JSX.Element}
 */
const CourseGrid = ({ courses, isLoading, filtersOpen }) => {
  return (
    <>
      {/* Item Count */}
      <Typography variant="body2" sx={{ mb: 3 }}>
        {courses.length} items
      </Typography>

      {/* Courses Grid */}
      <Grid container rowSpacing={5} columnSpacing={4}>
        {isLoading ? (
          // Loading skeleton
          Array(8).fill(0).map((_, index) => (
            <Grid item size={{
              xs: 12,
              sm: 6,
              md: filtersOpen ? 6 : 3,
              lg: filtersOpen ? 3 : 2,
              xl: filtersOpen ? 3 : 2
            }} key={`skeleton-${index}`}>
              <Skeleton variant="rectangular" height={320} width="100%" sx={{ borderRadius: 1 }} />
            </Grid>
          ))
        ) : courses.length > 0 ? (
          // Course cards
          courses.map((course) => (
            <Grid item
              size={{
                xs: 12,
                sm: 6,
                md: filtersOpen ? 6 : 3,
                lg: filtersOpen ? 3 : 2,
                xl: filtersOpen ? 3 : 2
              }}
              key={course.id}
            >
              <MoocCard
                id={course.id}
                Type={course.type === 'ELEARNING' ? 'E-learning' : course.type}
                Title={course.name}
                Language={course.language.toUpperCase()}
                image={course.image || '/images/books/2.png'}
                status={course.status === 'enrolled' ? 'Non débuté' :
                  course.status === 'in_progress' ? 'En cours' :
                    'Terminé'} // Map status values
                formatted_duration={course.formatted_duration}
                courseCount={course.courseCount || 12}
                Initiated={course.Initiated}
              />
            </Grid>
          ))
        ) : (
          // No results
          <Grid item size={{ xs: 12 }}>
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
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default CourseGrid;