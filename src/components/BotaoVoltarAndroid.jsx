import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { fecharCamadaDoTopo } from '../lib/voltar';

// Telas "raiz" de cada perfil: nelas o voltar minimiza o app em vez de navegar.
const RAIZES = ['/login', '/dashboard', '/aprovacoes', '/almoxarifado', '/bater-ponto'];

export default function BotaoVoltarAndroid() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const h = App.addListener('backButton', () => {
      if (fecharCamadaDoTopo()) return;
      if (RAIZES.includes(pathname) || window.history.length <= 1) {
        App.minimizeApp();
      } else {
        navigate(-1);
      }
    });
    return () => { h.then(l => l.remove()); };
  }, [navigate, pathname]);

  return null;
}
