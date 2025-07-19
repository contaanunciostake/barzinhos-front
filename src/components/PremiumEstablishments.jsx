import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Phone, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Carousel from './Carousel';
import { establishmentService } from '../lib/api';

const PremiumEstablishments = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['establishments', 'top-rated'],
    queryFn: () => establishmentService.getAll({
      approved_only: 'true',
      sort_by: 'rating',
      limit: 10
    }),
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Melhores Avaliados</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.establishments?.length) {
    return null;
  }

  const topRatedEstablishments = data.establishments.filter(est => est.average_rating >= 4.0);

  if (topRatedEstablishments.length === 0) {
    return null;
  }

  const breakpoints = {
    320: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    768: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: 3,
      spaceBetween: 30,
    },
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">Melhores Avaliados</h2>
        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          TOP RATED
        </span>
      </div>
      
      <div className="relative overflow-hidden">
        <Carousel
          slidesPerView={3}
          spaceBetween={30}
          navigation={true}
          pagination={false}
          breakpoints={breakpoints}
          className="premium-establishments-carousel"
        >
        {topRatedEstablishments.map((establishment, index) => {
          const primaryImage = establishment.images?.find(img => img.is_primary) || establishment.images?.[0];
          
          return (
            <div key={establishment.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-yellow-200 h-full flex flex-col">
              <div className="relative">
                {primaryImage ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL || 'https://barzinhos-api.onrender.com'}/static/images/establishments/${primaryImage.filename}`}
                    alt={establishment.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  #{index + 1}
                </div>
                
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 text-gray-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  {establishment.average_rating.toFixed(1)}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg mb-2 text-gray-800 truncate">
                  {establishment.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                  {establishment.description || 'Sem descrição disponível'}
                </p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(establishment.average_rating)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {establishment.average_rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({establishment.total_reviews} avaliações)
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 truncate">
                      {establishment.neighborhood && `${establishment.neighborhood}, `}
                      {establishment.city}
                    </span>
                  </div>
                  
                  {establishment.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {establishment.phone}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Características */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {establishment.faixa_etaria === 'Livre' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                      L
                    </span>
                  )}
                  {establishment.faixa_etaria && establishment.faixa_etaria !== 'Livre' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-700 border border-gray-200">
                      {establishment.faixa_etaria}
                    </span>
                  )}
                  {establishment.pet_friendly && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
                      Pet Friendly
                    </span>
                  )}
                  {establishment.lgbt_friendly && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200">
                      LGBT+ Friendly
                    </span>
                  )}
                  {establishment.delivery && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                      Delivery
                    </span>
                  )}
                </div>
                
                <Link to={`/establishment/${establishment.id}`} className="mt-auto">
                  <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105">
                    Ver Detalhes
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </Carousel>
      </div>
    </div>
  );
};

export default PremiumEstablishments;

