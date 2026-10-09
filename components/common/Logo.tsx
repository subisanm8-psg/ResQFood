import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconDimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* Simple SVG mark of a plate with a leaf */}
      <div
        className={`${iconDimensions} rounded-2xl bg-butter-200 border-2 border-brown-primary flex items-center justify-center text-brown-primary shadow-subtle group-hover:scale-105 transition-transform`}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Plate */}
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" strokeDasharray="3 3" />
          {/* Leaf in center */}
          <path d="M12 7c-2 2-2 5 0 7 2-2 2-5 0-7z" fill="#4F8A5B" stroke="#4F8A5B" strokeWidth="1.5" />
          <path d="M12 14v2" stroke="#4F8A5B" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-bold ${textClass} text-brown-primary tracking-tight font-sans leading-none`}>
          ResQFood
        </span>
        <span className="text-[10px] text-brown-secondary font-medium tracking-wide mt-0.5">
          Tamil Nadu
        </span>
      </div>
    </Link>
  );
};
