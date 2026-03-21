import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  name?: string;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function CustomDatePicker({
  value,
  onChange,
  label,
  required,
  disabled,
  placeholder = "dd/mm/aaaa",
  name,
}: CustomDatePickerProps) {
  const today = new Date();
  const parsed = value ? new Date(value + "T00:00:00") : null;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const selectDay = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    onChange(formatDate(date));
    setOpen(false);
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!parsed) return false;
    return (
      day === parsed.getDate() &&
      viewMonth === parsed.getMonth() &&
      viewYear === parsed.getFullYear()
    );
  };

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
        onClick={() => {
          if (!open && parsed) {
            setViewYear(parsed.getFullYear());
            setViewMonth(parsed.getMonth());
          }
          setOpen(!open);
        }}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-all
          ${open ? "border-accent ring-2 ring-accent-light" : "border-theme-input-border hover:border-theme-border-primary"}
          bg-theme-input-bg text-theme-text-primary
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-theme-text-tertiary" />
          <span className={value ? "text-theme-text-primary" : "text-theme-text-tertiary"}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-0.5 rounded hover:bg-theme-bg-hover text-theme-text-tertiary"
            >
              <X size={14} />
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-lg border border-theme-dropdown-border bg-theme-dropdown-bg shadow-dropdown animate-fade-in p-3">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-md hover:bg-theme-bg-hover text-theme-text-secondary"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-theme-text-primary">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-md hover:bg-theme-bg-hover text-theme-text-secondary"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-theme-text-tertiary py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`w-full aspect-square flex items-center justify-center text-sm rounded-md transition-colors
                    ${isSelected(day)
                      ? "bg-accent text-white font-semibold"
                      : isToday(day)
                        ? "bg-accent-subtle text-accent font-medium"
                        : "text-theme-text-primary hover:bg-theme-dropdown-hover"
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-theme-border-secondary">
            <button
              type="button"
              onClick={() => {
                onChange(formatDate(today));
                setOpen(false);
              }}
              className="w-full text-center text-xs text-accent hover:text-accent-hover font-medium py-1"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
