export default function Avatar({ user, size = 'md', className = '' }) {
  const getInitials = () => {
    if (!user?.nome || typeof user.nome !== 'string' || user.nome.trim() === '') return 'U';
    const names = user.nome.trim().split(' ').filter(n => n.length > 0);
    if (names.length >= 2) {
      return `${names[0][0] || ''}${names[names.length - 1][0] || ''}`.toUpperCase() || 'U';
    }
    return user.nome.trim().substring(0, 2).toUpperCase() || 'U';
  };

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
  };
  const sizeClass = sizes[size] || sizes.md;

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user?.nome || 'Avatar'}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-[#22262F] text-[#F5F5F0] font-bold flex items-center justify-center shrink-0 ${className}`}>
      {getInitials()}
    </div>
  );
}
