import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Smartphone, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Shield,
  Star
} from 'lucide-react';

const PaymentPopup = ({ isOpen, onClose, plan, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  // Carregar SDK do MercadoPago
  useEffect(() => {
    if (isOpen && !window.MercadoPago) {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        // Inicializar MercadoPago com public key
        // Você deve configurar a public key nas configurações
        console.log('MercadoPago SDK carregado');
      };
      document.head.appendChild(script);
    }
  }, [isOpen]);

  const createPayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch('/api/plans/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: plan.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar pagamento');
      }

      if (plan.id === 'free') {
        // Plano gratuito - ativar imediatamente
        onSuccess && onSuccess(data.data);
        onClose();
        return;
      }

      // Para planos pagos, abrir checkout do MercadoPago
      setPaymentData(data.data);
      
      // Redirecionar para o checkout do MercadoPago
      if (data.data.sandbox_init_point) {
        window.open(data.data.sandbox_init_point, '_blank');
      } else if (data.data.init_point) {
        window.open(data.data.init_point, '_blank');
      }

    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      setError(error.message || 'Erro ao processar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'premium':
        return <Star className="h-6 w-6 text-yellow-500" />;
      case 'vip':
        return <Star className="h-6 w-6 text-purple-500" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPlanIcon(plan.id)}
            Assinar Plano {plan.name}
          </DialogTitle>
          <DialogDescription>
            Confirme os detalhes da sua assinatura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Detalhes do Plano */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Plano:</span>
              <Badge variant={plan.id === 'vip' ? 'default' : 'secondary'}>
                {plan.name}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Preço:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(plan.price)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Duração:</span>
              <span>{plan.duration}</span>
            </div>
          </div>

          {/* Recursos do Plano */}
          <div className="space-y-2">
            <h4 className="font-medium">Recursos inclusos:</h4>
            <ul className="space-y-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Métodos de Pagamento */}
          {plan.id !== 'free' && (
            <div className="space-y-3">
              <h4 className="font-medium">Métodos de pagamento disponíveis:</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs text-center">Cartão de Crédito</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <Smartphone className="h-6 w-6 text-green-500 mb-1" />
                  <span className="text-xs text-center">Cartão de Débito</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <QrCode className="h-6 w-6 text-purple-500 mb-1" />
                  <span className="text-xs text-center">PIX</span>
                </div>
              </div>
            </div>
          )}

          {/* Segurança */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Pagamento seguro processado pelo MercadoPago</span>
          </div>

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Informações do Pagamento */}
          {paymentData && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Redirecionando para o checkout do MercadoPago...
              </AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={createPayment}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {plan.id === 'free' ? 'Ativar Plano' : 'Pagar Agora'}
                </>
              )}
            </Button>
          </div>

          {/* Termos */}
          <p className="text-xs text-gray-500 text-center">
            Ao continuar, você concorda com nossos{' '}
            <a href="/terms" className="underline">Termos de Serviço</a> e{' '}
            <a href="/privacy" className="underline">Política de Privacidade</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentPopup;

