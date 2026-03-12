import { useState, useRef } from 'react';
import { IconX, IconCamera, IconUpload } from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://puntotouch.nextim.io/backend/api';

export default function PhotoUpload({ user, onPhotoUpdated, onClose, required = false }) {
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
            setError('Por favor selecciona una imagen');
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
            setError('No se pudo acceder a la cámara');
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

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
                throw new Error(data.message || 'Error al subir foto');
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

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        {required ? '📸 Foto Obligatoria' : 'Adicionar Foto'}
                    </h2>
                    {!required && onClose && (
                        <button
                            onClick={() => {
                                stopCamera();
                                onClose();
                            }}
                            className="w-10 h-10 rounded-full bg-[#F5F5F5] hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                            <IconX size={20} className="text-gray-700" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                    {required && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-left">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-amber-600 font-bold">!</span>
                            </div>
                            <p className="text-xs text-amber-800 font-semibold">
                                Debes añadir tu foto para continuar usando el sistema
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-gray-600 mb-6">
                        Tu foto aparecerá en los informes y ayudará a identificarte
                    </p>

                    {/* Preview ou Camera */}
                    <div className="w-48 h-48 rounded-full mx-auto mb-6 overflow-hidden border-4 border-[#CE0201] flex items-center justify-center bg-[#F5F5F5]">
                        {showCamera ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        ) : preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <IconCamera size={48} className="text-gray-400" />
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 font-semibold mb-4">{error}</p>
                    )}

                    {/* Buttons */}
                    {!showCamera && !preview && (
                        <div className="flex gap-3">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                                type="button"
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#F5F5F5] hover:bg-gray-200 text-gray-900 rounded-xl font-semibold text-sm transition-colors"
                            >
                                <IconUpload size={18} />
                                Galeria
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    startCamera();
                                }}
                                type="button"
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#CE0201] hover:bg-[#A00101] text-white rounded-xl font-semibold text-sm transition-colors"
                            >
                                <IconCamera size={18} />
                                Cámara
                            </button>
                        </div>
                    )}

                    {showCamera && (
                        <div className="flex gap-3">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    stopCamera();
                                }}
                                type="button"
                                className="flex-1 py-3 px-4 bg-[#F5F5F5] hover:bg-gray-200 text-gray-900 rounded-xl font-semibold text-sm transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    capturePhoto();
                                }}
                                type="button"
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#CE0201] hover:bg-[#A00101] text-white rounded-xl font-semibold text-sm transition-colors"
                            >
                                <IconCamera size={18} />
                                Capturar
                            </button>
                        </div>
                    )}

                    {preview && !showCamera && (
                        <div className="flex gap-3">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPreview(null);
                                }}
                                type="button"
                                className="flex-1 py-3 px-4 bg-[#F5F5F5] hover:bg-gray-200 text-gray-900 rounded-xl font-semibold text-sm transition-colors"
                                disabled={uploading}
                            >
                                Otra foto
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    uploadPhoto();
                                }}
                                type="button"
                                className="flex-1 py-3 px-4 bg-[#CE0201] hover:bg-[#A00101] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                                disabled={uploading}
                            >
                                {uploading ? 'Subiendo...' : '✓ Guardar'}
                            </button>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
}
