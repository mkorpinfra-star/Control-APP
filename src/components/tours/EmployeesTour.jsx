import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../TourGuide.css';

export default function EmployeesTour() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tour_employees_seen');
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
          localStorage.setItem('tour_employees_seen', 'true');
          driverObj.destroy();
        },
        steps: [
          {
            element: '[data-tour="add-employee-btn"]',
            popover: {
              title: 'Afegir Empleat',
              description: 'Benvingut a Empleats! Fes clic aquí per registrar un nou empleat amb totes les dades: nom, funcions, salari base, percentatges de CASS i assigna-lo a obres.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="search-employee"]',
            popover: {
              title: 'Cerca d\'Empleats',
              description: 'Busca empleats pel nom o pel número de targeta biométrica de forma ràpida.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="employee-card"]',
            popover: {
              title: 'Fitxa d\'Empleat',
              description: 'Veus tota la informació de cada empleat: nom, funció, targeta biométrica, salari base i obres assignades.',
              side: 'top',
              align: 'start'
            }
          },
          {
            element: '[data-tour="edit-employee-btn"]',
            popover: {
              title: 'Editar Empleat',
              description: 'Actualitza qualsevol dada de l\'empleat: canvia salari, modifica funcions, assigna a noves obres.',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '[data-tour="delete-employee-btn"]',
            popover: {
              title: 'Eliminar Empleat',
              description: 'Si un empleat ja no treballa a l\'empresa, pots eliminar-lo del sistema amb confirmació prèvia.',
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
