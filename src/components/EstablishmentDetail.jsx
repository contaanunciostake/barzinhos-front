import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Instagram, 
  ArrowLeft,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { establishmentService, reviewService } from '../lib/api';

const ImageCarousel = ({ images }) => {
  const [currentImage, setCurrentImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <MapPin className="h-16 w-16 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <img
          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/static/images/establishments/${images[currentImage].filename}`}
          alt={`Imagem ${currentImage + 1}`}
          className="w-full h-64 object-cover rounded-lg"
        />
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentImage ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 ${
                index === currentImage ? 'border-primary' : 'border-gray-200'
              }`}
            >
              <img
                src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/static/images/establishments/${image.filename}`}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ReviewForm = ({ establishmentId, onSuccess }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    reviewer_name: '',
    reviewer_email: '',
  });
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: reviewService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['establishment', establishmentId]);
      queryClient.invalidateQueries(['reviews', establishmentId]);
      setFormData({
        rating: 5,
        comment: '',
        reviewer_name: '',
        reviewer_email: '',
      });
      onSuccess?.();
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Erro ao enviar avaliação');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.reviewer_name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    createReviewMutation.mutate({
      ...formData,
      establishment_id: establishmentId,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deixe sua avaliação</CardTitle>
        <CardDescription>
          Compartilhe sua experiência neste estabelecimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="rating">Avaliação</Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= formData.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewer_name">Seu nome</Label>
            <Input
              id="reviewer_name"
              value={formData.reviewer_name}
              onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
              required
              placeholder="Como você gostaria de aparecer na avaliação"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewer_email">Email (opcional)</Label>
            <Input
              id="reviewer_email"
              type="email"
              value={formData.reviewer_email}
              onChange={(e) => setFormData({ ...formData, reviewer_email: e.target.value })}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comentário</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Conte sobre sua experiência..."
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={createReviewMutation.isPending}
          >
            {createReviewMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ReviewList = ({ establishmentId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', establishmentId],
    queryFn: () => reviewService.getByEstablishment(establishmentId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const reviews = data?.reviews || [];

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Ainda não há avaliações para este estabelecimento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">{review.reviewer_name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(review.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
            {review.comment && (
              <p className="text-gray-700 mt-2">{review.comment}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const EstablishmentDetail = () => {
  const { id } = useParams();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['establishment', id],
    queryFn: () => establishmentService.getById(id),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar estabelecimento</p>
          <Link to="/">
            <Button>Voltar para início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const establishment = data?.establishment;

  if (!establishment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Estabelecimento não encontrado</p>
          <Link to="/">
            <Button>Voltar para início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botão voltar */}
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cabeçalho */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{establishment.name}</h1>
              <Badge variant="secondary">{establishment.type}</Badge>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">
                  {establishment.average_rating > 0 
                    ? establishment.average_rating.toFixed(1) 
                    : 'Sem avaliações'
                  }
                </span>
                <span className="text-gray-500 ml-2">
                  ({establishment.total_reviews} avaliações)
                </span>
              </div>
            </div>

            {establishment.description && (
              <p className="text-gray-700 mb-4">{establishment.description}</p>
            )}
          </div>

          {/* Galeria de imagens */}
          <ImageCarousel images={establishment.images} />

          {/* Avaliações */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Avaliações</h2>
              <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                {showReviewForm ? 'Cancelar' : 'Avaliar'}
              </Button>
            </div>

            {showReviewForm && (
              <div className="mb-6">
                <ReviewForm 
                  establishmentId={establishment.id}
                  onSuccess={() => setShowReviewForm(false)}
                />
              </div>
            )}

            <ReviewList establishmentId={establishment.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações de contato */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Localização */}
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Endereço</p>
                  <p className="text-sm text-gray-600">
                    {establishment.address && `${establishment.address}, `}
                    {establishment.neighborhood && `${establishment.neighborhood}, `}
                    {establishment.city}
                    {establishment.state && `, ${establishment.state}`}
                    {establishment.cep && ` - ${establishment.cep}`}
                  </p>
                </div>
              </div>

              {/* Telefone */}
              {establishment.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Telefone</p>
                    <p className="text-sm text-gray-600">{establishment.phone}</p>
                  </div>
                </div>
              )}

              {/* WhatsApp */}
              {establishment.whatsapp && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <a 
                      href={`https://wa.me/${establishment.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      {establishment.whatsapp}
                    </a>
                  </div>
                </div>
              )}

              {/* Website */}
              {establishment.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Website</p>
                    <a 
                      href={establishment.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Visitar site
                    </a>
                  </div>
                </div>
              )}

              {/* Instagram */}
              {establishment.instagram && (
                <div className="flex items-center space-x-3">
                  <Instagram className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="font-medium">Instagram</p>
                    <a 
                      href={`https://instagram.com/${establishment.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-pink-600 hover:text-pink-800"
                    >
                      @{establishment.instagram.replace('@', '')}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Características e Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Características</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Faixa Etária */}
              {establishment.faixa_etaria && establishment.faixa_etaria !== 'Livre' && (
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{establishment.faixa_etaria}</Badge>
                </div>
              )}

              {/* Características especiais */}
              <div className="flex flex-wrap gap-2">
                {establishment.pet_friendly && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Pet Friendly
                  </Badge>
                )}
                {establishment.lgbt_friendly && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    LGBT+ Friendly
                  </Badge>
                )}
                {establishment.delivery && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Delivery Disponível
                  </Badge>
                )}
              </div>

              {/* Link do Delivery */}
              {establishment.delivery && establishment.link_delivery && (
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Delivery</p>
                    <a 
                      href={establishment.link_delivery}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Fazer pedido
                    </a>
                  </div>
                </div>
              )}

              {/* Ponto de Referência */}
              {establishment.ponto_referencia && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Ponto de Referência</p>
                    <p className="text-sm text-gray-600">{establishment.ponto_referencia}</p>
                  </div>
                </div>
              )}

              {/* Como Chegar */}
              {establishment.como_chegar_transporte && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Como Chegar (Transporte Público)</p>
                    <p className="text-sm text-gray-600">{establishment.como_chegar_transporte}</p>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="space-y-2 pt-4 border-t">
                {/* Compartilhar Localização */}
                {establishment.latitude && establishment.longitude && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${establishment.latitude},${establishment.longitude}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver no Mapa
                  </Button>
                )}

                {/* Compartilhar Localização via WhatsApp */}
                {establishment.latitude && establishment.longitude && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const message = `Confira este estabelecimento: ${establishment.name} - https://www.google.com/maps?q=${establishment.latitude},${establishment.longitude}`;
                      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Compartilhar Localização
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentDetail;

