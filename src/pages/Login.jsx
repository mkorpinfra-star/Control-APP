import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Icons
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const FingerprintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
        <path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2" />
        <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
        <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
        <path d="M8.65 22c.21-.66.45-1.32.57-2" />
        <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
        <path d="M2 16h.01" />
        <path d="M21.8 16c.2-2 .131-5.354 0-6" />
        <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" />
    </svg>
);

export default function Login() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [passport, setPassport] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [canUseBiometric, setCanUseBiometric] = useState(false);
    const [savedCredentials, setSavedCredentials] = useState(null);

    // Carregar credenciais salvas ao montar
    useEffect(() => {
        // Verifica se há credenciais salvas
        const saved = localStorage.getItem('savedCredentials');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSavedCredentials(parsed);
                setPassport(parsed.passport);
                setRememberMe(true);
            } catch (e) {
                localStorage.removeItem('savedCredentials');
            }
        }

        // Verifica se o navegador suporta Web Credentials API
        if (window.PasswordCredential || window.PublicKeyCredential) {
            setCanUseBiometric(true);
        }
    }, []);

    // Tentar login automático com credenciais salvas
    const tryBiometricLogin = async () => {
        if (!savedCredentials) return;

        setLoading(true);
        setError('');

        const result = await login(savedCredentials.passport, savedCredentials.password);

        if (result.success) {
            navigate('/');
        } else {
            setError(t('auth.loginError'));
            // Limpar credenciais inválidas
            localStorage.removeItem('savedCredentials');
            setSavedCredentials(null);
        }

        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(passport, password);

        if (result.success) {
            // Salvar credenciais se "Lembrar-me" estiver ativado
            if (rememberMe) {
                localStorage.setItem('savedCredentials', JSON.stringify({
                    passport,
                    password
                }));
            } else {
                localStorage.removeItem('savedCredentials');
            }
            navigate('/');
        } else {
            setError(t('auth.loginError'));
        }

        setLoading(false);
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(255,255,255,0.03) 35px,
            rgba(255,255,255,0.03) 70px
          )`
                }}></div>
            </div>

            {/* Language Selector */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                    onClick={() => changeLanguage('es')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${i18n.language === 'es'
                        ? 'bg-[#CE0201] text-white'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-zinc-500'
                        }`}
                >
                    ES
                </button>
                <button
                    onClick={() => changeLanguage('ca')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${i18n.language === 'ca'
                        ? 'bg-[#CE0201] text-white'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-zinc-500'
                        }`}
                >
                    CA
                </button>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                {/* Logo J2S */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3">
                        <span
                            className="text-5xl font-bold tracking-tight"
                            style={{ color: '#CE0201', letterSpacing: '-2px' }}
                        >
                            J2S
                        </span>
                        <div className="flex flex-col text-left">
                            <span className="text-white text-xl font-light tracking-wide">Enginyeria</span>
                            <span className="text-zinc-500 text-sm tracking-wide">& Instal·lacions</span>
                        </div>
                    </div>
                </div>

                {/* Subtitle */}
                <p className="text-center text-zinc-400 text-sm mb-8">
                    {t('auth.welcome')}
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
                    {/* Quick Login Button - Se há credenciais salvas */}
                    {savedCredentials && (
                        <div className="mb-6">
                            <button
                                onClick={tryBiometricLogin}
                                disabled={loading}
                                className="w-full py-4 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-3 border border-zinc-700"
                            >
                                <FingerprintIcon />
                                <div className="text-left">
                                    <div className="text-sm font-medium">{t('auth.quickLogin') || 'Acceso rápido'}</div>
                                    <div className="text-xs text-zinc-400">{savedCredentials.passport}</div>
                                </div>
                            </button>
                            <div className="text-center mt-3">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('savedCredentials');
                                        setSavedCredentials(null);
                                        setPassport('');
                                        setRememberMe(false);
                                    }}
                                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {t('auth.useAnother') || 'Usar otra cuenta'}
                                </button>
                            </div>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-zinc-900 text-zinc-500">{t('auth.or') || 'o'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg p-3 flex items-center gap-3 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Passport Field */}
                        <div>
                            <label htmlFor="passport" className="block text-sm font-medium text-zinc-300 mb-2">
                                {t('auth.passport')}
                            </label>
                            <input
                                id="passport"
                                type="text"
                                value={passport}
                                onChange={(e) => setPassport(e.target.value.toUpperCase())}
                                className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#CE0201] transition-colors text-base"
                                placeholder="ABC123456"
                                required
                                autoComplete="username"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                                {t('auth.password')}
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#CE0201] transition-colors pr-12 text-base"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setRememberMe(!rememberMe)}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe
                                        ? 'bg-[#CE0201] border-[#CE0201]'
                                        : 'bg-transparent border-zinc-600 hover:border-zinc-500'
                                    }`}
                            >
                                {rememberMe && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                            <label
                                onClick={() => setRememberMe(!rememberMe)}
                                className="text-sm text-zinc-400 cursor-pointer select-none"
                            >
                                {t('auth.rememberMe') || 'Recordar mis datos'}
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-[#CE0201] hover:bg-[#a50101] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('app.loading')}
                                </>
                            ) : (
                                t('auth.loginButton')
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8 pt-6 border-t border-zinc-800">
                        <p className="text-center text-zinc-600 text-xs">
                            Sistema de Control Horario
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center relative z-10">
                <p className="text-zinc-600 text-xs">
                    © {new Date().getFullYear()} J2S Enginyeria & Instal·lacions
                </p>
            </div>
        </div>
    );
}
