import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Mock data - replace with actual data fetching logic when backend is ready
        const recommendationsData = [
            {
                id: 1,
                title: "Climat, le temps d'agir",
                type: "Livre",
                image: "/images/resources/climate-book.jpg"
            },
            {
                id: 2,
                title: "La finance contre le changement climatique",
                type: "Article",
                image: "/images/resources/finance-article.jpg"
            },
            {
                id: 3,
                title: "Le climat vue de la stratosphère",
                type: "Vidéo",
                image: "/images/resources/climate-video.jpg"
            },
            {
                id: 4,
                title: "Réchauffement climatique",
                type: "Infographie",
                image: "/images/resources/climate-infographic.jpg"
            },
            {
                id: 5,
                title: "Climat Finance",
                type: "Rapport",
                image: "/images/resources/climate-report.jpg"
            },
            {
                id: 6,
                title: "Biodiver Sité",
                type: "Website",
                image: "/images/resources/biodiversity-site.jpg"
            }
        ];

        return NextResponse.json(recommendationsData);
    } catch (error) {
        console.error('Recommendations API Error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch recommendations data' },
            { status: 500 }
        );
    }
}