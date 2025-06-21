import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { adminService } from '../services/adminService.js';
import { 
  Search, 
  Check, 
  X, 
  Eye, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Globe, 
  Instagram,
  Star,
  Loader2,
  BarChart3,
  Users,
  Building,
  TrendingUp
} from 'lucide-react';

const AdminPanel = () => {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('pending');
  const [stats, setStats] = useState(null);
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedTab, searchTerm]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      let response;
      
      const filters = {
        search: searchTerm,
        status: selectedTab === 'all' ? undefined : selectedTab,
      };

      response = await adminService.getAllEstablishments(filters);
      setEstablishments(response.establishments || []);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await adminService.approveEstablishment(id);
      await loadData();
      await loadStats();
    } catch (error) {
      console.error('Erro ao aprovar estabelecimento:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      await adminService.rejectEstablishment(id, rejectReason);
      setRejectReason('');
      setSelectedEstablishment(null);
      await loadData();
      await loadStats();
    } catch (error) {
      console.error('Erro ao rejeitar estabelecimento:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' },
      approved: { label: 'Aprovado', variant: 'default' },
      rejected: { label: 'Rejeitado', variant: 'destructive' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className="text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-2">
            Gerencie estabelecimentos e monitore o sistema
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Estabelecimentos</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEstablishments || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingEstablishments || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedEstablishments || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReviews || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search size={20} />
              <span>Buscar Estabelecimentos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por nome, email ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="approved">Aprovados</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Carregando estabelecimentos...</span>
              </div>
            ) : establishments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <Building size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">Nenhum estabelecimento encontrado</h3>
                  <p>Não há estabelecimentos nesta categoria.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(establishment.status)}
                          <Badge variant="outline">{establishment.type}</Badge>
                        </div>
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

                        {establishment.user?.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="font-medium">Email:</span>
                            <span>{establishment.user.email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {establishment.whatsapp && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            <MessageCircle size={14} className="mr-1" />
                            WhatsApp
                          </Button>
                        )}
                        
                        {establishment.website && (
                          <Button size="sm" variant="outline">
                            <Globe size={14} className="mr-1" />
                            Site
                          </Button>
                        )}
                        
                        {establishment.instagram && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-pink-600 border-pink-600"
                          >
                            <Instagram size={14} className="mr-1" />
                            Instagram
                          </Button>
                        )}
                      </div>

                      {establishment.rejectionReason && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertDescription>
                            <strong>Motivo da rejeição:</strong> {establishment.rejectionReason}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="flex gap-2">
                        {establishment.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(establishment._id)}
                              disabled={actionLoading}
                              className="flex-1"
                            >
                              <Check size={14} className="mr-1" />
                              Aprovar
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setSelectedEstablishment(establishment)}
                                  className="flex-1"
                                >
                                  <X size={14} className="mr-1" />
                                  Rejeitar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rejeitar Estabelecimento</DialogTitle>
                                  <DialogDescription>
                                    Informe o motivo da rejeição para {establishment.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="Motivo da rejeição..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleReject(establishment._id)}
                                      disabled={!rejectReason.trim() || actionLoading}
                                      variant="destructive"
                                      className="flex-1"
                                    >
                                      Confirmar Rejeição
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedEstablishment(null);
                                        setRejectReason('');
                                      }}
                                      className="flex-1"
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                        
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye size={14} className="mr-1" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;

