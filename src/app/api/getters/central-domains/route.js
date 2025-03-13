import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const centralDomains = process.env.MAIN_DOMAINES?.split(',');

        return NextResponse.json({ centralDomains });

    } catch (error) {
        NextResponse.json({ error: error.message }, { status: 500 });
    }

}