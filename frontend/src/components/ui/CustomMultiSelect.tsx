import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface CustomMultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function CustomMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  label,
  required,
  disabled,
}: CustomMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabels = options.filter((o) => value.includes(o.value));
  const allSelected = filtered.length > 0 && filtered.every((o) => value.includes(o.value));

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

  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      const filteredValues = filtered.map((o) => o.value);
      onChange(value.filter((v) => !filteredValues.includes(v)));
    } else {
      const newValues = new Set([...value, ...filtered.map((o) => o.value)]);
      onChange(Array.from(newValues));
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-theme-text-secondary mb-1.5">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-all min-h-[42px]
          ${open ? "border-accent ring-2 ring-accent-light" : "border-theme-input-border hover:border-theme-border-primary"}
          bg-theme-input-bg text-theme-text-primary
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="flex-1 flex flex-wrap gap-1.5 min-w-0">
          {selectedLabels.length === 0 ? (
            <span className="text-theme-text-tertiary">{placeholder}</span>
          ) : selectedLabels.length <= 3 ? (
            selectedLabels.map((s) => (
              <span
                key={s.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-light text-accent text-xs font-medium"
              >
                {s.label}
                <X
                  size={12}
                  className="cursor-pointer hover:text-accent-hover"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(s.value);
                  }}
                />
              </span>
            ))
          ) : (
            <span className="text-theme-text-primary text-sm">
              {selectedLabels.length} selecionados
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {value.length > 0 && !disabled && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
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
            {filtered.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-accent hover:bg-theme-dropdown-hover font-medium border-b border-theme-border-secondary mb-1"
              >
                {allSelected ? "Desmarcar todos" : "Selecionar todos"}
              </button>
            )}
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-theme-text-tertiary text-center">
                Nenhum resultado
              </div>
            ) : (
              filtered.map((opt) => {
                const checked = value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors
                      ${checked ? "text-accent" : "text-theme-text-primary hover:bg-theme-dropdown-hover"}`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                        ${checked
                          ? "bg-accent border-accent"
                          : "border-theme-input-border bg-theme-input-bg"
                        }`}
                    >
                      {checked && <Check size={11} className="text-white" />}
                    </span>
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
