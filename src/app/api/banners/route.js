import { NextResponse } from 'next/server';

export async function GET(request) {
    // Example data, replace with your actual data fetching logic
    const banners = [
        { id: 1, title: 'Banner 1', imageUrl: '/images/slider/hero-banner-v1.png' },
        { id: 2, title: 'Banner 2', imageUrl: '/images/slider/hero-banner-v2.png' },
    ];

    return NextResponse.json(banners);
}