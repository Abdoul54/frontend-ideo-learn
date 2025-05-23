import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Mock data - replace with actual data fetching logic when backend is ready
        const statsData = {
            data: {
                total_time: 231, // in minutes
                progress_percentage: 28, // as a percentage
                courses_completed: 3,
                courses_in_progress: 5,
                total_courses: 15
            }
        };

        return NextResponse.json(statsData);
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch stats data' },
            { status: 500 }
        );
    }
}