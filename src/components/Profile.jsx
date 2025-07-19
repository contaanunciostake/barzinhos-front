import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Heart,
  Star,
  Shield,
  Camera,
  Upload
} from 'lucide-react';
import { userService } from '../lib/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import Avatar from './Avatar';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    bio: '',
  });
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Mutation para upload de foto de perfil
  const uploadPhotoMutation = useMutation({
    mutationFn: (file) => userService.uploadProfilePhoto(user.id, file),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setUploading(false);
      showSuccessToast('Foto de perfil atualizada com sucesso!');
    },
    onError: (error) => {
      setUploading(false);
      showErrorToast(error.response?.data?.error || 'Erro ao fazer upload da foto');
    },
  });

  // Mutation para atualizar perfil
  const updateMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(user.id, data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setIsEditing(false);
      showSuccessToast('Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      showErrorToast(error.response?.data?.error || 'Erro ao atualizar perfil');
    },
  });

  // Preencher formulário quando usuário for carregado
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        bio: user.bio || '',
      });
    }
    setIsEditing(false);
  };

  const handlePhotoClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handlePhotoSelect;
    input.click();
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
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
    uploadPhotoMutation.mutate(file);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'establishment':
        return 'Estabelecimento';
      case 'user':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'establishment':
        return User;
      case 'user':
        return User;
      default:
        return User;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Você precisa estar logado para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
        <p className="text-gray-600">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className="relative w-16 h-16 rounded-full cursor-pointer group"
            onClick={handlePhotoClick}
          >
            {user.profile_photo ? (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL || 'https://barzinhos-api.onrender.com'}/static/images/profiles/${user.profile_photo}`}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <RoleIcon className="h-8 w-8 text-primary" />
              </div>
            )}
            
            {/* Overlay para upload */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-full flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">
                {getRoleLabel(user.role)}
              </Badge>
              <Badge variant={user.is_active ? 'default' : 'destructive'}>
                {user.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Clique na foto para alterar
            </p>
          </div>
        </div>
        
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        )}
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          <TabsTrigger value="reviews">Minhas Avaliações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Mantenha suas informações sempre atualizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Seu nome de usuário"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Seu endereço"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Sua cidade"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Seu estado"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Informações da Conta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Membro desde:</span>{' '}
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Última atualização:</span>{' '}
                      {new Date(user.updated_at || user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-4">
                    <Button 
                      type="submit" 
                      disabled={updateMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Estabelecimentos Favoritos</CardTitle>
              <CardDescription>
                Seus estabelecimentos favoritos aparecerão aqui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum favorito ainda
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece a favoritar estabelecimentos para vê-los aqui
                </p>
                <Button variant="outline" disabled>
                  Explorar Estabelecimentos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Avaliações</CardTitle>
              <CardDescription>
                Avaliações que você fez em estabelecimentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma avaliação ainda
                </h3>
                <p className="text-gray-500 mb-4">
                  Suas avaliações aparecerão aqui após você avaliar estabelecimentos
                </p>
                <Button variant="outline" disabled>
                  Encontrar Estabelecimentos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Alterar Senha</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Mantenha sua conta segura com uma senha forte
                  </p>
                  <Button variant="outline" disabled>
                    Alterar Senha
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Autenticação de Dois Fatores</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                  <Button variant="outline" disabled>
                    Configurar 2FA
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-red-600">Zona de Perigo</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Ações irreversíveis relacionadas à sua conta
                  </p>
                  <Button variant="destructive" disabled>
                    Excluir Conta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;

