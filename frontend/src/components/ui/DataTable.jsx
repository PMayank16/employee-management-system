export function DataTable({ columns, rows, emptyMessage = "No records yet." }) {
  if (!rows?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 px-4 py-12 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/60 bg-white/50 shadow-inner shadow-slate-100/80">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 bg-gradient-to-r from-primary/5 to-transparent">
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? row.key ?? i}
              className="border-b border-slate-100 transition-colors last:border-0 hover:bg-primary/[0.03]"
            >
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-slate-800">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
