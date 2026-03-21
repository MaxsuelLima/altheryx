import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  createLink?: string;
  createLabel?: string;
}

export default function PageHeader({ title, createLink, createLabel }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {createLink && (
        <Link
          to={createLink}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          + {createLabel || "Novo"}
        </Link>
      )}
    </div>
  );
}
