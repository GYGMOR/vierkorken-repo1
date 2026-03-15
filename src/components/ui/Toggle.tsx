/**
 * Reusable Toggle Switch Component
 * Provides an accessible, styled toggle switch for boolean settings
 */

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, disabled = false, className = '' }: ToggleProps) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}>
      {/* Toggle Switch */}
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />

        {/* Track */}
        <div
          className={`w-14 h-7 rounded-full transition-colors duration-300 ease-in-out ${
            checked
              ? 'bg-accent-burgundy'
              : 'bg-graphite-light/30'
          }`}
        >
          {/* Knob */}
          <div
            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
              checked ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </div>
      </div>

      {/* Label */}
      {label && (
        <span className="text-sm font-medium text-graphite-dark select-none">
          {label}
        </span>
      )}
    </label>
  );
}
