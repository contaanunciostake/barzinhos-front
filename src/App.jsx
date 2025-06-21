import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Star, Clock, Filter, Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import EstablishmentRegistration from './components/EstablishmentRegistration.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import './App.css'

// Componente principal da página inicial
const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Todos')
  const [selectedType, setSelectedType] = useState('Todos')
  const [showFilters, setShowFilters] = useState(false)
  const [establishments, setEstablishments] = useState([])
  const [neighborhoods, setNeighborhoods] = useState(['Todos'])
  const [types, setTypes] = useState(['Todos'])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  // Buscar estabelecimentos da API
  useEffect(() => {
    fetchEstablishments()
    fetchNeighborhoods()
    fetchTypes()
  }, [])

  const fetchEstablishments = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedNeighborhood !== 'Todos') params.append('neighborhood', selectedNeighborhood)
      if (selectedType !== 'Todos') params.append('type', selectedType)
      
      const response = await fetch(`http://localhost:5000/api/establishments?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setEstablishments(data.data)
      }
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNeighborhoods = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/neighborhoods')
      const data = await response.json()
      if (data.success) {
        setNeighborhoods(['Todos', ...data.data])
      }
    } catch (error) {
      console.error('Erro ao buscar bairros:', error)
    }
  }

  const fetchTypes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/types')
      const data = await response.json()
      if (data.success) {
        setTypes(['Todos', ...data.data])
      }
    } catch (error) {
      console.error('Erro ao buscar tipos:', error)
    }
  }

  // Refazer busca quando filtros mudarem
  useEffect(() => {
    if (!loading) {
      fetchEstablishments()
    }
  }, [searchTerm, selectedNeighborhood, selectedType])

  const handleWhatsApp = (whatsapp, name) => {
    const message = `Olá! Encontrei vocês no Barzinhos e gostaria de saber mais sobre o ${name}.`
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando estabelecimentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-orange-600">🍻 Barzinhos</Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-orange-600 transition-colors">Início</Link>
              <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors">Mapa</a>
              <Link to="/cadastrar" className="text-gray-700 hover:text-orange-600 transition-colors">Cadastrar Bar</Link>
              <Link to="/admin" className="text-gray-700 hover:text-orange-600 transition-colors">Admin</Link>
              <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors">Contato</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Descubra os melhores bares da sua cidade
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Encontre o lugar perfeito para relaxar, comer bem e se divertir
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por nome ou tipo de estabelecimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg bg-white text-gray-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            
            {showFilters && (
              <>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {neighborhoods.map(neighborhood => (
                    <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                  ))}
                </select>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </>
            )}
            
            <div className="text-sm text-gray-600">
              {establishments.length} estabelecimentos encontrados
            </div>
          </div>
        </div>
      </section>

      {/* Establishments Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {establishments.map(establishment => (
            <Card key={establishment.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{establishment.type}</Badge>
                  <div className="flex gap-2">
                    {establishment.phone && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={() => handleCall(establishment.phone)}
                      >
                        <Phone className="h-4 w-4" />
                        Ligar
                      </Button>
                    )}
                    {establishment.whatsapp && (
                      <Button 
                        size="sm" 
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleWhatsApp(establishment.whatsapp, establishment.name)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
                <Button className="w-full mt-3" variant="outline">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {establishments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum estabelecimento encontrado com os filtros selecionados.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">🍻 Barzinhos</h3>
              <p className="text-gray-300">
                Conectando você aos melhores bares e restaurantes da sua cidade.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><Link to="/cadastrar" className="hover:text-white transition-colors">Cadastrar Estabelecimento</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-300">
                <li>contato@barzinhos.com.br</li>
                <li>(11) 99999-9999</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Barzinhos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cadastrar" element={<EstablishmentRegistration onBack={() => window.history.back()} />} />
        <Route path="/admin" element={<AdminPanel onBack={() => window.history.back()} />} />
      </Routes>
    </Router>
  )
}

export default App

