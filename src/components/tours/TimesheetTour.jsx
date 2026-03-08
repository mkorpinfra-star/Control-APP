import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../TourGuide.css';

export default function TimesheetTour() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tour_timesheet_seen');
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
          localStorage.setItem('tour_timesheet_seen', 'true');
          driverObj.destroy();
        },
        steps: [
          {
            element: '[data-tour="employee-select"]',
            popover: {
              title: '👤 Seleccionar Empleat',
              description: 'Benvingut al Registre d\'Hores! Primer selecciona l\'empleat que va treballar. Si ets encarregat, pots registrar hores de qualsevol empleat del teu equip.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="project-select"]',
            popover: {
              title: '🏗️ Seleccionar Obra',
              description: 'Després selecciona a quina obra va treballar l\'empleat aquest dia.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="date-picker"]',
            popover: {
              title: '📅 Data del Treball',
              description: 'Indica en quina data es van realitzar les hores. Pots registrar hores d\'avui o de dies anteriors.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="hours-input"]',
            popover: {
              title: '⏱️ Registrar Hores',
              description: 'Introdueix les hores treballades: normals (8h/dia màxim), extra (fins 10h) i nocturnes (22h-6h). El sistema calcularà automàticament els valors.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="save-timesheet-btn"]',
            popover: {
              title: '💾 Guardar Registre',
              description: 'Un cop omplertes totes les dades, fes clic per guardar. Les hores quedaran pendents d\'aprovació per l\'administrador.',
              side: 'bottom',
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
