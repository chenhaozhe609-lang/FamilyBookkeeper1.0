type Column = { key: string; header: string; className?: string };
type Props = {
  columns: Column[];
  rows: Record<string, React.ReactNode>[];
};

export default function Table({ columns, rows }: Props) {
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-auto">
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 bg-white">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left text-xs font-medium text-gray-600 px-3 py-2 border-b">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="hover:bg-green-50/50">
              {columns.map((c) => (
                <td key={c.key} className={`text-sm px-3 py-2 border-b ${c.className ?? ""}`}>
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
