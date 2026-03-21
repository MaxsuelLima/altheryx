import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="mb-4">
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-tertiary" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Buscar..."}
          className="w-full pl-9 pr-4 py-2.5 border border-theme-input-border rounded-lg bg-theme-input-bg text-theme-text-primary text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent-light placeholder:text-theme-text-tertiary"
        />
      </div>
    </div>
  );
}
