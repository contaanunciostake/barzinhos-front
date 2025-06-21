import { useState, useEffect } from 'react'
import { ArrowLeft, Check, X, Eye, MapPin, Star, Clock, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

const AdminPanel = ({ onBack }) => {
  const [pendingEstablishments, setPendingEstablishments] = useState([])
  const [approvedEstablishments, setApprovedEstablishments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchEstablishments()
  }, [])

  const fetchEstablishments = async () => {
    try {
      // Buscar estabelecimentos pendentes
      const pendingResponse = await fetch('http://localhost:5000/api/establishments?approved_only=false')
      const pendingData = await pendingResponse.json()
      
      if (pendingData.success) {
        const pending = pendingData.data.filter(est => !est.is_approved)
        const approved = pendingData.data.filter(est => est.is_approved)
        
        setPendingEstablishments(pending)
        setApprovedEstablishments(approved)
      }
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (establishmentId, approve) => {
    setActionLoading(establishmentId)
    
    try {
      const response = await fetch(`http://localhost:5000/api/establishments/${establishmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_approved: approve
        })
      })

      const result = await response.json()

      if (result.success) {
        // Atualizar as listas
        await fetchEstablishments()
      } else {
        alert('Erro ao atualizar estabelecimento: ' + result.error)
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor: ' + error.message)
    } finally {
      setActionLoading(null)
    }
  }

  const EstablishmentCard = ({ establishment, showActions = false }) => (
    <Card className="overflow-hidden">
      <div className="relative">
        {establishment.image_url ? (
          <img
            src={establishment.image_url}
            alt={establishment.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Sem imagem</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={establishment.is_open ? "default" : "secondary"} className="bg-white text-gray-900">
            <Clock className="h-3 w-3 mr-1" />
            {establishment.is_open ? "Aberto" : "Fechado"}
          </Badge>
        </div>
        {!establishment.is_approved && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive">Pendente</Badge>
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{establishment.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {establishment.neighborhood}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{establishment.rating.toFixed(1)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 mb-4">{establishment.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{establishment.type}</Badge>
            <Badge variant="outline" className="capitalize">{establishment.plan_type}</Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Endereço:</strong> {establishment.address}</p>
            {establishment.phone && <p><strong>Telefone:</strong> {establishment.phone}</p>}
            {establishment.whatsapp && <p><strong>WhatsApp:</strong> {establishment.whatsapp}</p>}
            {establishment.website && <p><strong>Website:</strong> {establishment.website}</p>}
            {establishment.instagram && <p><strong>Instagram:</strong> {establishment.instagram}</p>}
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleApproval(establishment.id, true)}
              disabled={actionLoading === establishment.id}
            >
              <Check className="h-4 w-4 mr-1" />
              {actionLoading === establishment.id ? 'Aprovando...' : 'Aprovar'}
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              className="flex-1"
              onClick={() => handleApproval(establishment.id, false)}
              disabled={actionLoading === establishment.id}
            >
              <X className="h-4 w-4 mr-1" />
              Rejeitar
            </Button>
          </div>
        )}
        
        {!showActions && establishment.is_approved && (
          <div className="flex gap-2">
            {establishment.phone && (
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Ligar
              </Button>
            )}
            {establishment.whatsapp && (
              <Button size="sm" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Painel Administrativo</CardTitle>
            <CardDescription className="text-center">
              Gerencie os estabelecimentos da plataforma Barzinhos
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Pendentes ({pendingEstablishments.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Aprovados ({approvedEstablishments.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Estabelecimentos Pendentes de Aprovação</h3>
              <p className="text-gray-600">Revise e aprove os novos cadastros</p>
            </div>
            
            {pendingEstablishments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhum estabelecimento pendente de aprovação.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingEstablishments.map(establishment => (
                  <EstablishmentCard 
                    key={establishment.id} 
                    establishment={establishment} 
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Estabelecimentos Aprovados</h3>
              <p className="text-gray-600">Estabelecimentos ativos na plataforma</p>
            </div>
            
            {approvedEstablishments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhum estabelecimento aprovado ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedEstablishments.map(establishment => (
                  <EstablishmentCard 
                    key={establishment.id} 
                    establishment={establishment} 
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminPanel

