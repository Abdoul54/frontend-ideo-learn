import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        console.log('checkeing Data:', { username, password });
        
        const response = await fetch('https://localhsot/central/auth/v1/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        console.log('checkeing Data:', data);
        
        if (!response.ok) {
            return NextResponse.json({ ...data });
        }

        return NextResponse.json({ ...data });
    } catch (error) {
        console.log('checkeing error:', error);
        
        return NextResponse.json({ success: false, message: error || 'An error occurred' });
    }
}