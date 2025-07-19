import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Building, 
  MessageSquare, 
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Star,
  CreditCard
} from 'lucide-react';
import { userService, establishmentService, reviewService } from '../lib/api';
import PaymentSettings from './PaymentSettings';

const StatsCard = ({ title, value, icon: Icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

const UsersTab = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: userService.getAll,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Erro ao atualizar usuário');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Erro ao deletar usuário');
    },
  });

  const toggleUserStatus = (user) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { is_active: !user.is_active }
    });
  };

  const deleteUser = (userId) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando usuários...</div>;
  }

  const users = usersData?.users || [];

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{user.username}</h3>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.is_active ? 'default' : 'destructive'}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserStatus(user)}
                    disabled={updateUserMutation.isPending}
                  >
                    {user.is_active ? (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Ativar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                    disabled={deleteUserMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const EstablishmentsTab = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data: establishmentsData, isLoading } = useQuery({
    queryKey: ['admin-establishments'],
    queryFn: () => establishmentService.getAll({ approved_only: 'false' }),
  });

  const updateEstablishmentMutation = useMutation({
    mutationFn: ({ id, data }) => establishmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-establishments']);
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Erro ao atualizar estabelecimento');
    },
  });

  const approveEstablishment = (establishment) => {
    updateEstablishmentMutation.mutate({
      id: establishment.id,
      data: { is_approved: !establishment.is_approved }
    });
  };

  const toggleEstablishmentStatus = (establishment) => {
    updateEstablishmentMutation.mutate({
      id: establishment.id,
      data: { is_active: !establishment.is_active }
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando estabelecimentos...</div>;
  }

  const establishments = establishmentsData?.establishments || [];

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {establishments.map((establishment) => (
          <Card key={establishment.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{establishment.name}</h3>
                    <Badge variant="outline">{establishment.type}</Badge>
                    <Badge variant={establishment.is_approved ? 'default' : 'secondary'}>
                      {establishment.is_approved ? 'Aprovado' : 'Pendente'}
                    </Badge>
                    <Badge variant={establishment.is_active ? 'default' : 'destructive'}>
                      {establishment.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {establishment.description || 'Sem descrição'}
                  </p>
                  
                  <div className="text-sm text-gray-500">
                    <p>{establishment.city}, {establishment.state}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {establishment.average_rating > 0 
                          ? establishment.average_rating.toFixed(1) 
                          : 'Sem avaliações'
                        }
                      </span>
                      <span>{establishment.total_reviews} avaliações</span>
                      <span>Criado em: {new Date(establishment.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => approveEstablishment(establishment)}
                    disabled={updateEstablishmentMutation.isPending}
                  >
                    {establishment.is_approved ? (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reprovar
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleEstablishmentStatus(establishment)}
                    disabled={updateEstablishmentMutation.isPending}
                  >
                    {establishment.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/establishment/${establishment.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ReviewsTab = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['admin-reviews-pending'],
    queryFn: reviewService.getPending,
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, data }) => reviewService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reviews-pending']);
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Erro ao atualizar avaliação');
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: reviewService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reviews-pending']);
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Erro ao deletar avaliação');
    },
  });

  const approveReview = (review) => {
    updateReviewMutation.mutate({
      id: review.id,
      data: { is_approved: true }
    });
  };

  const deleteReview = (reviewId) => {
    if (window.confirm('Tem certeza que deseja deletar esta avaliação?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando avaliações...</div>;
  }

  const reviews = reviewsData?.reviews || [];

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Não há avaliações pendentes de aprovação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{review.reviewer_name}</h3>
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
                  
                  {review.comment && (
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    <p>Email: {review.reviewer_email || 'Não informado'}</p>
                    <p>Data: {new Date(review.created_at).toLocaleDateString('pt-BR')}</p>
                    <p>Estabelecimento ID: {review.establishment_id}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => approveReview(review)}
                    disabled={updateReviewMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteReview(review.id)}
                    disabled={deleteReviewMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: userService.getStats,
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: userService.getAll,
  });

  const { data: establishmentsData } = useQuery({
    queryKey: ['admin-establishments'],
    queryFn: () => establishmentService.getAll({ approved_only: 'false' }),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['admin-reviews-pending'],
    queryFn: reviewService.getPending,
  });

  const stats = statsData || {
    users: { total: 0, active: 0 },
    establishments: { total: 0, approved: 0, pending: 0 },
    reviews: { total: 0, pending: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-gray-600">Gerencie usuários, estabelecimentos e avaliações</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total de Usuários"
          value={stats.users.total}
          icon={Users}
          description={`${stats.users.active} ativos`}
        />
        <StatsCard
          title="Estabelecimentos"
          value={stats.establishments.total}
          icon={Building}
          description={`${stats.establishments.approved} aprovados`}
        />
        <StatsCard
          title="Pendentes"
          value={stats.establishments.pending}
          icon={BarChart3}
          description="Aguardando aprovação"
        />
        <StatsCard
          title="Avaliações Pendentes"
          value={stats.reviews.pending}
          icon={MessageSquare}
          description="Para moderação"
        />
      </div>

      {/* Tabs de gerenciamento */}
      <Tabs defaultValue="establishments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="establishments">Estabelecimentos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="establishments">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Estabelecimentos</CardTitle>
              <CardDescription>
                Aprove, reprove ou gerencie estabelecimentos cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EstablishmentsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Moderar Avaliações</CardTitle>
              <CardDescription>
                Aprove ou remova avaliações pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <PaymentSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
