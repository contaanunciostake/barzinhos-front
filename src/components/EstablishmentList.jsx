import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Globe, Instagram, MessageCircle } from 'lucide-react';
import { establishmentService } from '../lib/api';
import PromoBanner from './PromoBanner';
import PremiumEstablishments from './PremiumEstablishments';

const EstablishmentCard = ({ establishment }) => {
  const primaryImage = establishment.images?.find(img => img.is_primary) || establishment.images?.[0];
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative">
        {primaryImage ? (
          <img
            src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/static/images/establishments/${primaryImage.filename}`}
            alt={establishment.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <MapPin className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <Badge className="absolute top-2 right-2" variant="secondary">
          {establishment.type}
        </Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{establishment.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {establishment.description || 'Sem descrição disponível'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {/* Localização */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>
              {establishment.neighborhood && `${establishment.neighborhood}, `}
              {establishment.city}
              {establishment.state && `, ${establishment.state}`}
            </span>
          </div>
          
          {/* Avaliação */}
          <div className="flex items-center">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium">
                {establishment.average_rating > 0 
                  ? establishment.average_rating.toFixed(1) 
                  : 'Sem avaliações'
                }
              </span>
            </div>
            <span className="text-sm text-gray-500 ml-2">
              ({establishment.total_reviews} avaliações)
            </span>
          </div>
          
          {/* Contatos */}
          <div className="flex items-center space-x-4 text-sm">
            {establishment.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-1" />
                <span>{establishment.phone}</span>
              </div>
            )}
            {establishment.whatsapp && (
              <a 
                href={`https://wa.me/${establishment.whatsapp.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-green-600 hover:text-green-800"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>WhatsApp</span>
              </a>
            )}
            {establishment.website && (
              <a 
                href={establishment.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Globe className="h-4 w-4 mr-1" />
                <span>Site</span>
              </a>
            )}
            {establishment.instagram && (
              <a 
                href={`https://instagram.com/${establishment.instagram.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-pink-600 hover:text-pink-800"
              >
                <Instagram className="h-4 w-4 mr-1" />
                <span>@{establishment.instagram.replace('@', '')}</span>
              </a>
            )}
          </div>
          
          {/* Características */}
          <div className="flex flex-wrap gap-1 mt-3">
            {establishment.faixa_etaria === 'Livre' && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 font-bold">
                L
              </Badge>
            )}
            {establishment.faixa_etaria && establishment.faixa_etaria !== 'Livre' && (
              <Badge variant="outline" className="text-xs">
                {establishment.faixa_etaria}
              </Badge>
            )}
            {establishment.pet_friendly && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                Pet Friendly
              </Badge>
            )}
            {establishment.lgbt_friendly && (
              <Badge variant="outline" className="text-xs bg-rainbow-50 text-purple-700">
                LGBT+ Friendly
              </Badge>
            )}
            {establishment.delivery && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                Delivery
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <Link to={`/establishment/${establishment.id}`}>
            <Button className="w-full">Ver Detalhes</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const EstablishmentList = () => {
  const [searchInput, setSearchInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    city: '',
    page: 1,
  });

  // Debounce para busca geral
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchInput,
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Debounce para busca por cidade
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        city: cityInput,
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [cityInput]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['establishments', filters],
    queryFn: () => establishmentService.getAll({
      ...filters,
      approved_only: 'true',
    }),
  });

  const handleFilterChange = (key, value) => {
    // Tratar "todos" como valor vazio para o filtro
    const filterValue = value === 'todos' ? '' : value;
    
    setFilters(prev => ({
      ...prev,
      [key]: filterValue,
      page: 1, // Reset para primeira página ao filtrar
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar estabelecimentos</p>
          <Button onClick={() => refetch()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  const establishments = data?.establishments || [];
  const pagination = data?.pagination || {};

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner promocional */}
      <PromoBanner />
      
      {/* Estabelecimentos Premium */}
      <PremiumEstablishments />
      
      <div className="mb-8" id="establishments">
        <h1 className="text-3xl font-bold mb-6">Descubra os Melhores Bares e Restaurantes</h1>
        <p className="text-gray-600 mb-6">Sua vitrine digital para encontrar os melhores estabelecimentos da cidade</p>
        
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Buscar estabelecimentos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          
          <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="Bar">Bar</SelectItem>
              <SelectItem value="Restaurante">Restaurante</SelectItem>
              <SelectItem value="Pub">Pub</SelectItem>
              <SelectItem value="Lanchonete">Lanchonete</SelectItem>
              <SelectItem value="Cafeteria">Cafeteria</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Cidade"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de estabelecimentos */}
      {establishments.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum estabelecimento encontrado
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros ou buscar por outros termos.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {establishments.map((establishment) => (
              <EstablishmentCard key={establishment.id} establishment={establishment} />
            ))}
          </div>

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                disabled={!pagination.has_prev}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.pages}
              </span>
              
              <Button
                variant="outline"
                disabled={!pagination.has_next}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EstablishmentList;

