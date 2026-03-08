import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../TourGuide.css';

export default function ApprovalsTour() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tour_approvals_seen');
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
          localStorage.setItem('tour_approvals_seen', 'true');
          driverObj.destroy();
        },
        steps: [
          {
            element: '[data-tour="week-selector"]',
            popover: {
              title: '📅 Seleccionar Setmana',
              description: 'Benvingut a Aprovacions! Aquest és un dels passos més importants. Canvia de setmana per revisar aprovacions de diferents períodes.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="approval-card"]',
            popover: {
              title: '📋 Targeta d\'Aprovació',
              description: 'Cada targeta mostra: empleat, obra, hores totals (normals + extra + nocturnes) i l\'estat actual.',
              side: 'top',
              align: 'start'
            }
          },
          {
            element: '[data-tour="approve-btn"]',
            popover: {
              title: '✅ Aprovar Hores',
              description: 'Si les hores estan correctes, fes clic en aprovar. Això permetrà que les hores siguin comptabilitzades a la folha de pagament.',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '[data-tour="reject-btn"]',
            popover: {
              title: '❌ Rebutjar Hores',
              description: 'Si detectes algun error, pots rebutjar l\'aprovació. L\'encarregat haurà de corregir i tornar a enviar.',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '[data-tour="details-btn"]',
            popover: {
              title: '📊 Veure Detalls',
              description: 'Fes clic aquí per veure el desglossament complet: hores per dia, tipus d\'hores i poder fer ajustos si cal.',
              side: 'left',
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
