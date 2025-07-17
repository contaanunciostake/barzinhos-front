import React from 'react';
import Carousel from './Carousel';

const PromoBanner = () => {
  const banners = [
    {
      id: 1,
      image: '/images/banners/banner1.jpg',
      title: 'Descubra os Melhores Sabores da Cidade',
      subtitle: 'Comida brasileira autêntica direto na sua casa',
      buttonText: 'Explorar Agora',
      buttonLink: '#establishments'
    },
    {
      id: 2,
      image: '/images/banners/banner2.jpg',
      title: 'Delivery Rápido e Seguro',
      subtitle: 'Opções saudáveis e nutritivas para o seu dia a dia',
      buttonText: 'Ver Cardápio',
      buttonLink: '#establishments'
    },
    {
      id: 3,
      image: '/images/banners/banner3.jpg',
      title: 'Promoções Especiais Todo Dia',
      subtitle: 'Descontos imperdíveis nos seus pratos favoritos',
      buttonText: 'Aproveitar Oferta',
      buttonLink: '#establishments'
    }
  ];

  return (
    <div className="w-full mb-8">
      <Carousel
        autoplay={true}
        navigation={true}
        pagination={true}
        className="promo-banner-carousel"
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative h-32 md:h-40 lg:h-48 overflow-hidden rounded-lg">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-2xl">
                <h2 className="text-lg md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">
                  {banner.title}
                </h2>
                <p className="text-xs md:text-sm lg:text-base mb-2 md:mb-3 opacity-90">
                  {banner.subtitle}
                </p>
                <a
                  href={banner.buttonLink}
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1 md:py-2 px-3 md:px-4 rounded-lg transition-colors duration-300 text-xs md:text-sm"
                >
                  {banner.buttonText}
                </a>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default PromoBanner;

