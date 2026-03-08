import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TourGuide() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);

  useEffect(() => {
    // Verifica se usuário já viu o tour
    const tourCompleted = localStorage.getItem('j2s_tour_completed');
    if (!tourCompleted) {
      setShowWelcome(true);
    }
  }, []);

  const tourSteps = [
    {
      target: '#quick-actions',
      title: 'Accés ràpid',
      description: 'Des d\'aquí pots accedir ràpidament a totes les funcions principals del sistema.',
      position: 'bottom'
    },
    {
      target: '#stats-section',
      title: 'Resum',
      description: 'Visualitza un resum dels teus projectes, clients i empleats en temps real.',
      position: 'bottom'
    },
    {
      target: '#bottom-nav',
      title: 'Navegació',
      description: 'Utilitza el menú inferior per navegar entre les seccions principals.',
      position: 'top'
    }
  ];

  const startTour = () => {
    setShowWelcome(false);
    setIsTourActive(true);
    setCurrentStep(0);
  };

  const skipTour = () => {
    setShowWelcome(false);
    localStorage.setItem('j2s_tour_completed', 'true');
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsTourActive(false);
    localStorage.setItem('j2s_tour_completed', 'true');
  };

  const getTooltipPosition = (target) => {
    const element = document.querySelector(target);
    if (!element) return { top: 0, left: 0 };

    const rect = element.getBoundingClientRect();
    const step = tourSteps[currentStep];

    // Calcular posição relativa ao viewport com scroll
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    if (step.position === 'bottom') {
      return {
        top: rect.bottom + scrollTop + 16,
        left: rect.left + scrollLeft + rect.width / 2,
        transform: 'translateX(-50%)'
      };
    } else if (step.position === 'top') {
      return {
        top: rect.top + scrollTop - 16,
        left: rect.left + scrollLeft + rect.width / 2,
        transform: 'translate(-50%, -100%)'
      };
    }
  };

  return (
    <>
      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              {/* Header Nubank Style - Clean & Minimal */}
              <div className="bg-[#CE0201] px-6 py-4 text-white">
                <h2 className="text-lg font-bold">Benvingut a J2S Hores</h2>
                <p className="text-white/90 text-sm mt-1">El teu sistema de gestió d'obres</p>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-700 text-center mb-6 leading-relaxed">
                  Vols fer un tour ràpid per conèixer les funcions principals del sistema?
                </p>

                <div className="space-y-3">
                  <button
                    onClick={startTour}
                    className="w-full bg-[#CE0201] text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-[#A00101] transition-colors flex items-center justify-center gap-2"
                  >
                    Començar tour
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </button>

                  <button
                    onClick={skipTour}
                    className="w-full bg-gray-100 text-gray-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Ometre
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Només trigarà uns segons
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Tooltips */}
      <AnimatePresence>
        {isTourActive && tourSteps[currentStep] && (
          <>
            {/* Overlay escuro */}
            <div className="fixed inset-0 bg-black/40 z-[90]" onClick={completeTour}></div>

            {/* Tooltip */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute z-[100] max-w-sm"
              style={getTooltipPosition(tourSteps[currentStep].target)}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                  <div
                    className="h-full bg-[#CE0201] transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                  ></div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {tourSteps[currentStep].title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {tourSteps[currentStep].description}
                      </p>
                    </div>
                    <button
                      onClick={completeTour}
                      className="ml-2 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      <X size={18} className="text-gray-500" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 font-medium">
                      {currentStep + 1} de {tourSteps.length}
                    </div>

                    <div className="flex gap-2">
                      {currentStep > 0 && (
                        <button
                          onClick={prevStep}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                          <ChevronLeft size={16} />
                          Enrere
                        </button>
                      )}

                      <button
                        onClick={nextStep}
                        className="px-4 py-2 bg-[#CE0201] text-white rounded-lg hover:bg-[#A00101] transition-colors flex items-center gap-1 text-sm font-medium"
                      >
                        {currentStep === tourSteps.length - 1 ? (
                          <>
                            Finalitzar
                            <Check size={16} />
                          </>
                        ) : (
                          <>
                            Següent
                            <ChevronRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              {tourSteps[currentStep].position === 'bottom' && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-lg"></div>
              )}
              {tourSteps[currentStep].position === 'top' && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-lg"></div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
