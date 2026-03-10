import { useState, useEffect, useRef } from 'react';
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
    const lottieRef = useRef(null);

    const [passport, setPassport] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [canUseBiometric, setCanUseBiometric] = useState(false);
    const [savedCredentials, setSavedCredentials] = useState(null);

    // Carregar Lottie - animação de relógio com ponteiros girando
    useEffect(() => {
        const loadLottie = async () => {
            const lottie = await import('lottie-web');
            if (lottieRef.current) {
                const clockAnimation = {
                    "v": "5.7.4",
                    "fr": 60,
                    "ip": 0,
                    "op": 120,
                    "w": 200,
                    "h": 200,
                    "nm": "Clock Animation",
                    "ddd": 0,
                    "assets": [],
                    "layers": [
                        {
                            "ddd": 0,
                            "ind": 1,
                            "ty": 4,
                            "nm": "Circle Outline",
                            "sr": 1,
                            "ks": {
                                "o": {"a": 0, "k": 100},
                                "r": {"a": 0, "k": 0},
                                "p": {"a": 0, "k": [100, 100, 0]},
                                "a": {"a": 0, "k": [0, 0, 0]},
                                "s": {"a": 0, "k": [100, 100, 100]}
                            },
                            "ao": 0,
                            "shapes": [
                                {
                                    "ty": "gr",
                                    "it": [
                                        {
                                            "d": 1,
                                            "ty": "el",
                                            "s": {"a": 0, "k": [140, 140]},
                                            "p": {"a": 0, "k": [0, 0]}
                                        },
                                        {
                                            "ty": "st",
                                            "c": {"a": 0, "k": [1, 1, 1, 1]},
                                            "o": {"a": 0, "k": 100},
                                            "w": {"a": 0, "k": 6}
                                        },
                                        {
                                            "ty": "tr",
                                            "p": {"a": 0, "k": [0, 0]},
                                            "a": {"a": 0, "k": [0, 0]},
                                            "s": {"a": 0, "k": [100, 100]},
                                            "r": {"a": 0, "k": 0},
                                            "o": {"a": 0, "k": 100}
                                        }
                                    ]
                                }
                            ],
                            "ip": 0,
                            "op": 120,
                            "st": 0
                        },
                        {
                            "ddd": 0,
                            "ind": 2,
                            "ty": 4,
                            "nm": "Minute Hand",
                            "sr": 1,
                            "ks": {
                                "o": {"a": 0, "k": 100},
                                "r": {"a": 1, "k": [{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":0,"s":[0]},{"t":120,"s":[360]}]},
                                "p": {"a": 0, "k": [100, 100, 0]},
                                "a": {"a": 0, "k": [0, -30, 0]},
                                "s": {"a": 0, "k": [100, 100, 100]}
                            },
                            "ao": 0,
                            "shapes": [
                                {
                                    "ty": "gr",
                                    "it": [
                                        {
                                            "ty": "rc",
                                            "d": 1,
                                            "s": {"a": 0, "k": [5, 55]},
                                            "p": {"a": 0, "k": [0, 0]},
                                            "r": {"a": 0, "k": 2.5}
                                        },
                                        {
                                            "ty": "fl",
                                            "c": {"a": 0, "k": [1, 1, 1, 1]},
                                            "o": {"a": 0, "k": 100}
                                        },
                                        {
                                            "ty": "tr",
                                            "p": {"a": 0, "k": [0, 0]},
                                            "a": {"a": 0, "k": [0, 0]},
                                            "s": {"a": 0, "k": [100, 100]},
                                            "r": {"a": 0, "k": 0},
                                            "o": {"a": 0, "k": 100}
                                        }
                                    ]
                                }
                            ],
                            "ip": 0,
                            "op": 120,
                            "st": 0
                        },
                        {
                            "ddd": 0,
                            "ind": 3,
                            "ty": 4,
                            "nm": "Hour Hand",
                            "sr": 1,
                            "ks": {
                                "o": {"a": 0, "k": 100},
                                "r": {"a": 1, "k": [{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":0,"s":[0]},{"t":120,"s":[180]}]},
                                "p": {"a": 0, "k": [100, 100, 0]},
                                "a": {"a": 0, "k": [0, -20, 0]},
                                "s": {"a": 0, "k": [100, 100, 100]}
                            },
                            "ao": 0,
                            "shapes": [
                                {
                                    "ty": "gr",
                                    "it": [
                                        {
                                            "ty": "rc",
                                            "d": 1,
                                            "s": {"a": 0, "k": [6, 38]},
                                            "p": {"a": 0, "k": [0, 0]},
                                            "r": {"a": 0, "k": 3}
                                        },
                                        {
                                            "ty": "fl",
                                            "c": {"a": 0, "k": [1, 1, 1, 0.9]},
                                            "o": {"a": 0, "k": 100}
                                        },
                                        {
                                            "ty": "tr",
                                            "p": {"a": 0, "k": [0, 0]},
                                            "a": {"a": 0, "k": [0, 0]},
                                            "s": {"a": 0, "k": [100, 100]},
                                            "r": {"a": 0, "k": 0},
                                            "o": {"a": 0, "k": 100}
                                        }
                                    ]
                                }
                            ],
                            "ip": 0,
                            "op": 120,
                            "st": 0
                        },
                        {
                            "ddd": 0,
                            "ind": 4,
                            "ty": 4,
                            "nm": "Center Dot",
                            "sr": 1,
                            "ks": {
                                "o": {"a": 0, "k": 100},
                                "r": {"a": 0, "k": 0},
                                "p": {"a": 0, "k": [100, 100, 0]},
                                "a": {"a": 0, "k": [0, 0, 0]},
                                "s": {"a": 0, "k": [100, 100, 100]}
                            },
                            "ao": 0,
                            "shapes": [
                                {
                                    "ty": "gr",
                                    "it": [
                                        {
                                            "d": 1,
                                            "ty": "el",
                                            "s": {"a": 0, "k": [10, 10]},
                                            "p": {"a": 0, "k": [0, 0]}
                                        },
                                        {
                                            "ty": "fl",
                                            "c": {"a": 0, "k": [1, 1, 1, 1]},
                                            "o": {"a": 0, "k": 100}
                                        },
                                        {
                                            "ty": "tr",
                                            "p": {"a": 0, "k": [0, 0]},
                                            "a": {"a": 0, "k": [0, 0]},
                                            "s": {"a": 0, "k": [100, 100]},
                                            "r": {"a": 0, "k": 0},
                                            "o": {"a": 0, "k": 100}
                                        }
                                    ]
                                }
                            ],
                            "ip": 0,
                            "op": 120,
                            "st": 0
                        }
                    ]
                };

                lottie.default.loadAnimation({
                    container: lottieRef.current,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: clockAnimation
                });
            }
        };
        loadLottie();
    }, []);

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
            // Redirecionar baseado no tipo de usuário
            const userType = result.user?.tipo;
            if (userType === 'admin' || userType === 'super_admin') {
                navigate('/dashboard');
            } else if (userType === 'encarregado') {
                navigate('/approvals');
            } else {
                navigate('/bater-ponto');
            }
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

            // Redirecionar baseado no tipo de usuário
            const userType = result.user?.tipo;
            if (userType === 'admin' || userType === 'super_admin') {
                navigate('/dashboard');
            } else if (userType === 'encarregado') {
                navigate('/approvals');
            } else {
                navigate('/bater-ponto');
            }
        } else {
            setError(result.message || t('auth.loginError'));
        }

        setLoading(false);
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#CE0201] to-[#A00101] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Language Selector */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                    onClick={() => changeLanguage('es')}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${i18n.language === 'es'
                        ? 'bg-white text-[#CE0201] shadow-sm'
                        : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                        }`}
                >
                    ES
                </button>
                <button
                    onClick={() => changeLanguage('ca')}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${i18n.language === 'ca'
                        ? 'bg-white text-[#CE0201] shadow-sm'
                        : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                        }`}
                >
                    CA
                </button>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo - ITAU Style */}
                <div className="flex flex-col items-center mb-6 gap-3">
                    {/* J2S e Hores lado a lado */}
                    <div className="flex items-center gap-4">
                        {/* Ícone quadrado BRANCO com J2S VERMELHO */}
                        <div className="w-28 h-28 bg-white rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                            <span className="text-[5rem] text-[#CE0201] -tracking-[0.15em] leading-none -ml-1" style={{ fontFamily: 'IBM Plex Sans', fontWeight: 400 }}>
                                J2S
                            </span>
                        </div>

                        {/* Hores com Lottie - SEM fundo, texto branco */}
                        <div className="flex items-center gap-3">
                            <div ref={lottieRef} className="w-14 h-14" style={{filter: 'brightness(0) invert(1)'}}></div>
                            <span className="text-4xl text-white tracking-tight" style={{ fontFamily: 'IBM Plex Sans', fontWeight: 400 }}>Hores</span>
                        </div>
                    </div>

                    {/* by PuntoClicks.com - fora da logo */}
                    <div className="text-sm text-white/80 font-medium tracking-wide">
                        by <span className="font-bold text-white">PuntoClicks.com</span>
                    </div>
                </div>

                {/* Subtitle */}
                <p className="text-center text-white/90 text-sm mb-8">
                    {t('auth.welcome')}
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 flex items-center gap-3 text-sm">
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
                            <label htmlFor="passport" className="block text-sm font-medium text-gray-900 mb-2">
                                {t('auth.passport')}
                            </label>
                            <input
                                id="passport"
                                type="text"
                                value={passport}
                                onChange={(e) => setPassport(e.target.value.toUpperCase())}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#CE0201] transition-colors text-base"
                                placeholder="ABC123456"
                                required
                                autoComplete="username"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                                {t('auth.password')}
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#CE0201] transition-colors pr-12 text-base"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
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
                                        : 'bg-white border-gray-300 hover:border-gray-400'
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
                                className="text-sm text-gray-700 cursor-pointer select-none"
                            >
                                {t('auth.rememberMe') || 'Recordar mis datos'}
                            </label>
                        </div>

                        {/* Botão Biometria - Acceso rápido */}
                        {savedCredentials && (
                            <button
                                type="button"
                                onClick={tryBiometricLogin}
                                disabled={loading}
                                className="w-full py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 border border-gray-300"
                            >
                                <FingerprintIcon />
                                <span className="font-semibold text-base">Acceso rápido</span>
                            </button>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-[#CE0201] hover:bg-[#A00101] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
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
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-center text-gray-600 text-xs">
                            Sistema de Control Horario
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-white/70 text-xs">
                    © {new Date().getFullYear()} J2S Hores
                </p>
            </div>
        </div>
    );
}
