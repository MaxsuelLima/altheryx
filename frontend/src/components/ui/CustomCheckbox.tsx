import { Check } from "lucide-react";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function CustomCheckbox({
  checked,
  onChange,
  label,
  disabled,
}: CustomCheckboxProps) {
  return (
    <label
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none text-sm
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center shrink-0 transition-all
          ${checked
            ? "bg-accent border-accent"
            : "border-theme-input-border bg-theme-input-bg hover:border-accent"
          }`}
      >
        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      </button>
      {label && <span className="text-theme-text-primary">{label}</span>}
    </label>
  );
}
