import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Mock data - replace with actual data fetching logic when backend is ready
        const booksData = {
            produits: [
                {
                    id: 1,
                    title: "Le guide complet de la finance climat",
                    author: "Jean Dupont",
                    thumbnail_urls: "/images/books/finance-climat-book.jpg",
                    product_num: "12345"
                },
                {
                    id: 2,
                    title: "Bilan carbone pour les entreprises",
                    author: "Marie Lambert",
                    thumbnail_urls: "/images/books/carbon-footprint-book.jpg",
                    product_num: "12346"
                },
                {
                    id: 3,
                    title: "Changement climatique et économie",
                    author: "Pierre Martin",
                    thumbnail_urls: "/images/books/climate-change-economy.jpg",
                    product_num: "12347"
                },
                {
                    id: 4,
                    title: "Le développement durable expliqué",
                    author: "Sophie Leclerc",
                    thumbnail_urls: "/images/books/sustainable-development.jpg",
                    product_num: "12348"
                },
                {
                    id: 5,
                    title: "Guide de la biodiversité",
                    author: "Marc Dubois",
                    thumbnail_urls: "/images/books/biodiversity-guide.jpg",
                    product_num: "12349"
                },
                {
                    id: 6,
                    title: "Énergie renouvelable: perspectives et défis",
                    author: "Claire Moreau",
                    thumbnail_urls: "/images/books/renewable-energy.jpg",
                    product_num: "12350"
                }
            ]
        };

        return NextResponse.json(booksData);
    } catch (error) {
        console.error('Books API Error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch books data' },
            { status: 500 }
        );
    }
}