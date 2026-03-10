import { useNavigate } from 'react-router-dom';
import { IconCheck, IconX } from '@tabler/icons-react';

export default function LandingPricing() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Trial',
      price: 'Grátis',
      period: '14 dias',
      description: 'Teste todas as funcionalidades sem compromisso',
      features: [
        { text: 'Até 5 funcionários', included: true },
        { text: 'Até 2 obras ativas', included: true },
        { text: 'Registro de horas', included: true },
        { text: 'Aprovações', included: true },
        { text: 'Relatórios básicos', included: true },
        { text: 'Suporte por email', included: true },
        { text: 'App mobile', included: false },
        { text: 'Folha de pagamento', included: false },
        { text: 'Faturamento', included: false },
        { text: 'Customização de marca', included: false }
      ],
      cta: 'Começar Grátis',
      highlight: false
    },
    {
      name: 'Starter',
      price: '€49',
      period: '/mês',
      description: 'Para pequenas construtoras em crescimento',
      features: [
        { text: 'Até 20 funcionários', included: true },
        { text: 'Até 10 obras ativas', included: true },
        { text: 'Registro de horas', included: true },
        { text: 'Aprovações', included: true },
        { text: 'Relatórios completos', included: true },
        { text: 'Suporte prioritário', included: true },
        { text: 'App mobile', included: true },
        { text: 'Folha de pagamento', included: true },
        { text: 'Faturamento', included: true },
        { text: 'Customização de marca', included: false }
      ],
      cta: 'Assinar Agora',
      highlight: true
    },
    {
      name: 'Professional',
      price: '€99',
      period: '/mês',
      description: 'Para construtoras consolidadas',
      features: [
        { text: 'Funcionários ilimitados', included: true },
        { text: 'Obras ilimitadas', included: true },
        { text: 'Registro de horas', included: true },
        { text: 'Aprovações', included: true },
        { text: 'Análises avançadas', included: true },
        { text: 'Suporte 24/7', included: true },
        { text: 'App mobile', included: true },
        { text: 'Folha de pagamento', included: true },
        { text: 'Faturamento', included: true },
        { text: 'Customização de marca', included: true }
      ],
      cta: 'Assinar Agora',
      highlight: false
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      period: '',
      description: 'Soluções personalizadas para grandes empresas',
      features: [
        { text: 'Tudo do Professional', included: true },
        { text: 'Suporte dedicado', included: true },
        { text: 'Onboarding personalizado', included: true },
        { text: 'Integrações customizadas', included: true },
        { text: 'SLA garantido', included: true },
        { text: 'Treinamento da equipe', included: true },
        { text: 'Consultoria de processos', included: true },
        { text: 'Relatórios personalizados', included: true },
        { text: 'Multi-empresa', included: true },
        { text: 'API access completo', included: true }
      ],
      cta: 'Falar com Vendas',
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#CE0201] rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">PuntoClicks</span>
            </button>

            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </button>
              <button onClick={() => navigate('/login')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Entrar
              </button>
              <button onClick={() => navigate('/signup')} className="px-4 py-2 bg-[#CE0201] text-white rounded-xl text-sm font-semibold hover:bg-[#A00101] transition-colors">
                Começar Grátis
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-br from-[#CE0201] to-[#A00101] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6" style={{ letterSpacing: '0.02em' }}>
            Planos e Preços
          </h1>
          <p className="text-xl opacity-90">
            Escolha o plano ideal para sua construtora. Comece grátis e evolua conforme cresce.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`rounded-2xl p-8 border-2 ${plan.highlight ? 'border-[#CE0201] bg-[#CE0201] bg-opacity-5 relative' : 'border-gray-200 bg-white'}`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#CE0201] text-white text-xs font-bold rounded-full">
                    MAIS POPULAR
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-6 min-h-[40px]">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                </div>

                <button
                  onClick={() => navigate('/signup')}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all mb-8 ${plan.highlight ? 'bg-[#CE0201] text-white hover:bg-[#A00101]' : 'bg-[#F5F5F5] text-gray-900 hover:bg-gray-200'}`}
                >
                  {plan.cta}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {feature.included ? (
                        <IconCheck size={20} className="text-[#CE0201] shrink-0 mt-0.5" strokeWidth={2} />
                      ) : (
                        <IconX size={20} className="text-gray-300 shrink-0 mt-0.5" strokeWidth={2} />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#F5F5F5] px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Perguntas Frequentes</h2>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Posso mudar de plano depois?</h3>
              <p className="text-gray-600">Sim! Você pode fazer upgrade ou downgrade a qualquer momento. As mudanças entram em vigor no próximo ciclo de faturamento.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">O que acontece após o trial?</h3>
              <p className="text-gray-600">Após 14 dias, você pode escolher um plano pago ou sua conta será suspensa. Seus dados ficam salvos por 30 dias.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Preciso de cartão de crédito para o trial?</h3>
              <p className="text-gray-600">Não! O trial é 100% grátis e não exige cartão de crédito.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Como funciona o suporte?</h3>
              <p className="text-gray-600">Trial e Starter: suporte por email (resposta em até 24h). Professional: suporte prioritário (até 4h). Enterprise: suporte dedicado 24/7.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600">Sim! Não há fidelidade. Cancele quando quiser sem custos adicionais.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#CE0201] to-[#A00101] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-xl mb-8 opacity-90">14 dias grátis • Sem cartão de crédito • Cancele quando quiser</p>
          <button onClick={() => navigate('/signup')} className="px-8 py-4 bg-white text-[#CE0201] rounded-xl text-base font-semibold hover:bg-gray-100 transition-all hover:scale-105 active:scale-95">
            Começar Grátis Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#CE0201] rounded-lg"></div>
                <span className="text-xl font-bold">PuntoClicks</span>
              </div>
              <p className="text-sm text-gray-400">Controle de horas para construtoras modernas</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">Preços</button></li>
                <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Começar Grátis</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 PuntoClicks. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
