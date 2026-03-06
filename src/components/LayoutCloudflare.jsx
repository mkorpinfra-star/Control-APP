import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
    ChartBarIcon,
    UsersIcon,
    BuildingIcon,
    CheckIcon,
    ClockIcon,
    SettingsIcon,
    FileTextIcon,
    TrendingUpIcon
} from './Icons';
import designSystem from '../styles/cloudflare-design';

const { colors, spacing, typography, borderRadius } = designSystem;

// Ícones do menu mobile
const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

export default function LayoutCloudflare() {
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
                { to: '/dashboard', icon: ChartBarIcon, label: 'Dashboard', badge: null },
                { to: '/financial', icon: TrendingUpIcon, label: 'Dashboard Financiero' },
                { to: '/approved-financial', icon: CheckIcon, label: 'Aprovados c/ Valores' },
                { to: '/payroll', icon: FileTextIcon, label: 'Folha de Pagamento' },
                { to: '/billing', icon: FileTextIcon, label: 'Faturamento' },
                { to: '/employees', icon: UsersIcon, label: t('nav.employees') },
                { to: '/clients', icon: BuildingIcon, label: 'Clientes' },
                { to: '/projects', icon: BuildingIcon, label: t('nav.projects') },
                { to: '/approvals', icon: CheckIcon, label: 'Aprobaciones' },
                { to: '/analytics', icon: TrendingUpIcon, label: 'Analytics' }
            ];
        }
        if (isSupervisor) {
            return [
                { to: '/approvals', icon: CheckIcon, label: t('nav.approvals') }
            ];
        }
        return [
            { to: '/timesheet', icon: ClockIcon, label: t('nav.timesheet') }
        ];
    };

    const navItems = getNavItems();
    const userRole = isAdmin ? 'Admin' : (isSupervisor ? (t('common.supervisor') || 'Encargado') : (t('common.employee') || 'Empleado'));

    // Styles Cloudflare
    const styles = {
        // Container principal
        container: {
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: colors.gray50,
            fontFamily: typography.fontFamily
        },

        // SIDEBAR DESKTOP
        sidebar: {
            width: '260px',
            backgroundColor: '#ffffff',
            borderRight: `1px solid ${colors.gray200}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: 40
        },

        // Logo
        logo: {
            padding: spacing['2xl'],
            borderBottom: `1px solid ${colors.gray200}`,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md
        },
        logoText: {
            fontSize: typography['2xl'],
            fontWeight: typography.bold,
            color: colors.primary,
            letterSpacing: '-0.5px'
        },
        logoSubtext: {
            fontSize: typography.xs,
            color: colors.gray500,
            fontWeight: typography.medium
        },

        // User profile in sidebar
        userProfile: {
            padding: spacing.lg,
            borderBottom: `1px solid ${colors.gray200}`,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md
        },
        userAvatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: colors.primary,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: typography.md,
            fontWeight: typography.bold,
            flexShrink: 0
        },
        userInfo: {
            flex: 1,
            minWidth: 0
        },
        userName: {
            fontSize: typography.base,
            fontWeight: typography.semibold,
            color: colors.gray900,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        userRole: {
            fontSize: typography.xs,
            color: colors.gray500,
            marginTop: '2px'
        },

        // Navigation
        nav: {
            flex: 1,
            padding: spacing.md,
            overflowY: 'auto'
        },
        navLink: {
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            padding: `${spacing.md} ${spacing.lg}`,
            borderRadius: borderRadius.md,
            fontSize: typography.base,
            fontWeight: typography.medium,
            color: colors.gray700,
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            marginBottom: spacing.xs,
            border: `1px solid transparent`
        },
        navLinkHover: {
            backgroundColor: colors.gray50,
            color: colors.gray900
        },
        navLinkActive: {
            backgroundColor: colors.primaryLight,
            color: colors.primary,
            border: `1px solid ${colors.primary}20`,
            fontWeight: typography.semibold
        },

        // Footer sidebar
        sidebarFooter: {
            padding: spacing.lg,
            borderTop: `1px solid ${colors.gray200}`
        },
        languageSelector: {
            display: 'flex',
            gap: spacing.xs,
            marginBottom: spacing.md
        },
        langButton: {
            flex: 1,
            padding: `${spacing.xs} ${spacing.sm}`,
            border: `1px solid ${colors.gray300}`,
            borderRadius: borderRadius.sm,
            backgroundColor: '#fff',
            fontSize: typography.xs,
            fontWeight: typography.medium,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
        },
        langButtonActive: {
            borderColor: colors.primary,
            backgroundColor: colors.primaryLight,
            color: colors.primary,
            fontWeight: typography.semibold
        },
        logoutButton: {
            width: '100%',
            padding: `${spacing.md} ${spacing.lg}`,
            border: `1px solid ${colors.gray300}`,
            borderRadius: borderRadius.md,
            backgroundColor: '#fff',
            fontSize: typography.base,
            fontWeight: typography.medium,
            color: colors.gray700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            transition: 'all 0.15s ease'
        },

        // MAIN CONTENT AREA
        mainContainer: {
            marginLeft: '260px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
        },
        contentWrapper: {
            flex: 1,
            padding: spacing['3xl'],
            maxWidth: '1600px',
            width: '100%',
            margin: '0 auto'
        },

        // MOBILE STYLES
        mobileHeader: {
            display: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            backgroundColor: '#fff',
            borderBottom: `1px solid ${colors.gray200}`,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${spacing.lg}`,
            zIndex: 50
        },
        mobileLogo: {
            fontSize: typography.xl,
            fontWeight: typography.bold,
            color: colors.primary
        },
        mobileMenuButton: {
            padding: spacing.sm,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: colors.gray700
        },
        mobileOverlay: {
            display: 'none',
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 45
        },
        mobileSidebar: {
            position: 'fixed',
            top: 0,
            right: 0,
            width: '280px',
            height: '100vh',
            backgroundColor: '#fff',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            zIndex: 50,
            display: 'none',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)'
        },
        mobileSidebarOpen: {
            transform: 'translateX(0)'
        }
    };

    // Mobile responsiveness with media queries
    const mobileStyles = `
        @media (max-width: 768px) {
            .desktop-sidebar { display: none !important; }
            .mobile-header { display: flex !important; }
            .mobile-sidebar { display: flex !important; }
            .mobile-overlay { display: block !important; }
            .main-container { margin-left: 0 !important; padding-top: 60px; }
            .content-wrapper { padding: ${spacing.lg} !important; }
        }
    `;

    return (
        <>
            <style>{mobileStyles}</style>

            <div style={styles.container}>
                {/* DESKTOP SIDEBAR */}
                <aside className="desktop-sidebar" style={styles.sidebar}>
                    {/* Logo */}
                    <div style={styles.logo}>
                        <div>
                            <div style={styles.logoText}>J2S</div>
                            <div style={styles.logoSubtext}>Enginyeria</div>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div style={styles.userProfile}>
                        <div style={styles.userAvatar}>
                            {user?.nome?.charAt(0) || 'U'}
                        </div>
                        <div style={styles.userInfo}>
                            <div style={styles.userName}>{user?.nome}</div>
                            <div style={styles.userRole}>{userRole}</div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav style={styles.nav}>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                style={({ isActive }) => ({
                                    ...styles.navLink,
                                    ...(isActive ? styles.navLinkActive : {})
                                })}
                                onMouseEnter={(e) => {
                                    if (!e.currentTarget.classList.contains('active')) {
                                        Object.assign(e.currentTarget.style, styles.navLinkHover);
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!e.currentTarget.classList.contains('active')) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = colors.gray700;
                                    }
                                }}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div style={styles.sidebarFooter}>
                        <div style={styles.languageSelector}>
                            <button
                                onClick={() => changeLanguage('es')}
                                style={{
                                    ...styles.langButton,
                                    ...(i18n.language === 'es' ? styles.langButtonActive : {})
                                }}
                            >
                                ES
                            </button>
                            <button
                                onClick={() => changeLanguage('ca')}
                                style={{
                                    ...styles.langButton,
                                    ...(i18n.language === 'ca' ? styles.langButtonActive : {})
                                }}
                            >
                                CA
                            </button>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={styles.logoutButton}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.gray50;
                                e.currentTarget.style.borderColor = colors.gray400;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fff';
                                e.currentTarget.style.borderColor = colors.gray300;
                            }}
                        >
                            <LogoutIcon />
                            Cerrar sesión
                        </button>
                    </div>
                </aside>

                {/* MOBILE HEADER */}
                <header className="mobile-header" style={styles.mobileHeader}>
                    <div style={styles.mobileLogo}>J2S</div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={styles.mobileMenuButton}
                    >
                        {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </header>

                {/* MOBILE OVERLAY */}
                {mobileMenuOpen && (
                    <div
                        className="mobile-overlay"
                        style={{...styles.mobileOverlay, display: 'block'}}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* MOBILE SIDEBAR */}
                <aside
                    className="mobile-sidebar"
                    style={{
                        ...styles.mobileSidebar,
                        ...(mobileMenuOpen ? styles.mobileSidebarOpen : {})
                    }}
                >
                    <div style={{...styles.logo, borderBottom: `1px solid ${colors.gray200}`}}>
                        <div>
                            <div style={styles.logoText}>J2S</div>
                            <div style={styles.logoSubtext}>Enginyeria</div>
                        </div>
                    </div>

                    <div style={styles.userProfile}>
                        <div style={styles.userAvatar}>
                            {user?.nome?.charAt(0) || 'U'}
                        </div>
                        <div style={styles.userInfo}>
                            <div style={styles.userName}>{user?.nome}</div>
                            <div style={styles.userRole}>{userRole}</div>
                        </div>
                    </div>

                    <nav style={styles.nav}>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setMobileMenuOpen(false)}
                                style={({ isActive }) => ({
                                    ...styles.navLink,
                                    ...(isActive ? styles.navLinkActive : {})
                                })}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div style={styles.sidebarFooter}>
                        <div style={styles.languageSelector}>
                            <button
                                onClick={() => changeLanguage('es')}
                                style={{
                                    ...styles.langButton,
                                    ...(i18n.language === 'es' ? styles.langButtonActive : {})
                                }}
                            >
                                ES
                            </button>
                            <button
                                onClick={() => changeLanguage('ca')}
                                style={{
                                    ...styles.langButton,
                                    ...(i18n.language === 'ca' ? styles.langButtonActive : {})
                                }}
                            >
                                CA
                            </button>
                        </div>
                        <button onClick={handleLogout} style={styles.logoutButton}>
                            <LogoutIcon />
                            {t('common.logout')}
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="main-container" style={styles.mainContainer}>
                    <div className="content-wrapper" style={styles.contentWrapper}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </>
    );
}
