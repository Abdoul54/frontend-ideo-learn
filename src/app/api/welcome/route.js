import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Mock data - replace with actual data fetching logic when backend is ready
        const welcomeData = {
            data: [
                {
                    id: 1,
                    title: "Bienvenue sur la plateforme",
                    text: `
                    <p>Nous proposons, en libre parcours en ligne ouverts à destination de tous les citoyens, des modules sur les thématiques environnementales :</p>
                    <ul>
                        <li>Finance Climat</li>
                        <li>Bilan Carbone</li>
                    </ul>
                    <p>Ces modules sont gratuits, ils vous permettent de vous certifier et vous pouvez y accéder n'importe où et à n'importe quelle heure. Les MOOC sont disponibles sur ordinateur, tablette, mobile, et vous pouvez les suivre à votre rythme.</p>
                    `
                }
            ]
        };

        return NextResponse.json(welcomeData);
    } catch (error) {
        console.error('Welcome API Error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch welcome data' },
            { status: 500 }
        );
    }
}