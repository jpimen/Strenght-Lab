import type { CellData, CellState } from '../types/spreadsheet';

export interface ProgramGridRow {
  week: number;
  day: number;
  row: number;
  rowKey: string;
}

const ROW_KEY_PATTERN = /^W(\d+)_D(\d+)_R(\d+)$/;
const CELL_KEY_PATTERN = /^(W\d+_D\d+_R\d+)_/;

function hasCellContent(cell: CellData | undefined): boolean {
  if (!cell) return false;
  return Boolean(cell.raw.trim() || cell.resolved.trim() || cell.error);
}

export function parseProgramRowKey(rowKey: string): ProgramGridRow | null {
  const match = rowKey.match(ROW_KEY_PATTERN);
  if (!match) return null;

  const [, week, day, row] = match;
  return {
    week: Number(week),
    day: Number(day),
    row: Number(row),
    rowKey,
  };
}

function getRowKeyFromCellKey(cellKey: string): string | null {
  const match = cellKey.match(CELL_KEY_PATTERN);
  return match?.[1] ?? null;
}

interface VisibleProgramRowsOptions {
  cells: CellState;
  rowLabels?: Record<string, string>;
  weekCount: number;
  dayCount: number;
  minimumRowsPerDay?: number;
  trailingBlankRows?: number;
}

export function getVisibleProgramRows({
  cells,
  rowLabels = {},
  weekCount,
  dayCount,
  minimumRowsPerDay = 1,
  trailingBlankRows = 1,
}: VisibleProgramRowsOptions): ProgramGridRow[] {
  if (weekCount <= 0 || dayCount <= 0) {
    return [];
  }

  const highestUsedRowByDay = new Map<string, number>();

  Object.entries(cells).forEach(([cellKey, cell]) => {
    if (!hasCellContent(cell)) return;

    const rowKey = getRowKeyFromCellKey(cellKey);
    if (!rowKey) return;

    const parsed = parseProgramRowKey(rowKey);
    if (!parsed) return;
    if (parsed.week > weekCount || parsed.day > dayCount) return;

    const groupKey = `W${parsed.week}_D${parsed.day}`;
    const previousHighest = highestUsedRowByDay.get(groupKey) ?? -1;
    highestUsedRowByDay.set(groupKey, Math.max(previousHighest, parsed.row));
  });

  Object.entries(rowLabels).forEach(([rowKey, label]) => {
    if (!label.trim()) return;

    const parsed = parseProgramRowKey(rowKey);
    if (!parsed) return;
    if (parsed.week > weekCount || parsed.day > dayCount) return;

    const groupKey = `W${parsed.week}_D${parsed.day}`;
    const previousHighest = highestUsedRowByDay.get(groupKey) ?? -1;
    highestUsedRowByDay.set(groupKey, Math.max(previousHighest, parsed.row));
  });

  const rows: ProgramGridRow[] = [];

  for (let week = 1; week <= weekCount; week += 1) {
    for (let day = 1; day <= dayCount; day += 1) {
      const groupKey = `W${week}_D${day}`;
      const highestUsedRow = highestUsedRowByDay.get(groupKey) ?? -1;
      const visibleRowCount = Math.max(minimumRowsPerDay, highestUsedRow + 1 + trailingBlankRows);

      for (let row = 0; row < visibleRowCount; row += 1) {
        rows.push({
          week,
          day,
          row,
          rowKey: `W${week}_D${day}_R${row}`,
        });
      }
    }
  }

  return rows;
}
