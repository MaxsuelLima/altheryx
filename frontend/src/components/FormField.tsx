import CustomSelect, { type SelectOption } from "./ui/CustomSelect";
import CustomDatePicker from "./ui/CustomDatePicker";

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onValueChange?: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  options?: SelectOption[];
  textarea?: boolean;
}

export default function FormField({
  label,
  name,
  value,
  onChange,
  onValueChange,
  type = "text",
  required = false,
  placeholder,
  maxLength,
  options,
  textarea,
}: FormFieldProps) {
  const inputClass =
    "w-full px-3 py-2.5 border border-theme-input-border rounded-lg bg-theme-input-bg text-theme-text-primary text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent-light placeholder:text-theme-text-tertiary";

  if (options) {
    return (
      <CustomSelect
        label={label}
        name={name}
        required={required}
        options={options}
        value={value}
        onChange={(val) => {
          if (onValueChange) {
            onValueChange(val);
          } else {
            const syntheticEvent = {
              target: { name, value: val },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange(syntheticEvent);
          }
        }}
        placeholder={placeholder || "Selecione..."}
      />
    );
  }

  if (type === "date") {
    return (
      <CustomDatePicker
        label={label}
        name={name}
        required={required}
        value={value}
        onChange={(val) => {
          if (onValueChange) {
            onValueChange(val);
          } else {
            const syntheticEvent = {
              target: { name, value: val },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
          }
        }}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-theme-text-secondary mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={3}
          className={inputClass + " resize-none"}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className={inputClass}
        />
      )}
    </div>
  );
}
