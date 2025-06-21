import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { establishmentService } from '../services/establishmentService.js';
import { 
  Store, 
  Upload, 
  Trash2, 
  Save, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Globe, 
  Instagram,
  Star,
  Eye,
  Camera,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const EstablishmentPanel = () => {
  const { user } = useAuth();
  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLogoUpload, setIsLogoUpload] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    neighborhood: '',
    address: '',
    phone: '',
    whatsapp: '',
    website: '',
    instagram: '',
    latitude: '',
    longitude: '',
    openingHours: '',
  });

  const types = establishmentService.getTypes();
  const neighborhoods = establishmentService.getNeighborhoods();

  useEffect(() => {
    loadEstablishment();
  }, []);

  const loadEstablishment = async () => {
    try {
      setLoading(true);
      const data = await establishmentService.getMyEstablishment();
      setEstablishment(data);
      
      // Preencher formulário com dados existentes
      setFormData({
        name: data.name || '',
        description: data.description || '',
        type: data.type || '',
        neighborhood: data.neighborhood || '',
        address: data.address || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        website: data.website || '',
        instagram: data.instagram || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        openingHours: data.openingHours || '',
      });
    } catch (error) {
      console.error('Erro ao carregar estabelecimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      await establishmentService.updateMyEstablishment(updateData);
      await loadEstablishment();
      
      // Mostrar sucesso
      alert('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar estabelecimento:', error);
      alert('Erro ao atualizar dados. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      await establishmentService.uploadImages(selectedFiles, isLogoUpload);
      await loadEstablishment();
      setSelectedFiles([]);
      setIsLogoUpload(false);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
      
      alert('Imagens enviadas com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao enviar imagens. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrl, isLogo = false) => {
    try {
      await establishmentService.removeImage(imageUrl, isLogo);
      await loadEstablishment();
      alert('Imagem removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      alert('Erro ao remover imagem. Tente novamente.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        label: 'Aguardando Aprovação', 
        variant: 'secondary',
        icon: Clock,
        description: 'Seu estabelecimento está sendo analisado pela nossa equipe.'
      },
      approved: { 
        label: 'Aprovado', 
        variant: 'default',
        icon: CheckCircle,
        description: 'Seu estabelecimento está ativo e visível para os clientes.'
      },
      rejected: { 
        label: 'Rejeitado', 
        variant: 'destructive',
        icon: XCircle,
        description: 'Seu estabelecimento foi rejeitado. Verifique o motivo e faça as correções necessárias.'
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <div className="flex items-center space-x-2">
        <Badge variant={config.variant} className="flex items-center space-x-1">
          <IconComponent size={14} />
          <span>{config.label}</span>
        </Badge>
      </div>
    );
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando painel...</span>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Estabelecimento não encontrado</CardTitle>
            <CardDescription>
              Não foi possível carregar os dados do seu estabelecimento.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meu Estabelecimento</h1>
              <p className="text-gray-600 mt-2">
                Gerencie as informações do seu estabelecimento
              </p>
            </div>
            {getStatusBadge(establishment.status)}
          </div>
          
          {establishment.status === 'rejected' && establishment.rejectionReason && (
            <Alert variant="destructive" className="mt-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Motivo da rejeição:</strong> {establishment.rejectionReason}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="images">Imagens</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          {/* Informações */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Store size={20} />
                  <span>Dados do Estabelecimento</span>
                </CardTitle>
                <CardDescription>
                  Mantenha suas informações sempre atualizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Estabelecimento *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
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
                      onChange={handleChange}
                      rows={3}
                      placeholder="Descreva seu estabelecimento, ambiente, especialidades..."
                    />
                  </div>

                  {/* Localização */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Select value={formData.neighborhood} onValueChange={(value) => handleSelectChange('neighborhood', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o bairro" />
                        </SelectTrigger>
                        <SelectContent>
                          {neighborhoods.map((neighborhood) => (
                            <SelectItem key={neighborhood} value={neighborhood}>
                              {neighborhood}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Coordenadas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        name="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        name="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Redes sociais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Horário de funcionamento */}
                  <div className="space-y-2">
                    <Label htmlFor="openingHours">Horário de Funcionamento</Label>
                    <Textarea
                      id="openingHours"
                      name="openingHours"
                      value={formData.openingHours}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Ex: Segunda a Sexta: 18h às 02h, Sábado e Domingo: 12h às 03h"
                    />
                  </div>

                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Imagens */}
          <TabsContent value="images">
            <div className="space-y-6">
              {/* Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload size={20} />
                    <span>Upload de Imagens</span>
                  </CardTitle>
                  <CardDescription>
                    Adicione fotos do seu estabelecimento para atrair mais clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Selecionar Imagens
                      </Button>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isLogoUpload}
                          onChange={(e) => setIsLogoUpload(e.target.checked)}
                        />
                        <span className="text-sm">É logo/foto principal?</span>
                      </label>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          {selectedFiles.length} arquivo(s) selecionado(s):
                        </p>
                        <ul className="text-sm text-gray-500">
                          {selectedFiles.map((file, index) => (
                            <li key={index}>• {file.name}</li>
                          ))}
                        </ul>
                        <Button onClick={handleUpload} disabled={uploading}>
                          {uploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Enviar Imagens
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Logo */}
              {establishment.logo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Logo/Foto Principal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative inline-block">
                      <img
                        src={establishment.logo}
                        alt="Logo"
                        className="w-48 h-32 object-cover rounded-md"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveImage(establishment.logo, true)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Galeria */}
              {establishment.images && establishment.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Galeria de Imagens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {establishment.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => handleRemoveImage(image, false)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Estatísticas */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {establishment.averageRating ? establishment.averageRating.toFixed(1) : '0.0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {establishment.reviewCount || 0} avaliações
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {establishment.views || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total de visualizações
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {establishment.status === 'approved' ? 'Ativo' : 
                     establishment.status === 'pending' ? 'Pendente' : 'Inativo'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Estado atual
                  </p>
                </CardContent>
              </Card>
            </div>

            {establishment.status === 'approved' && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                  <CardDescription>
                    Como os clientes podem entrar em contato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {establishment.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-gray-400" />
                        <span>{formatPhone(establishment.phone)}</span>
                      </div>
                    )}
                    
                    {establishment.whatsapp && (
                      <div className="flex items-center space-x-2">
                        <MessageCircle size={16} className="text-green-600" />
                        <span>{formatPhone(establishment.whatsapp)}</span>
                      </div>
                    )}
                    
                    {establishment.website && (
                      <div className="flex items-center space-x-2">
                        <Globe size={16} className="text-blue-600" />
                        <span>{establishment.website}</span>
                      </div>
                    )}
                    
                    {establishment.instagram && (
                      <div className="flex items-center space-x-2">
                        <Instagram size={16} className="text-pink-600" />
                        <span>{establishment.instagram}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EstablishmentPanel;

