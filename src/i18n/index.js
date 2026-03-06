import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './es.json';
import ca from './ca.json';

const savedLanguage = localStorage.getItem('language') || 'es';

// Inicialização síncrona - recursos já estão importados
i18n
    .use(initReactI18next)
    .init({
        resources: {
            es: { translation: es },
            ca: { translation: ca }
        },
        lng: savedLanguage,
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false
        },
        // Garantir inicialização síncrona
        initImmediate: false,
        react: {
            useSuspense: false // Desabilitar Suspense para evitar problemas
        }
    });

export default i18n;
