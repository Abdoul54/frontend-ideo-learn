import { NextResponse } from 'next/server';

export async function GET() {
  // Example data - replace with your actual API call
  const mockNews = [
    {
      id: 1,
      title: 'Nouvelle formation disponible',
      description: 'Une nouvelle formation sur le développement web est maintenant disponible. Découvrez les dernières technologies et améliorez vos compétences.',
      href_text: 'En savoir plus',
      href_link: '/learner/news/1'
    },
    {
      id: 2,
      title: 'Événement à venir',
      description: 'Ne manquez pas notre prochain webinaire sur l\'intelligence artificielle. Inscrivez-vous dès maintenant pour réserver votre place.',
      href_text: 'S\'inscrire',
      href_link: '/learner/news/2'
    },
    {
      id: 3,
      title: 'Mise à jour de la plateforme',
      description: 'Nous avons amélioré notre plateforme avec de nouvelles fonctionnalités pour une meilleure expérience d\'apprentissage.',
      href_text: 'Découvrir',
      href_link: '/learner/news/3'
    }
  ];

  return NextResponse.json({
    success: true,
    data: mockNews
  });
}