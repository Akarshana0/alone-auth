'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-violet-500 animate-spin" />
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent border-b-cyan-500 border-l-purple-500 animate-spin"
        style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
      />
    </div>
  );
}
