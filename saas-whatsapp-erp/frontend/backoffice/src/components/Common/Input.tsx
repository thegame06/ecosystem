import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`appearance-none block w-full px-4 py-3 bg-slate-50 border-none rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-700 font-bold sm:text-sm ${error ? 'ring-2 ring-red-300' : ''
          } ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-600 font-bold px-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
