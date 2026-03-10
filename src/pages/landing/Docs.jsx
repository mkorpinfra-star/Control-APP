import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconBook, IconUsers, IconCode, IconDatabase, IconShield, IconChartLine } from '@tabler/icons-react';

export default function Documentation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="w-[92%] lg:w-[85%] max-w-[1800px] mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <IconArrowLeft size={20} stroke={1.5} />
                <span>Voltar à landing</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <IconBook size={24} className="text-[#CE0201]" stroke={1.5} />
              <span className="font-bold text-gray-900">Documentação Técnica</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-20">
        <div className="w-[92%] lg:w-[85%] max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-12">
            {/* Título */}
            <div className="mb-12">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4" style={{fontFamily: 'IBM Plex Sans, Inter, sans-serif'}}>
                Documentação completa do sistema PuntoClicks
              </h1>
              <p className="text-lg text-gray-600">
                Versão 1.0 | Março 2026 | Guilherme Gomes | guilhermesites.com.br
              </p>
            </div>

            {/* Visão Geral */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{fontFamily: 'IBM Plex Sans, sans-serif'}}>
                🎯 Visão geral
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  O <strong>PuntoClicks</strong> é um sistema <strong>multi-tenant SaaS</strong> completo para gestão de horas, nóminas, facturação e obras em empresas de construção civil.
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">O que resolve</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-3">❌ Problema real:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Constructoras usam Excel para controlar horas → 15 horas/mês perdidas</li>
                      <li>• Erros de cálculo de CASS (impostos) → multas e problemas legais</li>
                      <li>• Zero visibilidade de custos reais por obra → prejuízo oculto</li>
                      <li>• Confusão entre o que funcionário diz vs o que encarregado confirma</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-3">✅ Solução:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Funcionário ficha horas desde app móbil</li>
                      <li>• Encarregado aprova com firma digital</li>
                      <li>• Sistema calcula <strong>AUTOMÁTICAMENTE</strong>: salários, CASS (6,5% + 15,5%), provisão férias, facturação, IGI</li>
                      <li>• Dashboard mostra margens de lucro REAIS por obra em tempo real</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Arquitectura */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{fontFamily: 'IBM Plex Sans, sans-serif'}}>
                📐 Arquitectura do sistema
              </h2>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Arquitectura de 3 níveis</h3>
                <div className="space-y-4 font-mono text-sm">
                  <div className="bg-white border border-gray-200 rounded p-4">
                    <div className="font-bold text-gray-900 mb-2">Landing Page (puntoclicks.com)</div>
                    <div className="text-gray-600">→ Copy de venda, screenshots, preço, FAQ</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded p-4">
                    <div className="font-bold text-gray-900 mb-2">Painel Admin Central (admin.puntoclicks.com)</div>
                    <div className="text-gray-600">→ Super Admin cria tenants (clientes)</div>
                    <div className="text-gray-600">→ Gestão multi-tenant</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded p-4">
                    <div className="font-bold text-gray-900 mb-2">App do Cliente (j2s.puntoclicks.com)</div>
                    <div className="text-gray-600">→ Cada cliente tem seu subdomínio</div>
                    <div className="text-gray-600">→ Admin do cliente gere suas obras/funcionários</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3">🔐 Como funciona o multi-tenant</h4>
                <p className="text-gray-700 mb-4"><strong>Tenant = Cliente que paga os €699/ano</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-bold text-gray-900 mb-2">Tenant 1: J2S Hores (j2s.puntoclicks.com)</p>
                    <ul className="space-y-1 text-gray-700">
                      <li>• 50 funcionários</li>
                      <li>• 15 obras activas</li>
                      <li>• 2 admins, 5 encarregados</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-2">Tenant 2: Construccions Andorra</p>
                    <ul className="space-y-1 text-gray-700">
                      <li>• 20 funcionários</li>
                      <li>• 8 obras activas</li>
                      <li>• 1 admin, 2 encarregados</li>
                    </ul>
                  </div>
                </div>
                <p className="text-gray-700 mt-4"><strong>Isolamento Total:</strong> Cada tenant vê APENAS seus dados. Base de dados: coluna <code className="bg-white px-2 py-1 rounded">tenant_id</code> em TODAS as tabelas.</p>
              </div>
            </section>

            {/* Módulos */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{fontFamily: 'IBM Plex Sans, sans-serif'}}>
                🎛️ Módulos do sistema
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: IconChartLine, title: 'Dashboard', desc: 'Visão global do negócio em tempo real' },
                  { icon: IconBriefcase, title: 'Gestão de obras', desc: 'Controle total de cada projeto' },
                  { icon: IconClock, title: 'Apontamentos', desc: 'Funcionário ficha, encarregado aprova' },
                  { icon: IconCalculator, title: 'Nómina', desc: 'Cálculo automático completo' },
                  { icon: IconFileInvoice, title: 'Facturação', desc: 'Margens de lucro visíveis' },
                  { icon: IconUsers, title: 'Funcionários', desc: 'Gestão de equipa' }
                ].map((module, i) => {
                  const Icon = module.icon;
                  return (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#CE0201] transition-colors">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                        <Icon size={24} className="text-[#CE0201]" stroke={1} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{module.title}</h3>
                      <p className="text-sm text-gray-600">{module.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Fluxo */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{fontFamily: 'IBM Plex Sans, sans-serif'}}>
                🔄 Fluxo completo do sistema
              </h2>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-xl p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#CE0201] text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Funcionário ficha horas</h4>
                      <p className="text-gray-700">App móbil, 10 segundos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#CE0201] text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Encarregado aprova</h4>
                      <p className="text-gray-700">Firma digital</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#CE0201] text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Admin/RH aprova</h4>
                      <p className="text-gray-700">Firma digital</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#CE0201] text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Sistema calcula AUTOMÁTICAMENTE</h4>
                      <ul className="text-gray-700 space-y-1 mt-2">
                        <li>• Nómina (salários + CASS 6,5% + 15,5% + provisão férias)</li>
                        <li>• Facturação (valor venda + IGI 4,5%)</li>
                        <li>• Margens de lucro por obra</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#CE0201] text-white rounded-full flex items-center justify-center font-bold shrink-0">5</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Admin vê dashboard</h4>
                      <p className="text-gray-700">"Obra X deu 2.265€ lucro (20,6%)"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#CE0201] text-white rounded-full flex items-center justify-center font-bold shrink-0">6</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Admin exporta Excel/PDF</h4>
                      <p className="text-gray-700">1 clic e envia ao cliente</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ROI */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{fontFamily: 'IBM Plex Sans, sans-serif'}}>
                💰 ROI para o cliente
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Investimento</h3>
                  <p className="text-5xl font-extrabold text-[#CE0201] mb-2">€699<span className="text-2xl text-gray-600">/ano</span></p>
                  <p className="text-gray-600">= 58€/mês</p>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Economias</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>14,5h/mês economizadas × valor hora admin (20-50€) = <strong>290-725€/mês</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Zero erros de CASS → zero multas <strong>(300-2000€ por erro)</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Visão de margens → evita obras com prejuízo <strong>(milhares €)</strong></span>
                    </li>
                  </ul>
                  <p className="text-green-900 font-bold mt-4 pt-4 border-t border-green-300">Payback: 1-2 meses</p>
                </div>
              </div>
            </section>

            {/* Tecnologias */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{fontFamily: 'IBM Plex Sans, sans-serif'}}>
                🚀 Stack técnica
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <IconCode size={20} stroke={1.5} className="text-[#CE0201]" />
                    Frontend
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• React 18 + Vite</li>
                    <li>• Tailwind CSS + DaisyUI</li>
                    <li>• React Router DOM</li>
                    <li>• Tabler Icons</li>
                    <li>• Framer Motion</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <IconDatabase size={20} stroke={1.5} className="text-[#CE0201]" />
                    Backend
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• PHP 8.1+</li>
                    <li>• MySQL 8.0+</li>
                    <li>• JWT Authentication</li>
                    <li>• PHPMailer (SMTP)</li>
                    <li>• Apache/Nginx</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contactos */}
            <section className="bg-gray-50 border border-gray-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'IBM Plex Sans, sans-serif'}}>
                📞 Contactos e suporte
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p><strong>Desenvolvedor:</strong> Guilherme Gomes</p>
                  <p><strong>Website:</strong> guilhermesites.com.br</p>
                </div>
                <div>
                  <p><strong>Email:</strong> contactes@j2s.ad</p>
                  <p><strong>Servidor:</strong> Hostinger VPS</p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
              <p className="text-sm">
                Última actualização: 9 Março 2026
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
