import { NextResponse } from 'next/server';

export async function GET(request) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Example custom domain data
    const customDomains = [
        {
            id: 1,
            domainName: 'elearning.ideo.ma',
            status: 'Active',
            assignedTo: 'User 1',
            expirationDate: '2024-12-31',
        },
        {
            id: 2,
            domainName: 'anotherexample.com',
            status: 'Pending',
            assignedTo: 'User 2',
            expirationDate: '2025-01-01',
        },
        {
            id: 3,
            domainName: 'yetanotherexample.com',
            status: 'Expired',
            assignedTo: 'User 3',
            expirationDate: '2023-12-31',
        },
    ];

    return NextResponse.json(customDomains);
}