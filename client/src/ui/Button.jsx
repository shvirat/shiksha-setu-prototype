import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'normal',
  disabled = false,
  helperText = '',
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-sans font-medium rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy-600 focus-visible:outline-offset-2 disabled:cursor-not-allowed';

  const sizeClasses = size === 'dense' ? 'h-9 px-3 text-small' : 'h-11 px-5 text-body';

  const variantClasses = {
    primary:
      'bg-navy-700 text-white hover:bg-navy-900 disabled:bg-line disabled:text-ink-muted',
    secondary:
      'bg-white text-ink border border-line-strong hover:bg-paper disabled:border-line disabled:text-ink-muted',
    tertiary:
      'bg-transparent text-navy-600 hover:underline px-2 h-auto text-body disabled:text-ink-muted',
    danger:
      'bg-danger-700 text-white hover:bg-navy-900 disabled:bg-line disabled:text-ink-muted'
  };

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`${baseClasses} ${sizeClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`}
        {...props}
      >
        {children}
      </button>
      {disabled && helperText && (
        <span className="text-caption text-ink-muted mt-1">{helperText}</span>
      )}
    </div>
  );
}
