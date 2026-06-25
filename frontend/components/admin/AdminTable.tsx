import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column {
  key:   string;
  label: string;
  align?: "left" | "right" | "center";
}

interface AdminTableProps {
  columns:    Column[];
  data:       Record<string, unknown>[];
  total?:     number;
  page?:      number;
  pageSize?:  number;
  onPage?:    (p: number) => void;
  emptyText?: string;
  renderCell?: (key: string, value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export default function AdminTable({
  columns,
  data,
  total = 0,
  page = 1,
  pageSize = 6,
  onPage,
  emptyText = "No data available",
  renderCell,
}: AdminTableProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-2.5 pr-4 text-gray-500 font-semibold uppercase tracking-wider text-left`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-gray-300">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 pr-4 text-gray-700">
                      {renderCell
                        ? renderCell(col.key, row[col.key], row)
                        : String(row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          Showing 1–{Math.min(pageSize, data.length)} Registered Owners
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage?.(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded border border-gray-200 text-gray-400 hover:border-[#C9A36A] hover:text-[#C9A36A] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={12} />
          </button>
          <span className="px-2.5 py-1 text-[11px] bg-[#C9A36A] text-white rounded font-semibold">
            {page}
          </span>
          {totalPages > 1 && (
            <span className="px-2.5 py-1 text-[11px] border border-gray-200 rounded">
              {totalPages}
            </span>
          )}
          <button
            onClick={() => onPage?.(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded border border-gray-200 text-gray-400 hover:border-[#C9A36A] hover:text-[#C9A36A] disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
