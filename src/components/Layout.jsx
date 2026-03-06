import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    HardHat,
    Building2,
    CheckSquare,
    Settings,
    LogOut,
    Menu,
    X,
    Clock,
    TrendingUp,
    FileText,
    DollarSign,
    BarChart3,
    ClipboardList
} from 'lucide-react';

export default function Layout() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, logout, isEmployee, isSupervisor, isAdmin } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    // Itens de navegação baseados no tipo de usuário
    const getNavItems = () => {
        if (isAdmin) {
            return [
                { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { to: '/financial', icon: TrendingUp, label: 'Dashboard Financiero' },
                { to: '/approved-financial', icon: CheckSquare, label: 'Aprovados c/ Valores' },
                { to: '/payroll', icon: FileText, label: 'Folha de Pagamento' },
                { to: '/billing', icon: DollarSign, label: 'Faturamento' },
                { to: '/resumo-obra', icon: ClipboardList, label: 'Resumo da Obra' },
                { to: '/employees', icon: Users, label: 'Empleados' },
                { to: '/clients', icon: Building2, label: 'Clientes' },
                { to: '/projects', icon: HardHat, label: 'Obras' },
                { to: '/approvals', icon: CheckSquare, label: 'Aprobaciones' },
                { to: '/analytics-advanced', icon: BarChart3, label: 'Analytics Avanzado' },
                { to: '/settings', icon: Settings, label: 'Configuración' }
            ];
        }
        if (isSupervisor) {
            return [
                { to: '/approvals', icon: CheckSquare, label: t('nav.approvals') }
            ];
        }
        return [
            { to: '/bater-ponto', icon: Clock, label: 'Bater Ponto' }
        ];
    };

    const navItems = getNavItems();
    const userRole = isAdmin ? 'Admin' : (isSupervisor ? 'Encargado' : 'Empleado');

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">J2S</span>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900">ENGINYERIA</div>
                            <div className="text-xs text-gray-500">System Control</div>
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                                {user?.nome?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{user?.nome || 'Administrador'}</div>
                            <div className="text-xs text-gray-500">{userRole}</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={20} className={isActive ? 'text-red-600' : 'text-gray-500'} />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 space-y-3">
                    <div className="flex gap-2">
                        <button
                            onClick={() => changeLanguage('es')}
                            className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                                i18n.language === 'es'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            ES
                        </button>
                        <button
                            onClick={() => changeLanguage('ca')}
                            className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                                i18n.language === 'ca'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            CA
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">J2S</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">ENGINYERIA</span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu */}
            <div
                className={`md:hidden fixed top-0 right-0 bottom-0 w-72 bg-white z-50 transform transition-transform duration-300 ${
                    mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">J2S</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">ENGINYERIA</span>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                                {user?.nome?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{user?.nome}</div>
                            <div className="text-xs text-gray-500">{userRole}</div>
                        </div>
                    </div>
                </div>

                <nav className="p-3 flex-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 mb-1 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-red-50 text-red-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={20} className={isActive ? 'text-red-600' : 'text-gray-500'} />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 space-y-3 pb-safe">
                    <div className="flex gap-2">
                        <button
                            onClick={() => changeLanguage('es')}
                            className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg ${
                                i18n.language === 'es'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            ES
                        </button>
                        <button
                            onClick={() => changeLanguage('ca')}
                            className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg ${
                                i18n.language === 'ca'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            CA
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium mb-4"
                    >
                        <LogOut size={16} />
                        <span>Cerrar sesión</span>
                    </button>
                    {/* Espaço extra para barra de navegação Android */}
                    <div className="h-8" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile spacing */}
                <div className="md:hidden h-16" />

                {/* Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
