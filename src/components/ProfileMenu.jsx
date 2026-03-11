import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IconUser, IconLock, IconCamera, IconWorld, IconInfoCircle, IconLogout, IconX } from '@tabler/icons-react';
import PhotoUpload from './PhotoUpload';

export default function ProfileMenu({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Fechar ao pressionar ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  const getUserInitials = () => {
    if (!user?.nome) return 'U';
    const names = user.nome.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.nome.substring(0, 2).toUpperCase();
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setChangingPassword(true);

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://puntoclicks.com/backend/api';

      const response = await fetch(`${API_URL}/usuarios/change-password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setPasswordSuccess('✅ Senha alterada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordChange(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(data.message || 'Erro ao alterar senha');
      }
    } catch (err) {
      setPasswordError('Erro ao conectar com o servidor');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>

      {/* Menu lateral */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header vermelho gradiente */}
        <div className="bg-gradient-to-br from-[#CE0201] to-[#A00101] text-white p-6 pb-8">
          <div className="flex items-start justify-between mb-6">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <IconX size={20} />
            </button>
          </div>

          {/* Avatar e Nome */}
          <div className="flex items-center gap-4">
            {user?.foto_url && user.foto_url.trim() !== '' && !imageError ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30">
                <img
                  src={`https://j2s.ad${user.foto_url}`}
                  alt={user?.nome}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                <IconUser size={32} strokeWidth={2} className="text-white" />
              </div>
            )}
            <div>
              <p className="text-lg font-bold">{user?.nome}</p>
              <p className="text-xs opacity-80">{user?.email || user?.nome}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {/* Alterar Foto */}
          <button
            onClick={() => setShowPhotoUpload(true)}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-[#F5F5F5] transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <IconCamera size={18} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Alterar foto</p>
              <p className="text-xs text-gray-600">Adicione ou altere sua foto de perfil</p>
            </div>
          </button>

          {/* Alterar Senha */}
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-[#F5F5F5] transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <IconLock size={18} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Alterar senha</p>
              <p className="text-xs text-gray-600">Mantenha sua conta segura</p>
            </div>
          </button>

          {/* Painel de Alterar Senha */}
          {showPasswordChange && (
            <div className="bg-[#F5F5F5] rounded-xl p-4 space-y-3">
              <input
                type="password"
                placeholder="Senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-[#CE0201] text-sm"
              />
              <input
                type="password"
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-[#CE0201] text-sm"
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-[#CE0201] text-sm"
              />

              {passwordError && (
                <p className="text-xs text-red-600 font-semibold">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-xs text-green-600 font-semibold">{passwordSuccess}</p>
              )}

              <button
                onClick={handlePasswordChange}
                disabled={changingPassword}
                className="w-full py-3 bg-[#CE0201] hover:bg-[#A00101] text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {changingPassword ? 'Alterando...' : 'Confirmar alteração'}
              </button>
            </div>
          )}

          {/* Idioma */}
          <button
            onClick={() => alert('Funcionalidad de cambio de idioma en desarrollo')}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-[#F5F5F5] transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <IconWorld size={18} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Idioma</p>
              <p className="text-xs text-gray-600">Español</p>
            </div>
          </button>

          {/* Sobre */}
          <button
            onClick={() => alert('J2S Hores v1.0.0\nDesarrollado por PuntoClicks.com\n\nSistema de gestión de horas y nóminas')}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-[#F5F5F5] transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <IconInfoCircle size={18} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Sobre</p>
              <p className="text-xs text-gray-600">J2S Hores v1.0.0 by PuntoClicks.com</p>
            </div>
          </button>

          {/* Divider */}
          <div className="h-px bg-gray-200 my-4"></div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <IconLogout size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-600 text-sm">Cerrar sesión</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-500 text-center">
            Desenvolvido por{' '}
            <a
              href="https://www.guilhermesites.com.br"
              target="_blank"
              rel="noopener follow"
              className="text-[#CE0201] font-semibold"
            >
              Guilherme Sites
            </a>
          </p>
        </div>
      </div>

      {/* Modal de Upload de Foto */}
      {showPhotoUpload && (
        <PhotoUpload
          user={user}
          onPhotoUpdated={(url) => {
            setShowPhotoUpload(false);
            // Atualizar foto no estado local se necessário
            window.location.reload(); // Recarrega para mostrar nova foto
          }}
          onClose={() => setShowPhotoUpload(false)}
          required={false}
        />
      )}
    </>
  );
}
