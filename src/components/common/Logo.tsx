import React from 'react';

interface LogoProps {
  theme?: 'light' | 'dark' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  theme = 'auto',
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
}) => {
  const sizeMap = {
    xs: { img: 'w-7 h-7', title: 'text-sm', sub: 'text-[9px]', tag: 'text-[8px]' },
    sm: { img: 'w-9 h-9', title: 'text-base', sub: 'text-[10px]', tag: 'text-[9px]' },
    md: { img: 'w-11 h-11', title: 'text-lg', sub: 'text-xs', tag: 'text-[10px]' },
    lg: { img: 'w-16 h-16', title: 'text-2xl', sub: 'text-sm', tag: 'text-xs' },
    xl: { img: 'w-24 h-24', title: 'text-3xl', sub: 'text-base', tag: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Ramola Coaching Centre Logo Mark */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Light theme logo: Navy + Gold (Used on light backgrounds) */}
        <img
          src="/logo-light.svg"
          alt="Ramola Coaching Centre Logo"
          className={`${currentSize.img} object-contain transition-opacity duration-200 ${
            theme === 'auto'
              ? 'dark:hidden inline-block'
              : theme === 'light'
              ? 'inline-block'
              : 'hidden'
          }`}
        />
        {/* Dark theme logo: White + Gold (Used on dark backgrounds) */}
        <img
          src="/logo-dark.svg"
          alt="Ramola Coaching Centre Logo"
          className={`${currentSize.img} object-contain transition-opacity duration-200 ${
            theme === 'auto'
              ? 'hidden dark:inline-block'
              : theme === 'dark'
              ? 'inline-block'
              : 'hidden'
          }`}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-baseline tracking-tight">
            <span
              className={`font-black tracking-wider uppercase ${currentSize.title} ${
                theme === 'dark'
                  ? 'text-white'
                  : theme === 'light'
                  ? 'text-[#002147]'
                  : 'text-[#002147] dark:text-white'
              }`}
            >
              Ramola
            </span>
            <span className={`ml-1 font-semibold tracking-wide uppercase text-[#D4AF37] ${currentSize.sub}`}>
              Coaching
            </span>
          </div>

          <span
            className={`font-medium tracking-widest uppercase text-[10px] -mt-1 ${
              theme === 'dark'
                ? 'text-slate-300'
                : theme === 'light'
                ? 'text-slate-600'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Centre
          </span>

          {showTagline && (
            <span className={`font-semibold tracking-wide text-[#D4AF37] mt-0.5 ${currentSize.tag}`}>
              Learn • Practice • Improve
            </span>
          )}
        </div>
      )}
    </div>
  );
};
