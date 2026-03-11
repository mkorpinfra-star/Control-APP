import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IconCamera, IconLock, IconCircleCheck, IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import PhotoUpload from '../components/PhotoUpload';

const API_URL = import.meta.env.VITE_API_URL || 'https://puntotouch.nextim.io/backend/api';

export default function SetupObrigatorio() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [photoUploaded, setPhotoUploaded] = useState(false);
    const [biometriaSupported, setBiometriaSupported] = useState(false);
    const [biometriaStatus, setBiometriaStatus] = useState('');

    useEffect(() => {
        if (window.PublicKeyCredential) {
            setBiometriaSupported(true);
        } else {
            setBiometriaSupported(false);
        }

        if (user?.foto_url) {
            setPhotoUploaded(true);
            setStep(2);
        }
    }, [user]);

    const handlePhotoSuccess = (photoUrl) => {
        setPhotoUploaded(true);
        updateUser({ ...user, foto_url: photoUrl });

        if (user?.tipo === 'admin') {
            navigate('/');
            return;
        }

        setTimeout(() => {
            setStep(2);
        }, 1500);
    };

    const cadastrarBiometria = async () => {
        if (!biometriaSupported) {
            setError('Seu dispositivo não suporta biometria. Entre em contato com o administrador.');
            return;
        }

        setLoading(true);
        setError('');
        setBiometriaStatus('Preparando registro...');

        try {
            const publicKeyCredentialCreationOptions = {
                challenge: new Uint8Array(32),
                rp: {
                    name: "J2S Enginyeria",
                    id: window.location.hostname,
                },
                user: {
                    id: new Uint8Array(16),
                    name: user.passaporte,
                    displayName: user.nome,
                },
                pubKeyCredParams: [
                    { alg: -7, type: "public-key" },
                    { alg: -257, type: "public-key" }
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    requireResidentKey: false,
                    userVerification: "required"
                },
                timeout: 60000,
                attestation: "none"
            };

            setBiometriaStatus('Coloque seu dedo ou use Face ID...');

            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions
            });

            setBiometriaStatus('Biometria capturada! Salvando...');

            const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
            const publicKeyBytes = new Uint8Array(credential.response.getPublicKey());
            const publicKey = btoa(String.fromCharCode(...publicKeyBytes));

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/biometria/registrar.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    credential_id: credentialId,
                    public_key: publicKey
                })
            });

            const data = await res.json();

            if (data.success) {
                setBiometriaStatus('Biometria cadastrada com sucesso!');
                updateUser({ ...user, biometria_cadastrada: 1 });

                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                throw new Error(data.error || 'Erro ao cadastrar biometria');
            }

        } catch (err) {
            console.error('Erro biometria:', err);

            if (err.name === 'NotAllowedError') {
                setError('Você cancelou o cadastro de biometria.');
            } else if (err.name === 'NotSupportedError') {
                setError('Biometria não disponível neste dispositivo.');
            } else {
                setError('Erro ao cadastrar biometria: ' + err.message);
            }

            setBiometriaStatus('');
        } finally {
            setLoading(false);
        }
    };

    const pularBiometria = () => {
        if (!photoUploaded && !user?.foto_url) {
            setError('Você precisa cadastrar a foto antes de continuar.');
            setStep(1);
            return;
        }

        sessionStorage.setItem('biometria_pulada', 'true');
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full border border-gray-200">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="text-5xl font-black text-j2s-red mb-2">J2S</div>
                    <div className="text-sm text-gray-600 font-medium">ENGINYERIA</div>
                </div>

                {/* Steps */}
                <div className="flex justify-center gap-2 mb-8">
                    <div className={`w-3 h-3 rounded-full transition-all ${step >= 1 ? 'bg-success' : 'bg-gray-300'}`}></div>
                    <div className={`w-3 h-3 rounded-full transition-all ${step >= 2 ? 'bg-success' : 'bg-gray-300'}`}></div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-danger-light border border-danger text-danger p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                        <IconAlertTriangle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Step 1: Photo */}
                {step === 1 && (
                    <>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                            <IconCamera className="w-6 h-6" />
                            Foto de Perfil
                        </h2>
                        <p className="text-sm text-gray-600 mb-8 text-center leading-relaxed">
                            Para sua segurança e identificação, é <strong>obrigatório</strong> cadastrar uma foto.
                            Tire uma selfie ou selecione da galeria.
                        </p>

                        <PhotoUpload onSuccess={handlePhotoSuccess} />

                        {photoUploaded && (
                            <div className="text-center mt-6 text-success font-semibold flex items-center justify-center gap-2">
                                <IconCircleCheck className="w-5 h-5" />
                                Foto cadastrada com sucesso!
                            </div>
                        )}
                    </>
                )}

                {/* Step 2: Biometria */}
                {step === 2 && (
                    <>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                            <IconLock className="w-6 h-6" />
                            Cadastro de Biometria
                        </h2>
                        <p className="text-sm text-gray-600 mb-8 text-center leading-relaxed">
                            Para um acesso rápido e seguro, cadastre sua <strong>impressão digital</strong> ou <strong>Face ID</strong>.
                            {!biometriaSupported && ' Seu dispositivo não suporta biometria.'}
                        </p>

                        {biometriaSupported ? (
                            <>
                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    {loading ? (
                                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                            <IconLoader2 className="w-10 h-10 animate-spin text-gray-600" />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border-2 border-j2s-red">
                                            <IconLock className="w-10 h-10 text-j2s-red" />
                                        </div>
                                    )}
                                </div>

                                {biometriaStatus && (
                                    <div className="text-center text-sm text-gray-600 mb-6 font-medium">
                                        {biometriaStatus}
                                    </div>
                                )}

                                <button
                                    onClick={cadastrarBiometria}
                                    disabled={loading}
                                    className="w-full py-3 bg-j2s-red text-white rounded-lg font-semibold mb-3 flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
                                >
                                    <IconLock className="w-5 h-5" />
                                    {loading ? 'Cadastrando...' : 'Cadastrar Biometria'}
                                </button>

                                <button
                                    onClick={pularBiometria}
                                    disabled={loading}
                                    className="w-full py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
                                >
                                    Pular por Agora
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Se pular, será solicitado novamente no próximo login
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="bg-warning-light border border-warning text-warning p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                                    <IconAlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    Biometria não disponível neste dispositivo. Entre em contato com o administrador para usar apenas senha.
                                </div>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-3 bg-j2s-red text-white rounded-lg font-semibold"
                                >
                                    Continuar com Senha
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
