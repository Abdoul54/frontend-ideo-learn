import { NextResponse } from 'next/server';

export async function GET(request) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Example tenant data
    const tenants = [
        {
            id: 1,
            tenantName: 'Tenant 1',
            email: 'tenant1@example.com',
            status: 'Active',
            createdAt: '2025-01-20',
            domains: [{
                domain: 'example.com',
                ssl_expires_at: '2025-06-20'
            }],
            total_users: 100
        },
        {
            id: 2,
            tenantName: 'Tenant 2',
            email: 'tenant2@example.com',
            status: 'Pending',
            createdAt: '2025-01-18',
            domains: [{
                domain: 'example.com',
                ssl_expires_at: '2025-01-20'
            }],
            total_users: 150
        },
        {
            id: 3,
            tenantName: 'Tenant 3',
            email: 'tenant3@example.com',
            status: 'Inactive',
            createdAt: '2025-01-24',
            domains: [{
                domain: 'example.com',
                ssl_expires_at: '2025-01-29'
            }],
            total_users: 20
        },
    ];

    return NextResponse.json(tenants);
}