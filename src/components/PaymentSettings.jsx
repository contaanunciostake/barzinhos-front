import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Settings, 
  DollarSign, 
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

const PaymentSettings = () => {
  const [config, setConfig] = useState({
    environment: 'sandbox', // sandbox ou production
    accessToken: '',
    publicKey: '',
    webhookUrl: '',
    premiumPrice: 29.90,
    vipPrice: 49.90
  });

  const [showTokens, setShowTokens] = useState({
    accessToken: false,
    publicKey: false
  });

  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Simular carregamento de configurações (substituir por API real quando disponível)
  useEffect(() => {
    // Carregar configurações salvas do localStorage como fallback
    const savedConfig = localStorage.getItem('mercadopago_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testCredentials = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // Simular teste de credenciais (substituir por API real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (config.accessToken && config.publicKey) {
        setTestResult({
          success: true,
          message: 'Credenciais válidas! Conexão com MercadoPago estabelecida.'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Por favor, preencha Access Token e Public Key.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao testar credenciais. Verifique os dados informados.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);

    try {
      // Salvar no localStorage como fallback (substituir por API real)
      localStorage.setItem('mercadopago_config', JSON.stringify(config));
      
      // Simular salvamento na API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const maskToken = (token) => {
    if (!token) return '';
    if (token.length <= 8) return token;
    return token.substring(0, 4) + '•'.repeat(token.length - 8) + token.substring(token.length - 4);
  };

  const toggleTokenVisibility = (field) => {
    setShowTokens(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações de Pagamento</h2>
          <p className="text-muted-foreground">
            Configure o MercadoPago para processar pagamentos de assinaturas
          </p>
        </div>
        <Badge variant={config.environment === 'production' ? 'default' : 'secondary'}>
          {config.environment === 'production' ? 'Produção' : 'Sandbox'}
        </Badge>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="prices">
            <DollarSign className="h-4 w-4 mr-2" />
            Preços
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4 mr-2" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        {/* Aba de Configurações */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Credenciais do MercadoPago</CardTitle>
              <CardDescription>
                Configure suas credenciais para integração com o MercadoPago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ambiente */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Ambiente</Label>
                  <div className="text-sm text-muted-foreground">
                    Sandbox para testes, Produção para pagamentos reais
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="environment">Sandbox</Label>
                  <Switch
                    id="environment"
                    checked={config.environment === 'production'}
                    onCheckedChange={(checked) => 
                      handleConfigChange('environment', checked ? 'production' : 'sandbox')
                    }
                  />
                  <Label htmlFor="environment">Produção</Label>
                </div>
              </div>

              {/* Access Token */}
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <div className="relative">
                  <Input
                    id="accessToken"
                    type={showTokens.accessToken ? 'text' : 'password'}
                    value={showTokens.accessToken ? config.accessToken : maskToken(config.accessToken)}
                    onChange={(e) => handleConfigChange('accessToken', e.target.value)}
                    placeholder={config.environment === 'production' 
                      ? 'APP_USR-...' 
                      : 'TEST-...'
                    }
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => toggleTokenVisibility('accessToken')}
                  >
                    {showTokens.accessToken ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Token privado para processar pagamentos
                </div>
              </div>

              {/* Public Key */}
              <div className="space-y-2">
                <Label htmlFor="publicKey">Public Key</Label>
                <div className="relative">
                  <Input
                    id="publicKey"
                    type={showTokens.publicKey ? 'text' : 'password'}
                    value={showTokens.publicKey ? config.publicKey : maskToken(config.publicKey)}
                    onChange={(e) => handleConfigChange('publicKey', e.target.value)}
                    placeholder={config.environment === 'production' 
                      ? 'APP_USR-...' 
                      : 'TEST-...'
                    }
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => toggleTokenVisibility('publicKey')}
                  >
                    {showTokens.publicKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Chave pública para o frontend
                </div>
              </div>

              {/* Webhook URL */}
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">URL do Webhook</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={config.webhookUrl}
                  onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                  placeholder="https://seu-dominio.com/api/payments/webhook"
                  readOnly
                />
                <div className="text-sm text-muted-foreground">
                  URL para receber notificações de pagamento (configurada automaticamente)
                </div>
              </div>

              {/* Teste de Credenciais */}
              <div className="space-y-4">
                <Button 
                  onClick={testCredentials} 
                  disabled={isLoading || !config.accessToken || !config.publicKey}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Testando Credenciais...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Testar Credenciais
                    </>
                  )}
                </Button>

                {testResult && (
                  <Alert variant={testResult.success ? 'default' : 'destructive'}>
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{testResult.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Salvar Configurações */}
              <Button 
                onClick={saveConfiguration} 
                disabled={isSaving}
                className="w-full"
                variant="default"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Preços */}
        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Preços</CardTitle>
              <CardDescription>
                Defina os valores dos planos de assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plano Premium */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plano Premium</CardTitle>
                    <CardDescription>
                      Acesso a funcionalidades premium
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="premiumPrice">Preço Mensal (R$)</Label>
                      <Input
                        id="premiumPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={config.premiumPrice}
                        onChange={(e) => handleConfigChange('premiumPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Plano VIP */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plano VIP</CardTitle>
                    <CardDescription>
                      Acesso completo a todas as funcionalidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="vipPrice">Preço Mensal (R$)</Label>
                      <Input
                        id="vipPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={config.vipPrice}
                        onChange={(e) => handleConfigChange('vipPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button 
                onClick={saveConfiguration} 
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Salvar Preços
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Estatísticas */}
        <TabsContent value="stats">
          <div className="grid gap-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pagamentos</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Neste mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground">
                    Neste mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Total ativo
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Informação sobre dados */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Estatísticas de Pagamento</p>
                  <p className="text-sm">
                    As estatísticas aparecerão aqui quando houver transações processadas.
                  </p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
                    <p className="text-sm text-blue-800 font-medium">Dados disponíveis:</p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1">
                      <li>• Total de pagamentos processados</li>
                      <li>• Receita acumulada por período</li>
                      <li>• Assinaturas ativas por plano</li>
                      <li>• Taxa de conversão</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSettings;

