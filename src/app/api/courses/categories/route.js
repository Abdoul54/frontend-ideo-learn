import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Mock data - replace with actual data fetching logic
        const categoriesData = {
            data: {
                items: [
                    {
                        id: 1,
                        code: "Modules transverses",
                        title: "Modules transverses",
                        courses: [
                            {
                                id: 101,
                                title: "Introduction aux finances climat",
                                thumbnail: "/images/moocs/course1.jpeg",
                                enrollement_status: "Non débuté",
                                lang_code: "FR",
                                type: "E-learning"
                            },
                            {
                                id: 102,
                                title: "Mécanismes de financement climatique",
                                thumbnail: "/images/books/2.png",
                                enrollement_status: "En cours",
                                lang_code: "FR",
                                type: "E-learning"
                            },
                            {
                                id: 103,
                                title: "Investissement durable et ESG",
                                thumbnail: "/images/moocs/course2.jpeg",
                                enrollement_status: "Non débuté",
                                lang_code: "FR",
                                type: "E-learning"
                            },
                            {
                                id: 104,
                                title: "Finance carbone et marchés",
                                thumbnail: "/images/books/5.png",
                                enrollement_status: "Non débuté",
                                lang_code: "FR",
                                type: "ILT"
                            },
                            {
                                id: 105,
                                title: "Stratégies d'investissement climat",
                                thumbnail: "/images/moocs/course3.jpeg",
                                enrollement_status: "Non débuté",
                                lang_code: "FR",
                                type: "ILT"
                            },
                            {
                                id: 106,
                                title: "Analyse de risque climatique",
                                thumbnail: "/images/moocs/course4.jpeg",
                                enrollement_status: "Non débuté",
                                lang_code: "FR",
                                type: "E-learning"
                            }
                        ]
                    },
                    {
                        id: 2,
                        code: "Soft Skills",
                        title: "Soft Skills",
                        courses: [
                            {
                                id: 201,
                                title: "Comprendre le CO2 et l'effet de serre",
                                thumbnail: "/images/moocs/course5.jpeg",
                                enrollement_status: "Terminé",
                                lang_code: "FR",
                                type: "ILT"
                            },
                            {
                                id: 202,
                                title: "Méthodologie du bilan carbone",
                                thumbnail: "/images/moocs/course6.jpeg",
                                enrollement_status: "En cours",
                                lang_code: "FR",
                                type: "E-learning"
                            },
                            {
                                id: 203,
                                title: "Réduction de l'empreinte carbone",
                                thumbnail: "/images/moocs/course7.jpeg",
                                enrollement_status: "Non débuté",
                                lang_code: "FR",
                                type: "E-learning"
                            }
                        ]
                    }
                ],
                pagination: {
                    total: 2,
                    current_page: 1,
                    per_page: 10
                }
            }
        };

        return NextResponse.json(categoriesData);
    } catch (error) {
        console.error('Categories API Error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch categories data' },
            { status: 500 }
        );
    }
}