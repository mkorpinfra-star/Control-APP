import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL?.replace('/backend/api', '') || 'https://puntotouch.nextim.io';

export default function Avatar({ user, size = 'md', className = '' }) {
    const [imageError, setImageError] = useState(false);

    // Reset error quando a foto_url mudar
    useEffect(() => {
        setImageError(false);
    }, [user?.foto_url]);

    const getInitials = () => {
        if (!user?.nome || typeof user.nome !== 'string' || user.nome.trim() === '') return 'U';

        const cleanName = user.nome.trim();
        const names = cleanName.split(' ').filter(n => n.length > 0);

        if (names.length >= 2) {
            const first = names[0][0] || '';
            const last = names[names.length - 1][0] || '';
            return `${first}${last}`.toUpperCase() || 'U';
        }

        return cleanName.substring(0, 2).toUpperCase() || 'U';
    };

    const sizes = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-20 h-20 text-xl'
    };

    const sizeClass = sizes[size] || sizes.md;

    return user?.foto_url && user.foto_url.trim() !== '' && !imageError ? (
        <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 ${className}`}>
            <img
                src={`${API_URL}${user.foto_url}`}
                alt={user?.nome}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
            />
        </div>
    ) : (
        <div className={`${sizeClass} rounded-full bg-white text-gray-900 font-bold flex items-center justify-center shrink-0 ${className}`}>
            {getInitials()}
        </div>
    );
}
