import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { establishmentService } from '../services/establishmentService.js';
import { 
  Search, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Globe, 
  Instagram,
  Star,
  Filter,
  Loader2
} from 'lucide-react';

const HomePage = () => {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [stats, setStats] = useState(null);

  const types = establishmentService.getTypes();
  const neighborhoods = establishmentService.getNeighborhoods();

  useEffect(() => {
    loadEstablishments();
    loadStats();
  }, [searchTerm, selectedType, selectedNeighborhood]);

  const loadEstablishments = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        type: selectedType,
        neighborhood: selectedNeighborhood,
        status: 'approved', // Apenas estabelecimentos aprovados
      };

      const response = await establishmentService.getEstablishments(filters);
      setEstablishments(response.establishments || []);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await establishmentService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedNeighborhood('');
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="fill-yellow-400/50 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Descubra os Melhores
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Bares e Restaurantes
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Sua vitrine digital para encontrar os melhores estabelecimentos da cidade
            </p>
            
            {stats && (
              <div className="flex justify-center space-x-8 text-center">
                <div>
                  <div className="text-2xl font-bold">{stats.totalEstablishments || 0}</div>
                  <div className="text-sm opacity-80">Estabelecimentos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalReviews || 0}</div>
                  <div className="text-sm opacity-80">Avaliações</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.averageRating || 0}</div>
                  <div className="text-sm opacity-80">Nota Média</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search size={20} />
              <span>Buscar Estabelecimentos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
                <SelectTrigger>
                  <SelectValue placeholder="Bairro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os bairros</SelectItem>
                  {neighborhoods.map((neighborhood) => (
                    <SelectItem key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(searchTerm || selectedType || selectedNeighborhood) && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter size={16} />
                  <span className="text-sm text-gray-600">
                    Filtros ativos:
                  </span>
                  {searchTerm && <Badge variant="secondary">"{searchTerm}"</Badge>}
                  {selectedType && <Badge variant="secondary">{selectedType}</Badge>}
                  {selectedNeighborhood && <Badge variant="secondary">{selectedNeighborhood}</Badge>}
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando estabelecimentos...</span>
          </div>
        ) : establishments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Nenhum estabelecimento encontrado</h3>
              <p>Tente ajustar os filtros ou buscar por outros termos.</p>
            </div>
            <Button onClick={clearFilters} variant="outline">
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {establishments.map((establishment) => (
              <Card key={establishment._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{establishment.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-1 mt-1">
                        <MapPin size={14} />
                        <span>{establishment.neighborhood}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{establishment.type}</Badge>
                  </div>
                  
                  {establishment.averageRating > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(establishment.averageRating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({establishment.reviewCount || 0})
                      </span>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  {establishment.logo && (
                    <div className="mb-4">
                      <img
                        src={establishment.logo}
                        alt={establishment.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                  
                  {establishment.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {establishment.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {establishment.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>{establishment.address}</span>
                      </div>
                    )}
                    
                    {establishment.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{formatPhone(establishment.phone)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {establishment.whatsapp && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => window.open(`https://wa.me/${establishment.whatsapp.replace(/\D/g, '')}`, '_blank')}
                      >
                        <MessageCircle size={14} className="mr-1" />
                        WhatsApp
                      </Button>
                    )}
                    
                    {establishment.website && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(establishment.website, '_blank')}
                      >
                        <Globe size={14} className="mr-1" />
                        Site
                      </Button>
                    )}
                    
                    {establishment.instagram && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-pink-600 border-pink-600 hover:bg-pink-50"
                        onClick={() => window.open(`https://instagram.com/${establishment.instagram.replace('@', '')}`, '_blank')}
                      >
                        <Instagram size={14} className="mr-1" />
                        Instagram
                      </Button>
                    )}
                  </div>
                  
                  <Link to={`/estabelecimento/${establishment._id}`}>
                    <Button className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!loading && establishments.length > 0 && (
          <div className="text-center mt-12 py-8 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2">Tem um estabelecimento?</h3>
            <p className="text-gray-600 mb-4">
              Cadastre-se gratuitamente e apareça para milhares de clientes
            </p>
            <Link to="/cadastro">
              <Button size="lg">
                Cadastrar Meu Estabelecimento
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

