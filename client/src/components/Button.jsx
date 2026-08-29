import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  id,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-md cursor-pointer';

  const variants = {
    primary: 'bg-[#005A8D] text-white hover:bg-[#0B3D62] focus:ring-[#005A8D]',
    secondary: 'bg-white text-[#172B3A] border border-[#D7E0E7] hover:bg-[#F7F9FB] focus:ring-[#005A8D]',
    teal: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-xs focus:ring-teal-500 border border-transparent',
    outline: 'border border-[#005A8D] text-[#005A8D] bg-white hover:bg-blue-50 focus:ring-[#005A8D]',
    ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-400 border border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs min-h-[32px] gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm min-h-[38px] gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base min-h-[44px] gap-2.5',
  };

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
