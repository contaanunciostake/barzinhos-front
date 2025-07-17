import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Check, 
  X, 
  Star, 
  Crown, 
  Zap,
  CreditCard,
  Shield,
  Sparkles
} from 'lucide-react';
import { planService } from '../lib/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const Plans = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Mutation para assinar plano
  const subscribeMutation = useMutation({
    mutationFn: (planId) => planService.subscribe(planId),
    onSuccess: (data) => {
      updateUser(data.user);
      setLoading(false);
      showSuccessToast('Plano assinado com sucesso!');
    },
    onError: (error) => {
      setLoading(false);
      showErrorToast(error.response?.data?.error || 'Erro ao assinar plano');
    },
  });

  const handleSubscribe = (planId) => {
    setLoading(true);
    subscribeMutation.mutate(planId);
  };

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Ideal para começar',
      icon: Shield,
      color: 'bg-gray-500',
      features: [
        { text: 'Cadastro básico do estabelecimento', included: true },
        { text: 'Até 3 fotos', included: true },
        { text: 'Informações básicas de contato', included: true },
        { text: 'Listagem no diretório', included: true },
        { text: 'Suporte por email', included: true },
        { text: 'Destaque na busca', included: false },
        { text: 'Fotos ilimitadas', included: false },
        { text: 'Analytics avançado', included: false },
        { text: 'Suporte prioritário', included: false },
        { text: 'Badge premium', included: false },
      ],
      limitations: [
        'Máximo 3 fotos por estabelecimento',
        'Sem destaque nos resultados de busca',
        'Suporte limitado'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 29,90',
      period: '/mês',
      description: 'Para estabelecimentos em crescimento',
      icon: Star,
      color: 'bg-blue-500',
      popular: true,
      features: [
        { text: 'Tudo do plano Gratuito', included: true },
        { text: 'Fotos ilimitadas', included: true },
        { text: 'Destaque moderado na busca', included: true },
        { text: 'Analytics básico', included: true },
        { text: 'Suporte por chat', included: true },
        { text: 'Badge premium', included: true },
        { text: 'Prioridade máxima', included: false },
        { text: 'Analytics avançado', included: false },
        { text: 'Suporte 24/7', included: false },
        { text: 'Badge VIP', included: false },
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 'R$ 59,90',
      period: '/mês',
      description: 'Para estabelecimentos de destaque',
      icon: Crown,
      color: 'bg-yellow-500',
      features: [
        { text: 'Tudo do plano Premium', included: true },
        { text: 'Prioridade máxima na busca', included: true },
        { text: 'Analytics avançado', included: true },
        { text: 'Suporte prioritário 24/7', included: true },
        { text: 'Badge VIP exclusivo', included: true },
        { text: 'Promoções destacadas', included: true },
        { text: 'Relatórios personalizados', included: true },
        { text: 'Consultoria de marketing', included: true },
        { text: 'API personalizada', included: true },
        { text: 'Gerente de conta dedicado', included: true },
      ]
    }
  ];

  const getCurrentPlan = () => {
    if (!user?.subscription) return 'free';
    return user.subscription.plan_id;
  };

  const isCurrentPlan = (planId) => {
    return getCurrentPlan() === planId;
  };

  const canUpgrade = (planId) => {
    const currentPlan = getCurrentPlan();
    const planOrder = ['free', 'premium', 'vip'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(planId);
    return targetIndex > currentIndex;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Você precisa estar logado para ver os planos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Escolha o Plano Ideal para seu Estabelecimento
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Aumente a visibilidade do seu negócio e atraia mais clientes com nossos planos especializados
        </p>
      </div>

      {user.subscription && (
        <div className="mb-8">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              Você está atualmente no plano <strong>{plans.find(p => p.id === getCurrentPlan())?.name}</strong>.
              {user.subscription.expires_at && (
                <span> Válido até {new Date(user.subscription.expires_at).toLocaleDateString('pt-BR')}.</span>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = isCurrentPlan(plan.id);
          const canUpgradeToThis = canUpgrade(plan.id);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''} ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Mais Popular
                </Badge>
              )}
              
              {isCurrent && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
                  Plano Atual
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Limitações:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index}>• {limitation}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-6">
                    {isCurrent ? (
                      <Button disabled className="w-full">
                        <Check className="h-4 w-4 mr-2" />
                        Plano Atual
                      </Button>
                    ) : canUpgradeToThis ? (
                      <Button 
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={loading}
                        className="w-full"
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        {plan.id === 'free' ? 'Escolher Gratuito' : 'Assinar Agora'}
                      </Button>
                    ) : (
                      <Button disabled className="w-full" variant="outline">
                        Plano Inferior
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          Todos os planos incluem suporte técnico e atualizações gratuitas
        </p>
        <p className="text-sm text-gray-500">
          Os pagamentos são processados de forma segura. Cancele a qualquer momento.
        </p>
      </div>
    </div>
  );
};

export default Plans;

