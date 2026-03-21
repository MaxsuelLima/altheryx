import { Pencil, Trash2 } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="rounded-xl border border-theme-card-border bg-theme-card-bg shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme-table-border bg-theme-table-header">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-theme-text-tertiary"
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-theme-text-tertiary w-24">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-table-border">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-4 py-12 text-center text-theme-text-tertiary text-sm"
                >
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-theme-table-hover transition-colors">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm text-theme-text-secondary">
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[String(col.key)] ?? "")}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-lg text-theme-text-tertiary hover:text-accent hover:bg-accent-subtle transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-1.5 rounded-lg text-theme-text-tertiary hover:text-danger hover:bg-danger-light transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
