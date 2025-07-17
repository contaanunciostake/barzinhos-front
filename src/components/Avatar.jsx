import React from 'react';

const Avatar = ({ user, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getBackgroundColor = (name) => {
    if (!name) return 'bg-gray-500';
    
    const colors = [
      'bg-orange-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (user?.profile_photo) {
    return (
      <img
        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/static/images/profiles/${user.profile_photo}`}
        alt={user.username || 'Avatar'}
        className={`${sizes[size]} ${className} rounded-full object-cover border-2 border-white shadow-md`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} ${className} ${getBackgroundColor(user?.username)} rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white`}
    >
      {getInitials(user?.username)}
    </div>
  );
};

export default Avatar;

