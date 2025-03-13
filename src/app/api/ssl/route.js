import { NextResponse } from 'next/server';

export async function GET(request) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Example SSL data
    const sslConfigs = [
        {
            id: 1,
            name: 'SSL Config 1',
            certificateAuthority: 'Let\'s Encrypt',
            validFrom: '2023-01-01',
            validTo: '2024-01-01',
            status: 'Active',
            AssignedDomains: 'example.com',
        },
        {
            id: 2,
            name: 'SSL Config 2',
            certificateAuthority: 'DigiCert',
            validFrom: '2023-02-01',
            validTo: '2024-02-01',
            status: 'Expired',
            AssignedDomains: 'anotherexample.com',
        },
        {
            id: 3,
            name: 'SSL Config 3',
            certificateAuthority: 'GoDaddy',
            validFrom: '2023-03-01',
            validTo: '2024-03-01',
            status: 'Active',
            AssignedDomains: 'yetanotherexample.com',
        },
        {
            id: 4,
            name: 'SSL Config 4',
            certificateAuthority: 'GlobalSign',
            validFrom: '2023-04-01',
            validTo: '2024-04-01',
            status: 'Active',
            AssignedDomains: 'newexample.com',
        },
        {
            id: 5,
            name: 'SSL Config 5',
            certificateAuthority: 'Comodo',
            validFrom: '2023-05-01',
            validTo: '2024-05-01',
            status: 'Revoked',
            AssignedDomains: 'anothernewexample.com',
        }
    ];

    return NextResponse.json(sslConfigs);
}