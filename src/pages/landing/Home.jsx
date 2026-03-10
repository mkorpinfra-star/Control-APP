import { Link } from 'react-router-dom';

export default function LandingHome() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header fixo - estilo Cloudflare mais fino */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="container mx-auto px-6 py-3 flex items-center justify-between max-w-[1400px]">
          <Link to="/" className="text-lg text-gray-900">
            <span className="font-bold">Punto</span>
            <span className="font-light tracking-wide">Clicks</span>
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Iniciar sessió
          </Link>
        </nav>
      </header>

      {/* Hero Section - alinhado com a logo */}
      <section className="flex-1 flex items-center bg-white">
        <div className="container mx-auto px-6 max-w-[1400px] py-20">
          <div className="max-w-[700px]">
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
              Gestió d'hores i obres simplificada
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Plataforma completa per al control d'apuntaments, obres i equips. Transforma la gestió de la teva empresa amb tecnologia professional.
            </p>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-8 py-3.5 bg-gray-900 text-white text-base font-medium rounded-md hover:bg-gray-800 transition-all duration-150"
              >
                Començar ara
              </Link>

              <Link
                to="/docs"
                className="px-8 py-3.5 bg-white border border-gray-300 text-gray-700 text-base font-medium rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-150"
              >
                Documentació
              </Link>
            </div>
          </div>

          {/* Features cards - alinhado com conteúdo */}
          <div className="grid md:grid-cols-3 gap-4 mt-20 max-w-[1200px]">
            <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-150">
              <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Control d'hores</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Registre precís d'apuntaments amb validació biométrica i geolocalització.</p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-150">
              <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestió d'obres</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Administra projectes, equips i recursos des d'un únic lloc centralitzat.</p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-150">
              <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Informes automàtics</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Genera nòmines, facturació i analítiques amb un sol clic.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
