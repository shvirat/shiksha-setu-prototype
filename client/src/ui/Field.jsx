import React from 'react';

export function Field({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  helperText,
  error,
  isPrefilled = false,
  onEditPrefilled,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label htmlFor={id || name} className="text-small font-medium text-ink">
            {label} {required && <span className="text-danger-700">*</span>}
          </label>
        )}
        {isPrefilled && (
          <span className="text-caption text-ink-muted">
            Filled from profile
            {onEditPrefilled && (
              <button
                type="button"
                onClick={onEditPrefilled}
                className="ml-2 text-navy-600 hover:underline"
              >
                Edit
              </button>
            )}
          </span>
        )}
      </div>

      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-11 px-3 text-body rounded border bg-surface text-ink transition-colors focus:border-navy-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy-600 focus-visible:outline-offset-2 ${
          error ? 'border-danger-700' : 'border-line-strong'
        } disabled:bg-paper disabled:text-ink-muted`}
        {...props}
      />

      {error ? (
        <span className="text-caption text-danger-700 mt-1 flex items-center gap-1">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-caption text-ink-muted mt-1">{helperText}</span>
      ) : null}
    </div>
  );
}
