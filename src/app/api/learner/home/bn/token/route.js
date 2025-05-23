import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Mock token - replace with actual token generation logic
        const tokenData = {
            token: "mock-youscribe-auth-token-123456789"
        };

        return NextResponse.json(tokenData);
    } catch (error) {
        console.error('Token API Error:', error);
        return NextResponse.json(
            { message: 'Failed to generate token' },
            { status: 500 }
        );
    }
}