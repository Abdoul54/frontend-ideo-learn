'use client'

import React from 'react';
import { Box, Container, Typography, Card, CardContent, Stack, Divider, Paper, CardHeader, Skeleton, Tab, Chip } from '@mui/material';
//import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Grid from '@mui/material/Grid2';
import Banner from '@/components/Banner';
import dynamic from 'next/dynamic';
import theme from '@/@core/theme';
import CustomTabList from '@/@core/components/mui/TabList';
import ToolBar from '@/components/ToolBar';
import { TabContext } from '@mui/lab';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import useUrlTabs from '@/hooks/useUrlTabs';
import CourseSessionsTab from '@/views/tabs/session/CourseSessionsTab';
import LearningPlans from '@/views/tabs/LearningPlans/LearningPlans';


const AppReactApexCharts = dynamic(() => import('@/lib/styles/AppReactApexCharts'), {
    ssr: false,
    loading: () => (
        <Box sx={{ width: 200, height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Skeleton variant="circular" width={200} height={200} />
        </Box>
    )
});

// Mock data for demonstration
const mockUserData = {
    name: "John Doe",
    subscriptionDate: "Jan 15, 2023",
    lastAccessDate: "May 12, 2025",
    totalTimeHours: 87,
    activeCourses: 4,
    topCourses: [
        { title: "Advanced Machine Learning", hours: 32, image: "https://placehold.co/600x400/png", status: "Completed", description: "A deep dive into advanced ML techniques." },
        { title: "Web Development Masterclass", hours: 27, image: "https://placehold.co/600x400/png", status: "In Progress", description: "Learn the latest web development technologies." },
        { title: "Data Science Fundamentals", hours: 18, image: "https://placehold.co/600x400/png", status: "Not Started", description: "Introduction to data science concepts." }
    ]
};

// Mock data for pie chart
const mockPieData = [
    { name: 'To Begin', value: 35 },
    { name: 'In Progress', value: 21 },
    { name: 'Completed', value: 15 }
];

// Mock data for line chart
const mockLineData = [
    { month: 'Jun', hours: 12 },
    { month: 'Jul', hours: 8 },
    { month: 'Aug', hours: 15 },
    { month: 'Sep', hours: 10 },
    { month: 'Oct', hours: 7 },
    { month: 'Nov', hours: 9 },
    { month: 'Dec', hours: 5 },
    { month: 'Jan', hours: 14 },
    { month: 'Feb', hours: 11 },
    { month: 'Mar', hours: 6 },
    { month: 'Apr', hours: 13 },
    { month: 'May', hours: 9 }
];

// Colors for pie chart
const COLORS = ['#0088FE', '#FFBB28', '#00C49F'];

// Pie chart series
const deliveryExceptionsChartSeries = mockPieData.map(item => item.value);
// Pie chart options
const radialBarColors = {
    series1: 'var(--mui-palette-primary-main)',
    series2: 'var(--mui-palette-secondary-main)',
    series3: 'var(--mui-palette-success-main)',
    series4: 'var(--mui-palette-warning-main)',
    series5: 'var(--mui-palette-error-main)'
}
const textSecondary = 'var(--mui-palette-text-secondary)'
const pieOptions = {
    stroke: { lineCap: 'round' },
    labels: ['In Progress', 'Completed', 'To Begin'],
    legend: {
        show: true,
        fontSize: '13px',
        position: 'bottom',
        labels: {
            colors: textSecondary
        },
        markers: {
            offsetX: theme.direction === 'rtl' ? 7 : -4
        },
        itemMargin: {
            horizontal: 9
        }
    },
    colors: [radialBarColors.series1, radialBarColors.series2, radialBarColors.series4],
    plotOptions: {
        radialBar: {
            hollow: { size: '30%' },
            track: {
                margin: 15,
                background: 'var(--mui-palette-customColors-trackBg)'
            },
            dataLabels: {
                name: {
                    fontSize: '2rem'
                },
                value: {
                    fontSize: '15px',
                    fontWeight: 500,
                    color: textSecondary
                },
                total: {
                    show: true,
                    fontWeight: 500,
                    label: 'Total',
                    fontSize: '1.125rem',
                    color: 'var(--mui-palette-text-primary)',
                    formatter: function (w) {
                        const totalValue =
                            w.globals.seriesTotals.reduce((a, b) => {
                                return a + b
                            }, 0) / w.globals.series.length

                        if (totalValue % 1 === 0) {
                            return totalValue + '%'
                        } else {
                            return totalValue.toFixed(2) + '%'
                        }
                    }
                }
            }
        }
    },
    grid: {
        padding: {
            top: -25,
            bottom: -30
        }
    }
}

const series = [
    {
        data: [280, 200, 220, 180, 270, 250, 70, 90, 200, 150, 160, 100, 150, 100, 50]
    }
];

const divider = 'var(--mui-palette-divider)'
const disabledText = 'var(--mui-palette-text-disabled)'

// Line chart options
const lineOptions = {
    chart: {
        parentHeightOffset: 0,
        zoom: { enabled: false },
        toolbar: { show: false }
    },
    colors: ['#ff9f43'],
    stroke: { curve: 'straight' },
    dataLabels: { enabled: false },
    markers: {
        strokeWidth: 7,
        strokeOpacity: 1,
        colors: ['#ff9f43'],
        strokeColors: ['#fff']
    },
    grid: {
        padding: { top: -10 },
        borderColor: divider,
        xaxis: {
            lines: { show: true }
        }
    },
    tooltip: {
        custom(data) {
            return `<div class='bar-chart'>
          <span>${data.series[data.seriesIndex][data.dataPointIndex]}%</span>
        </div>`
        }
    },
    yaxis: {
        labels: {
            style: { colors: disabledText, fontSize: '13px' }
        }
    },
    xaxis: {
        axisBorder: { show: false },
        axisTicks: { color: divider },
        crosshairs: {
            stroke: { color: divider }
        },
        labels: {
            style: { colors: disabledText, fontSize: '13px' }
        },
        categories: [
            '7/12',
            '8/12',
            '9/12',
            '10/12',
            '11/12',
            '12/12',
            '13/12',
            '14/12',
            '15/12',
            '16/12',
            '17/12',
            '18/12',
            '19/12',
            '20/12',
            '21/12'
        ]
    }
}




export default function ActivitiesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 'courses',
        validTabs: ['courses', 'learning-plan'],
    });
    return (
        <Container maxWidth="xl">
            {/* Banner */}
            {/* <Banner
                preview={false}
                sliderData={null}
                isLoading={false}
                sx={{ mb: 4 }}
                slides={[
                    <img
                        key="banner"
                        src="https://placehold.co/1200x400/png"
                        alt="Banner"
                        style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                    />
                ]}
            /> */}

            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>My Activities</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Here you can find your activities and progress in the courses you are enrolled in, as well as your learning plan.
            </Typography>

            {/* user state */}
            <Card className='bs-full' sx={{ mb: 4, mt: 10 }}>
                <CardContent>
                    <div className='flex flex-wrap justify-between gap-4'>
                        <div className="rounded-xl p-4 flex items-center gap-4">
                            <div className="bg-red-100 p-3 pb-2 rounded-lg">
                                <i className="solar-user-check-line-duotone w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Subscription date</p>
                                <p className="text-red-600 text-2xl font-semibold">{mockUserData.subscriptionDate}</p>
                            </div>
                        </div>

                        {/* Active Tenants */}
                        <div className="rounded-xl p-4 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 pb-2 rounded-lg">
                                <i className="solar-calendar-bold w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Last access date</p>
                                <p className="text-blue-600 text-2xl font-semibold">
                                    {mockUserData.lastAccessDate}
                                </p>
                            </div>
                        </div>

                        {/* SSL Active */}
                        <div className="rounded-xl p-4 flex items-center gap-4">
                            <div className="bg-orange-100 p-3 pb-2 rounded-lg">
                                <i className="solar-clock-circle-bold w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Total time</p>
                                <p className="text-orange-600 text-2xl font-semibold">{mockUserData.totalTimeHours} hours</p>
                            </div>
                        </div>

                        {/* Active Courses */}
                        <div className="rounded-xl p-4 flex items-center gap-4">
                            <div className="bg-green-100 p-3 pb-2 rounded-lg">
                                <i className="solar-notebook-square-broken w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Active courses</p>
                                <p className="text-green-600 text-2xl font-semibold">{mockUserData.activeCourses}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>



            {/* 2 charts in one grid container one chart represent the progress of the courses percentage in a radialBar and an other chart for all activity within the last 12 months in a line chart */}
            {/* <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, mt: 4 }}>My Statistics</Typography> */}
            <Grid container spacing={3} sx={{ mb: 10, mt: 7 }}>
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Course Progress</Typography>
                            <AppReactApexCharts
                                type='radialBar'
                                height={350}
                                width='100%'
                                series={deliveryExceptionsChartSeries}
                                options={pieOptions}
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>All activity within the last 12 months</Typography>
                            <AppReactApexCharts type='line' width='100%' height={350} options={lineOptions} series={series} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Top Courses */}
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>My top 3 most viewed courses (total time)</Typography>
            {/* <Grid container spacing={3}>
                {mockUserData.topCourses.map((course, index) => (
                    <Grid item size={{ xs: 12, md: 4 }} key={index}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ height: 180, overflow: 'hidden' }}>
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Box>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>{course.title}</Typography>
                                <Typography variant="body1" color="primary" fontWeight="bold">
                                    {course.hours} hours
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {index === 0 ? 'Your most viewed course' : `Top ${index + 1} viewed course`}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid> */}

            <Grid container spacing={3}>
                {mockUserData.topCourses.map((course, index) => (
                    <Grid item size={{ xs: 12, md: 4 }} key={index}>
                        <Card
                            sx={{
                                height: '90%',
                                display: 'flex',
                                flexDirection: 'column',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: 2,
                                    cursor: 'pointer'
                                }
                            }}
                        >
                            <CardContent sx={{ padding: 3, flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', mb: 2 }}>
                                    <Box
                                        sx={{
                                            width: 90,
                                            height: 90,
                                            bgcolor: 'grey.200',
                                            borderRadius: 1,
                                            mr: 2
                                        }}
                                    />
                                    <Box>
                                        <Typography variant="h6" gutterBottom>{course.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Time: {course.hours} hours
                                        </Typography>
                                        <Chip
                                    label={course.status}
                                    color={course.status === 'Completed' ? 'success' : 'warning'}
                                    size="small"
                                    sx={{
                                        mt: 2,
                                        backgroundColor: course.status === 'Completed' ? '#d4edda' : '#fff3cd',
                                        color: course.status === 'Completed' ? '#155724' : '#856404'
                                    }}
                                />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* two tabs each tab will contain a datatale one for courses one for learning plan */}
            <Grid container spacing={4} sx={{ mt: 10 }}>
                <Grid item size={12} container component={TabContext} value={activeTab}>
                    <Grid item size={12}>
                        <CustomTabList
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTabs-flexContainer': {
                                    width: '100%'
                                }
                            }}
                        >
                            <Tab value="courses" label="Courses" />
                            <Tab value="learning-plan" label="Learning Plan" />
                        </CustomTabList>
                    </Grid>
                    <Grid item size={12}>
                        {activeTab === 'courses' && <LearningPlans />}
                        {activeTab === 'learning-plan' && <LearningPlans />}
                    </Grid>
                </Grid>
            </Grid>

        </Container>
    );
}
