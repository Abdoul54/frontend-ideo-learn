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
                    thumbnail_urls: "/images/books/2.png",
                    product_num: "12345"
                },
                {
                    id: 2,
                    title: "Bilan carbone pour les entreprises",
                    author: "Marie Lambert",
                    thumbnail_urls: "/images/books/3.png",
                    product_num: "12346"
                },
                {
                    id: 3,
                    title: "Changement climatique et économie",
                    author: "Pierre Martin",
                    thumbnail_urls: "/images/books/4.png",
                    product_num: "12347"
                },
                {
                    id: 4,
                    title: "Le développement durable expliqué",
                    author: "Sophie Leclerc",
                    thumbnail_urls: "/images/books/5.png",
                    product_num: "12348"
                },
                {
                    id: 5,
                    title: "Guide de la biodiversité",
                    author: "Marc Dubois",
                    thumbnail_urls: "/images/books/book4.png",
                    product_num: "12349"
                },
                {
                    id: 6,
                    title: "Finance verte et investissements durables",
                    author: "Alice Moreau",
                    thumbnail_urls: "/images/books/book6.png",
                    product_num: "12350"
                },
                {
                    id: 7,
                    title: "Stratégies de réduction des émissions",
                    author: "Lucie Bernard",
                    thumbnail_urls: "/images/books/book5.png",
                    product_num: "12351"
                },
                {
                    id: 8,
                    title: "Nouvelles approches en finance durable",
                    author: "Émilie Rousseau",
                    thumbnail_urls: "/images/books/book2.png",
                    product_num: "12352"
                },
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