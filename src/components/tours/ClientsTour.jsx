import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../TourGuide.css';

export default function ClientsTour() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tour_clients_seen');
    if (hasSeenTour) return;

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
          localStorage.setItem('tour_clients_seen', 'true');
          driverObj.destroy();
        },
        steps: [
          {
            element: '[data-tour="add-client-btn"]',
            popover: {
              title: 'Afegir Client',
              description: 'Benvingut a Clients! Aquí gestiones la teva cartera. Registra nous clients amb nom, email, telèfon i adreça. Després podràs assignar-los obres.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="search-client"]',
            popover: {
              title: 'Cerca de Clients',
              description: 'Troba clients ràpidament pel nom o dades de contacte.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="client-card"]',
            popover: {
              title: 'Fitxa de Client',
              description: 'Cada targeta mostra informació essencial: nom, contacte i número d\'obres associades.',
              side: 'top',
              align: 'start'
            }
          }
        ]
      });

      driverObj.drive();
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
