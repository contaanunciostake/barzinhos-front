import { useState } from 'react'
import { ArrowLeft, Upload, MapPin, Phone, Globe, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'

const EstablishmentRegistration = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    neighborhood: '',
    phone: '',
    whatsapp: '',
    type: '',
    website: '',
    instagram: '',
    latitude: '',
    longitude: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const neighborhoods = ["Vila Madalena", "Centro", "Pinheiros", "Itaim", "Moema", "Jardins", "Liberdade", "Bela Vista"]
  const types = ["Boteco", "Choperia", "Petiscaria", "Restaurante", "Bar", "Pub", "Lanchonete"]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch('https://barzinhos-api.onrender.com/api/establishments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          is_approved: false // Aguarda aprovação
        })
      })

      const result = await response.json()

      if (result.success) {
        setSubmitMessage('Cadastro realizado com sucesso! Aguarde a aprovação do administrador.')
        setFormData({
          name: '',
          description: '',
          address: '',
          neighborhood: '',
          phone: '',
          whatsapp: '',
          type: '',
          website: '',
          instagram: '',
          latitude: '',
          longitude: ''
        })
      } else {
        setSubmitMessage('Erro ao realizar cadastro: ' + result.error)
      }
    } catch (error) {
      setSubmitMessage('Erro ao conectar com o servidor: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Cadastrar Estabelecimento</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados do seu estabelecimento para aparecer na plataforma Barzinhos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Estabelecimento *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ex: Boteco do João"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Tipo *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva seu estabelecimento, ambiente, especialidades..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização
                </h3>
                
                <div>
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Rua, número, complemento"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Select value={formData.neighborhood} onValueChange={(value) => handleSelectChange('neighborhood', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o bairro" />
                    </SelectTrigger>
                    <SelectContent>
                      {neighborhoods.map(neighborhood => (
                        <SelectItem key={neighborhood} value={neighborhood}>{neighborhood}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude (opcional)</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="-23.5505"
                      type="number"
                      step="any"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="longitude">Longitude (opcional)</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="-46.6333"
                      type="number"
                      step="any"
                    />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contato
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="5511999999999"
                    />
                  </div>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Redes Sociais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://www.seusite.com.br"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="@seuestablecimento"
                    />
                  </div>
                </div>
              </div>

              {submitMessage && (
                <div className={`p-4 rounded-md ${submitMessage.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {submitMessage}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="px-8">
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar Estabelecimento'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EstablishmentRegistration

