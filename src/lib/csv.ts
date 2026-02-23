/**
 * CSV generation + download utility.
 * Includes BOM for Excel UTF-8 compatibility (important for French characters).
 */

export function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Wrap in quotes if it contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCSV(headers: string[], rows: unknown[][]): string {
  const headerLine = headers.map(escapeCSVField).join(',');
  const dataLines = rows.map((row) => row.map(escapeCSVField).join(','));
  return [headerLine, ...dataLines].join('\r\n');
}

export function downloadCSV(csv: string, filename: string): void {
  // BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
