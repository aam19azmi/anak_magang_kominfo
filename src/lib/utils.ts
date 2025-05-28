export function findHeaderIndex(rows: string[][], requiredHeaders: string[]): number {
  return rows.findIndex(row =>
    requiredHeaders.every(required => row.includes(required))
  );
}
