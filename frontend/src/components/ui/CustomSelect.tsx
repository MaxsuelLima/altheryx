import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  label,
  required,
  disabled,
  name,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-theme-text-secondary mb-1.5">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-all
          ${open ? "border-accent ring-2 ring-accent-light" : "border-theme-input-border hover:border-theme-border-primary"}
          bg-theme-input-bg text-theme-text-primary
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className={selected ? "text-theme-text-primary" : "text-theme-text-tertiary"}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setSearch("");
              }}
              className="p-0.5 rounded hover:bg-theme-bg-hover text-theme-text-tertiary"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-theme-text-tertiary transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-theme-dropdown-border bg-theme-dropdown-bg shadow-dropdown animate-fade-in">
          <div className="p-2 border-b border-theme-border-secondary">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-text-tertiary" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-2 text-sm rounded-md bg-theme-input-bg border border-theme-input-border text-theme-text-primary outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-theme-text-tertiary text-center">
                Nenhum resultado
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                    ${opt.value === value
                      ? "bg-accent-light text-accent font-medium"
                      : "text-theme-text-primary hover:bg-theme-dropdown-hover"
                    }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
