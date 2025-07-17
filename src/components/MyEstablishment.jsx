import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  MapPin, 
  Phone, 
  Globe, 
  Instagram, 
  MessageCircle,
  Upload,
  Star,
  Eye,
  Edit,
  Save,
  X,
  Trash2,
  Image as ImageIcon,
  Crown,
  Lock
} from 'lucide-react';
import { establishmentService, planService } from '../lib/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

// Funções de formatação e validação
const formatCEP = (value) => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara do CEP (00000-000)
  if (numbers.length <= 5) {
    return numbers;
  } else {
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  }
};

const formatPhone = (value) => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara do telefone
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

const validateCEP = (cep) => {
  const numbers = cep.replace(/\D/g, '');
  return numbers.length === 8;
};

const validatePhone = (phone) => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length >= 10 && numbers.length <= 11;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateWebsite = (website) => {
  if (!website) return true; // Campo opcional
  try {
    new URL(website);
    return true;
  } catch {
    return false;
  }
};

const validateInstagram = (instagram) => {
  if (!instagram) return true; // Campo opcional
  return instagram.startsWith('@') && instagram.length > 1;
};

const ImageGallery = ({ establishment }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Mutation para upload de imagem
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api/establishments/${establishment.id}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer upload da imagem');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-establishment']);
      showSuccessToast('Imagem enviada com sucesso!');
      setUploading(false);
    },
    onError: (error) => {
      showErrorToast(error.message);
      setUploading(false);
    },
  });

  // Mutation para deletar imagem
  const deleteMutation = useMutation({
    mutationFn: async (imageId) => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api/establishments/${establishment.id}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao remover imagem');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-establishment']);
      showSuccessToast('Imagem removida com sucesso!');
    },
    onError: (error) => {
      showErrorToast(error.message);
    },
  });

  const handleFileSelect = (files) => {
    const file = files[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showErrorToast('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setUploading(true);
    uploadMutation.mutate(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDeleteImage = (imageId) => {
    if (window.confirm('Tem certeza que deseja remover esta imagem?')) {
      deleteMutation.mutate(imageId);
    }
  };

  const images = establishment.images || [];

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {uploading ? 'Enviando imagem...' : 'Adicionar nova imagem'}
        </h3>
        
        <p className="text-gray-500 mb-4">
          Arraste e solte uma imagem aqui ou clique para selecionar
        </p>
        
        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
        >
          {uploading ? 'Enviando...' : 'Selecionar Imagem'}
        </Button>
        
        <p className="text-xs text-gray-400 mt-2">
          Formatos aceitos: JPG, PNG, GIF, WebP (máximo 5MB)
        </p>
      </div>

      {/* Gallery */}
      {images.length > 0 ? (
        <div>
          <h3 className="text-lg font-medium mb-4">
            Imagens do Estabelecimento ({images.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/static/images/establishments/${image.filename}`}
                    alt={image.original_filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Badge para imagem principal */}
                {image.is_primary && (
                  <Badge className="absolute top-2 left-2 bg-primary">
                    Principal
                  </Badge>
                )}
                
                {/* Nome do arquivo */}
                <p className="text-xs text-gray-500 mt-2 truncate">
                  {image.original_filename}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma imagem adicionada
          </h3>
          <p className="text-gray-500">
            Adicione imagens para tornar seu estabelecimento mais atrativo
          </p>
        </div>
      )}
    </div>
  );
};

const MyEstablishment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    cep: '',
    state: '',
    city: '',
    neighborhood: '',
    address: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    website: '',
    // Novos campos
    faixa_etaria: 'Livre',
    pet_friendly: false,
    lgbt_friendly: false,
    horarios_funcionamento: {},
    delivery: false,
    link_delivery: '',
    ponto_referencia: '',
    como_chegar_transporte: '',
  });

  // Buscar estabelecimento do usuário logado
  const { data: establishment, isLoading, error } = useQuery({
    queryKey: ['my-establishment'],
    queryFn: () => establishmentService.getMyEstablishment(),
    enabled: !!user?.id && user?.role === 'establishment',
    retry: false,
  });

  // Buscar assinatura do usuário
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => planService.getMySubscription(),
    enabled: !!user?.id,
  });

  // Mutation para atualizar estabelecimento
  const updateMutation = useMutation({
    mutationFn: (data) => establishmentService.update(establishment.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-establishment']);
      setIsEditing(false);
      showSuccessToast('Estabelecimento atualizado com sucesso!');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.error || 'Erro ao atualizar estabelecimento');
    },
  });

  // Mutation para criar estabelecimento
  const createMutation = useMutation({
    mutationFn: (data) => establishmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-establishment']);
      setIsEditing(false);
      showSuccessToast('Estabelecimento criado com sucesso!');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.error || 'Erro ao criar estabelecimento');
    },
  });

  // Preencher formulário quando estabelecimento for carregado
  useEffect(() => {
    if (establishment) {
      setFormData({
        name: establishment.name || '',
        description: establishment.description || '',
        type: establishment.type || '',
        cep: establishment.cep || '',
        state: establishment.state || '',
        city: establishment.city || '',
        neighborhood: establishment.neighborhood || '',
        address: establishment.address || '',
        phone: establishment.phone || '',
        whatsapp: establishment.whatsapp || '',
        instagram: establishment.instagram || '',
        website: establishment.website || '',
        // Novos campos
        faixa_etaria: establishment.faixa_etaria || 'Livre',
        pet_friendly: establishment.pet_friendly || false,
        lgbt_friendly: establishment.lgbt_friendly || false,
        horarios_funcionamento: establishment.horarios_funcionamento || {},
        delivery: establishment.delivery || false,
        link_delivery: establishment.link_delivery || '',
        ponto_referencia: establishment.ponto_referencia || '',
        como_chegar_transporte: establishment.como_chegar_transporte || '',
      });
      // Automaticamente entrar em modo de edição quando há dados existentes
      setIsEditing(true);
    } else if (!isLoading && !error) {
      // Se não há estabelecimento e não está carregando, manter formulário em branco para cadastro
      setIsEditing(true);
    }
  }, [establishment, isLoading, error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Aplicar formatação automática baseada no campo
    switch (name) {
      case 'cep':
        formattedValue = formatCEP(value);
        break;
      case 'phone':
        formattedValue = formatPhone(value);
        break;
      case 'whatsapp':
        formattedValue = formatPhone(value);
        break;
      case 'instagram':
        // Garantir que Instagram sempre comece com @
        if (value && !value.startsWith('@')) {
          formattedValue = '@' + value.replace('@', '');
        }
        break;
      case 'website':
        // Garantir que website comece com http:// ou https://
        if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
          if (value.includes('.')) {
            formattedValue = 'https://' + value;
          }
        }
        break;
      default:
        formattedValue = value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validações antes do envio
    const validationErrors = [];
    
    // Validar campos obrigatórios
    if (!formData.name?.trim()) {
      validationErrors.push('Nome do estabelecimento é obrigatório');
    }
    
    if (!formData.type) {
      validationErrors.push('Tipo do estabelecimento é obrigatório');
    }
    
    // Validar CEP se fornecido
    if (formData.cep && !validateCEP(formData.cep)) {
      validationErrors.push('CEP deve ter 8 dígitos');
    }
    
    // Validar telefone se fornecido
    if (formData.phone && !validatePhone(formData.phone)) {
      validationErrors.push('Telefone deve ter entre 10 e 11 dígitos');
    }
    
    // Validar WhatsApp se fornecido
    if (formData.whatsapp && !validatePhone(formData.whatsapp)) {
      validationErrors.push('WhatsApp deve ter entre 10 e 11 dígitos');
    }
    
    // Validar Instagram se fornecido
    if (formData.instagram && !validateInstagram(formData.instagram)) {
      validationErrors.push('Instagram deve começar com @');
    }
    
    // Validar website se fornecido
    if (formData.website && !validateWebsite(formData.website)) {
      validationErrors.push('Website deve ser uma URL válida');
    }
    
    // Se há erros de validação, mostrar e não enviar
    if (validationErrors.length > 0) {
      showErrorToast(`Corrija os seguintes erros:\n${validationErrors.join('\n')}`);
      return;
    }
    
    // Preparar dados para envio (remover formatação de alguns campos)
    const dataToSend = {
      ...formData,
      cep: formData.cep.replace(/\D/g, ''), // Remover formatação do CEP
      phone: formData.phone.replace(/\D/g, ''), // Remover formatação do telefone
      whatsapp: formData.whatsapp.replace(/\D/g, ''), // Remover formatação do WhatsApp
    };
    
    if (establishment) {
      updateMutation.mutate(dataToSend);
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const handleCancel = () => {
    if (establishment) {
      setFormData({
        name: establishment.name || '',
        description: establishment.description || '',
        type: establishment.type || '',
        cep: establishment.cep || '',
        state: establishment.state || '',
        city: establishment.city || '',
        neighborhood: establishment.neighborhood || '',
        address: establishment.address || '',
        phone: establishment.phone || '',
        whatsapp: establishment.whatsapp || '',
        instagram: establishment.instagram || '',
        website: establishment.website || '',
        // Novos campos
        faixa_etaria: establishment.faixa_etaria || 'Livre',
        pet_friendly: establishment.pet_friendly || false,
        lgbt_friendly: establishment.lgbt_friendly || false,
        horarios_funcionamento: establishment.horarios_funcionamento || {},
        delivery: establishment.delivery || false,
        link_delivery: establishment.link_delivery || '',
        ponto_referencia: establishment.ponto_referencia || '',
        como_chegar_transporte: establishment.como_chegar_transporte || '',
      });
    }
    setIsEditing(false);
  };

  if (user?.role !== 'establishment') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Acesso negado. Esta página é apenas para usuários do tipo "Estabelecimento".
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Verificar se o usuário tem um plano ativo para criar estabelecimento
  if (!establishment && subscription && !subscriptionLoading) {
    const hasActivePlan = subscription.subscription?.is_active;
    
    if (!hasActivePlan) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Plano Necessário</CardTitle>
              <CardDescription>
                Para cadastrar seu estabelecimento, você precisa de um plano ativo
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Escolha um de nossos planos para começar a divulgar seu estabelecimento e atrair mais clientes.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Benefícios dos nossos planos:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Cadastro completo do estabelecimento</li>
                  <li>• Upload de fotos atrativas</li>
                  <li>• Destaque nos resultados de busca</li>
                  <li>• Analytics e relatórios</li>
                </ul>
              </div>
              
              <div className="flex space-x-4 justify-center">
                <Link to="/plans">
                  <Button>
                    <Crown className="h-4 w-4 mr-2" />
                    Ver Planos
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meu Estabelecimento</h1>
        <p className="text-gray-600">
          {establishment ? 'Gerencie as informações do seu estabelecimento' : 'Cadastre seu estabelecimento'}
        </p>
      </div>

      {establishment && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant={establishment.is_approved ? 'default' : 'secondary'}>
              {establishment.is_approved ? 'Aprovado' : 'Pendente de Aprovação'}
            </Badge>
            <Badge variant={establishment.is_active ? 'default' : 'destructive'}>
              {establishment.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          
          {!isEditing && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/establishment/${establishment.id}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações Básicas</TabsTrigger>
          <TabsTrigger value="images">Imagens</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Estabelecimento</CardTitle>
              <CardDescription>
                Mantenha as informações do seu estabelecimento sempre atualizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Estabelecimento *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing && !!establishment}
                      required
                      placeholder="Nome do seu estabelecimento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleSelectChange('type', value)}
                      disabled={!isEditing && !!establishment}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bar">Bar</SelectItem>
                        <SelectItem value="Restaurante">Restaurante</SelectItem>
                        <SelectItem value="Pub">Pub</SelectItem>
                        <SelectItem value="Lanchonete">Lanchonete</SelectItem>
                        <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={!isEditing && !!establishment}
                    placeholder="Descreva seu estabelecimento..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      disabled={!isEditing && !!establishment}
                      required
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!isEditing && !!establishment}
                      placeholder="Estado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing && !!establishment}
                      required
                      placeholder="Cidade"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      disabled={!isEditing && !!establishment}
                      placeholder="Bairro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing && !!establishment}
                      placeholder="Rua, número"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing && !!establishment}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      disabled={!isEditing && !!establishment}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      disabled={!isEditing && !!establishment}
                      placeholder="@seuinstagram"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      disabled={!isEditing && !!establishment}
                      placeholder="https://seusite.com"
                    />
                  </div>
                </div>

                {/* Seção de Características */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Características do Estabelecimento</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="faixa_etaria">Faixa Etária</Label>
                      <Select 
                        value={formData.faixa_etaria} 
                        onValueChange={(value) => handleSelectChange('faixa_etaria', value)}
                        disabled={!isEditing && !!establishment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a faixa etária" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Livre">Livre</SelectItem>
                          <SelectItem value="18+">18+</SelectItem>
                          <SelectItem value="21+">21+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Pet Friendly</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="pet_friendly"
                          checked={formData.pet_friendly}
                          onChange={(e) => handleSelectChange('pet_friendly', e.target.checked)}
                          disabled={!isEditing && !!establishment}
                          className="rounded"
                        />
                        <Label htmlFor="pet_friendly" className="text-sm">Aceita pets</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">LGBT Friendly</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="lgbt_friendly"
                          checked={formData.lgbt_friendly}
                          onChange={(e) => handleSelectChange('lgbt_friendly', e.target.checked)}
                          disabled={!isEditing && !!establishment}
                          className="rounded"
                        />
                        <Label htmlFor="lgbt_friendly" className="text-sm">Ambiente LGBT friendly</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Delivery</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="delivery"
                          checked={formData.delivery}
                          onChange={(e) => handleSelectChange('delivery', e.target.checked)}
                          disabled={!isEditing && !!establishment}
                          className="rounded"
                        />
                        <Label htmlFor="delivery" className="text-sm">Oferece delivery</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="link_delivery">Link do Delivery</Label>
                      <Input
                        id="link_delivery"
                        name="link_delivery"
                        value={formData.link_delivery}
                        onChange={handleInputChange}
                        disabled={!isEditing && !!establishment}
                        placeholder="https://ifood.com.br/seu-estabelecimento"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ponto_referencia">Ponto de Referência</Label>
                      <Textarea
                        id="ponto_referencia"
                        name="ponto_referencia"
                        value={formData.ponto_referencia}
                        onChange={handleInputChange}
                        disabled={!isEditing && !!establishment}
                        placeholder="Ex: Próximo ao shopping, em frente à praça..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="como_chegar_transporte">Como Chegar (Transporte Público)</Label>
                      <Textarea
                        id="como_chegar_transporte"
                        name="como_chegar_transporte"
                        value={formData.como_chegar_transporte}
                        onChange={handleInputChange}
                        disabled={!isEditing && !!establishment}
                        placeholder="Ex: Metrô linha azul, estação XYZ. Ônibus linhas 123, 456..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Seção de Horários de Funcionamento */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Horários de Funcionamento</h3>
                  
                  <div className="space-y-4">
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia, index) => {
                      const dayKey = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'][index];
                      const dayData = formData.horarios_funcionamento[dayKey] || { fechado: false, abertura: '', fechamento: '' };
                      
                      return (
                        <div key={dayKey} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-20 font-medium text-sm">
                            {dia}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`${dayKey}_fechado`}
                              checked={dayData.fechado}
                              onChange={(e) => {
                                const newHorarios = { ...formData.horarios_funcionamento };
                                newHorarios[dayKey] = { 
                                  ...dayData, 
                                  fechado: e.target.checked,
                                  abertura: e.target.checked ? '' : dayData.abertura,
                                  fechamento: e.target.checked ? '' : dayData.fechamento
                                };
                                setFormData({ ...formData, horarios_funcionamento: newHorarios });
                              }}
                              disabled={!isEditing && !!establishment}
                              className="rounded"
                            />
                            <Label htmlFor={`${dayKey}_fechado`} className="text-sm">Fechado</Label>
                          </div>
                          
                          {!dayData.fechado && (
                            <>
                              <div className="flex items-center space-x-2">
                                <Label className="text-sm">Abertura:</Label>
                                <Input
                                  type="time"
                                  value={dayData.abertura}
                                  onChange={(e) => {
                                    const newHorarios = { ...formData.horarios_funcionamento };
                                    newHorarios[dayKey] = { ...dayData, abertura: e.target.value };
                                    setFormData({ ...formData, horarios_funcionamento: newHorarios });
                                  }}
                                  disabled={!isEditing && !!establishment}
                                  className="w-24"
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Label className="text-sm">Fechamento:</Label>
                                <Input
                                  type="time"
                                  value={dayData.fechamento}
                                  onChange={(e) => {
                                    const newHorarios = { ...formData.horarios_funcionamento };
                                    newHorarios[dayKey] = { ...dayData, fechamento: e.target.value };
                                    setFormData({ ...formData, horarios_funcionamento: newHorarios });
                                  }}
                                  disabled={!isEditing && !!establishment}
                                  className="w-24"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                    
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <strong>Dica:</strong> Marque "Fechado" para os dias em que o estabelecimento não funciona. 
                      Para estabelecimentos 24h, defina abertura às 00:00 e fechamento às 23:59.
                    </div>
                  </div>
                </div>

                {(isEditing || !establishment) && (
                  <div className="flex space-x-4">
                    <Button 
                      type="submit" 
                      disabled={updateMutation.isPending || createMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateMutation.isPending || createMutation.isPending 
                        ? 'Salvando...' 
                        : establishment ? 'Salvar Alterações' : 'Criar Estabelecimento'
                      }
                    </Button>
                    
                    {establishment && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Galeria de Imagens</CardTitle>
              <CardDescription>
                Adicione fotos atrativas do seu estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {establishment ? (
                <ImageGallery establishment={establishment} />
              ) : (
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Primeiro cadastre seu estabelecimento
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Para adicionar imagens, você precisa primeiro criar seu estabelecimento na aba "Informações Básicas"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Avaliações</CardTitle>
              <CardDescription>
                Veja as avaliações do seu estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Avaliações
                </h3>
                <p className="text-gray-500 mb-4">
                  Funcionalidade em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyEstablishment;

