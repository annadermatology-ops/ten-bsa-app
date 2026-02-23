'use client';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div
      className={`${sizeClasses[size]} border-2 border-[#d0d0c8] border-t-[#c95a8a] rounded-full animate-spin`}
    />
  );
}
