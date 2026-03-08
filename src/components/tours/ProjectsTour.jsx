import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../TourGuide.css';

export default function ProjectsTour() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tour_projects_seen');
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
          localStorage.setItem('tour_projects_seen', 'true');
          driverObj.destroy();
        },
        steps: [
          {
            element: '[data-tour="add-project-btn"]',
            popover: {
              title: 'Crear Nova Obra',
              description: 'Benvingut a Obres! Aquí crees noves obres amb totes les dades: nom, client, encarregat, dates i valors de facturació.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="search-input"]',
            popover: {
              title: 'Cerca Ràpida',
              description: 'Utilitza aquesta barra per buscar obres per nom, número o client. La cerca és instantània.',
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '[data-tour="project-card"]',
            popover: {
              title: 'Targeta d\'Obra',
              description: 'Cada targeta mostra informació essencial de l\'obra: client, encarregat, dates i estat. Fes clic per veure més detalls.',
              side: 'top',
              align: 'start'
            }
          },
          {
            element: '[data-tour="edit-project-btn"]',
            popover: {
              title: 'Editar Obra',
              description: 'Fes clic en l\'icona de llapis per editar qualsevol informació de l\'obra: canviar encarregat, actualitzar dates, etc.',
              side: 'left',
              align: 'start'
            }
          },
          {
            element: '[data-tour="delete-project-btn"]',
            popover: {
              title: 'Eliminar Obra',
              description: 'Si necessites eliminar una obra, fes clic en l\'icona de paperera. El sistema demanarà confirmació abans d\'eliminar.',
              side: 'left',
              align: 'start'
            }
          },
        ]
      });

      driverObj.drive();
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
