import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './TourGuide.css';

export default function TourGuide() {
  useEffect(() => {
    // Tour aparece SEMPRE (removido localStorage)
    // Delay para garantir que elementos estão renderizados
    const timeout = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        nextBtnText: 'Següent',
        prevBtnText: 'Enrere',
        doneBtnText: 'Finalitzar',
        closeBtnText: '×',
        progressText: '{{current}} de {{total}}',
        onDestroyStarted: () => {
          driverObj.destroy();
        },
          steps: [
            {
              popover: {
                title: 'Benvingut a J2S Hores!',
                description: 'El teu sistema de gestió d\'obres. Aquest tutorial va ajudar-te a optimitzar el teu temps i gestionar les teves obres de forma més eficient. Comencem?',
                side: 'bottom',
                align: 'center'
              }
            },
            {
              element: '#stats-section',
              popover: {
                title: 'Resum de les teves obres',
                description: 'Aquí veus un resum en temps real: obres actives, aprovacions pendents, obres finalitzades i alertes importants. Fes clic en cada targeta per veure més detalls.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '#quick-actions',
              popover: {
                title: 'Accés ràpid a tot',
                description: 'Aquest és el teu panell de control. Des d\'aquí pots accedir directament a totes les funcions del sistema sense navegar per menús. Ara anem veure cada botó:',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '[data-tour="obras-btn"]',
              popover: {
                title: 'Obras',
                description: 'Gestiona totes les teves obres: crea noves, edita informació, assigna encarregats i controla l\'estat de cada projecte.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '[data-tour="clientes-btn"]',
              popover: {
                title: 'Clientes',
                description: 'Gestiona la teva cartera de clients: afegeix nous, actualitza dades de contacte i visualitza totes les obres associades a cada client.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '[data-tour="encargados-btn"]',
              popover: {
                title: 'Encarregados',
                description: 'Gestiona els teus encarregats: assigna-los a obres, controla el seu accés i revisa les seves aprovacions pendents.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '[data-tour="empleados-btn"]',
              popover: {
                title: 'Empleados',
                description: 'Gestiona la teva plantilla: afegeix nous empleats, actualitza dades, assigna-los a obres i controla les seves hores treballades.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '[data-tour="folha-btn"]',
              popover: {
                title: 'Folha de Pagamento',
                description: 'Genera la folha de pagament automàticament basant-te en les hores aprovades. Revisa, edita i exporta les nòmines dels teus empleats.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '[data-tour="faturamento-btn"]',
              popover: {
                title: 'Faturamento',
                description: 'Controla la facturació de cada obra: genera factures automàtiques basades en les hores treballades i valors acordats amb el client.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '[data-tour="analisis-btn"]',
              popover: {
                title: 'Análisis',
                description: 'Visualitza gràfics i estadístiques detallades: rendiment per obra, productivitat d\'empleats, costos i marges de benefici.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '[data-tour="informes-btn"]',
              popover: {
                title: 'Informes',
                description: 'Genera informes personalitzats: registre d\'empleats, històric d\'hores, moviments per obra i exporta tot en PDF o Excel.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '#bottom-nav',
              popover: {
                title: 'Navegació principal',
                description: 'Utilitza aquest menú per navegar entre Dashboard, Obres, Empleats, Aprovacions i Registre d\'hores. Sempre estarà accessible a la part inferior.',
                side: 'top',
                align: 'center'
              }
            },
            {
              popover: {
                title: 'Tot llest!',
                description: 'Ara ja coneixes J2S Hores. Comença a gestionar les teves obres de forma més eficient i estalvia temps en tasques administratives. Bon treball!',
                side: 'bottom',
                align: 'center'
              }
            }
          ]
        });

        driverObj.drive();
      }, 500);

      return () => clearTimeout(timeout);
  }, []);

  return null;
}
