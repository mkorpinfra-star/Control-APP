import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';

// Ícone de câmera
const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

// Ícone de alerta
const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

export default function PhotoUpload({ user, onPhotoUpdated, onClose, required = false }) {
    const { t } = useTranslation();
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError(t('profile.selectImage'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
            setError('');
        };
        reader.readAsDataURL(file);
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            setStream(mediaStream);
            setShowCamera(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (err) {
            setError(t('profile.cameraError'));
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        // Pegar o centro do vídeo (quadrado)
        const video = videoRef.current;
        const size = Math.min(video.videoWidth, video.videoHeight);
        const x = (video.videoWidth - size) / 2;
        const y = (video.videoHeight - size) / 2;

        ctx.drawImage(video, x, y, size, size, 0, 0, 480, 480);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreview(dataUrl);
        stopCamera();
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const uploadPhoto = async () => {
        if (!preview) return;

        setUploading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/usuarios/upload-foto.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ foto: preview })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || t('profile.uploadError'));
            }

            // Atualizar user no localStorage
            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
            savedUser.foto_url = data.foto_url;
            localStorage.setItem('user', JSON.stringify(savedUser));

            if (onPhotoUpdated) {
                onPhotoUpdated(data.foto_url);
            }
            if (!required && onClose) {
                onClose();
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    // Se for obrigatório, não permitir fechar clicando fora
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !uploading && !required && onClose) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {required ? '📸 Foto Obligatoria' : t('profile.addPhoto')}
                    </h2>
                </div>

                <div className="modal-body" style={{ textAlign: 'center' }}>
                    {required && (
                        <div style={{
                            background: '#fef3c7',
                            border: '1px solid #f59e0b',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '13px',
                            color: '#92400e'
                        }}>
                            <AlertIcon />
                            <span>Debes añadir tu foto para continuar usando el sistema</span>
                        </div>
                    )}

                    <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                        {t('profile.photoExplanation')}
                    </p>

                    {/* Preview ou Placeholder */}
                    <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        margin: '0 auto 20px',
                        overflow: 'hidden',
                        background: preview ? 'transparent' : '#f0f0f0',
                        border: '3px solid #CE0201',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {showCamera ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : preview ? (
                            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ color: '#aaa' }}>
                                <CameraIcon />
                            </div>
                        )}
                    </div>

                    {error && (
                        <p style={{ color: '#CE0201', fontSize: '13px', marginBottom: '15px' }}>{error}</p>
                    )}

                    {/* Botões de ação */}
                    {!showCamera && !preview && (
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                📁 {t('profile.gallery')}
                            </button>
                            <button
                                onClick={startCamera}
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                            >
                                📷 {t('profile.camera')}
                            </button>
                        </div>
                    )}

                    {showCamera && (
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={stopCamera} className="btn btn-secondary">
                                {t('profile.cancel')}
                            </button>
                            <button onClick={capturePhoto} className="btn btn-primary">
                                📸 {t('profile.capture')}
                            </button>
                        </div>
                    )}

                    {preview && !showCamera && (
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setPreview(null)}
                                className="btn btn-secondary"
                                disabled={uploading}
                            >
                                {t('profile.anotherPhoto')}
                            </button>
                            <button
                                onClick={uploadPhoto}
                                className="btn btn-primary"
                                disabled={uploading}
                            >
                                {uploading ? t('profile.uploading') : `✅ ${t('profile.save')}`}
                            </button>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
        </div>
    );
}
