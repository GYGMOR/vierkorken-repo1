/**
 * Responsive Table Component
 * Automatically converts to card layout on mobile/tablet
 */

import React from 'react';

export interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  mobileLabel?: string; // Optional different label for mobile
  hideOnMobile?: boolean; // Hide this column on mobile
  className?: string;
}

export interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  keyField?: string;
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  cardClassName?: string;
}

export function ResponsiveTable({
  columns,
  data,
  keyField = 'id',
  onRowClick,
  loading = false,
  emptyMessage = 'Keine Daten vorhanden',
  cardClassName = '',
}: ResponsiveTableProps) {
  if (loading) {
    return <div className="text-center py-12 text-graphite">Laden...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-12 text-graphite">{emptyMessage}</div>;
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-taupe-light">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left py-3 px-4 text-sm font-medium text-graphite-dark ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-taupe-light hover:bg-warmwhite-light transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key} className={`py-3 px-4 ${column.className || ''}`}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {data.map((row) => (
          <div
            key={row[keyField]}
            onClick={() => onRowClick?.(row)}
            className={`p-4 border border-taupe-light rounded-lg hover:bg-warmwhite-light transition-colors ${
              onRowClick ? 'cursor-pointer' : ''
            } ${cardClassName}`}
          >
            {columns
              .filter((column) => !column.hideOnMobile)
              .map((column) => (
                <div key={column.key} className="mb-3 last:mb-0">
                  <div className="text-xs text-graphite/60 mb-1">
                    {column.mobileLabel || column.label}
                  </div>
                  <div className="text-sm text-graphite-dark">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}
