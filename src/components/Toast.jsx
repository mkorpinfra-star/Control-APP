import { useEffect } from 'react';

const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ErrorIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const styles = {
    success: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white'
    },
    error: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white'
    },
    info: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white'
    },
    warning: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white'
    }
};

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckIcon />,
        error: <ErrorIcon />,
        info: <InfoIcon />,
        warning: <InfoIcon />
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                zIndex: 9999,
                minWidth: '320px',
                maxWidth: '500px',
                padding: '16px 20px',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'slideIn 0.3s ease-out',
                ...styles[type]
            }}
        >
            <div style={{ flexShrink: 0 }}>
                {icons[type]}
            </div>
            <div style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>
                {message}
            </div>
            <button
                onClick={onClose}
                style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '18px',
                    flexShrink: 0,
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
                ×
            </button>
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @media (max-width: 768px) {
                    div[style*="position: fixed"] {
                        left: 12px !important;
                        right: 12px !important;
                        min-width: auto !important;
                    }
                }
            `}</style>
        </div>
    );
}
