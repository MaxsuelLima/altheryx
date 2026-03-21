import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  onCreate?: () => void;
  createLabel?: string;
}

export default function PageHeader({ title, onCreate, createLabel }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-theme-text-primary">{title}</h2>
      {onCreate && (
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={16} />
          {createLabel || "Novo"}
        </button>
      )}
    </div>
  );
}
