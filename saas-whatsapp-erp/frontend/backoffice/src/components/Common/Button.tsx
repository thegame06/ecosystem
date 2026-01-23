import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "w-full flex justify-center items-center gap-2 py-3 px-6 border-none rounded-2xl text-sm font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg";

  const variants = {
    primary: "text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 shadow-primary-900/20 hover:scale-105 active:scale-95",
    secondary: "text-slate-700 bg-white border-2 border-slate-200 hover:bg-slate-50 focus:ring-primary-500 shadow-slate-200/50 hover:border-slate-300",
    danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-900/20 hover:scale-105 active:scale-95"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
