import { NextResponse } from 'next/server';

export async function GET(request) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Example SMTP data
    const smtpConfigs = [
        {
            id: 1,
            smtpServer: 'smtp.example.com',
            port: 587,
            username: 'user@example.com',
            password: 'password',
            sslEnabled: true,
        },
        {
            id: 2,
            smtpServer: 'smtp.anotherexample.com',
            port: 465,
            username: 'user2@example.com',
            password: 'password2',
            sslEnabled: false,
        },
        {
            id: 3,
            smtpServer: 'smtp.thirdexample.com',
            port: 2525,
            username: 'user3@example.com',
            password: 'password3',
            sslEnabled: true,
        },
        {
            id: 4,
            smtpServer: 'smtp.fourthexample.com',
            port: 25,
            username: 'user4@example.com',
            password: 'password4',
            sslEnabled: false,
        }
    ];

    return NextResponse.json(smtpConfigs);
}