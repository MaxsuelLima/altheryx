import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  createLink?: string;
  createLabel?: string;
}

export default function PageHeader({ title, createLink, createLabel }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-theme-text-primary">{title}</h2>
      {createLink && (
        <Link
          to={createLink}
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={16} />
          {createLabel || "Novo"}
        </Link>
      )}
    </div>
  );
}
