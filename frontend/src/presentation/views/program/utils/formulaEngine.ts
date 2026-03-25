/**
 * Formula Engine - Core parser and resolver
 * Handles formula parsing, variable substitution, function evaluation,
 * and reactive dependency resolution
 */

import type { CellState, ParseFormulaResult, VariableState, DependencyGraph } from '../types/spreadsheet';

/**
 * Parse and evaluate a single formula string
 * Returns { resolved, error }
 *
 * Supported formats:
 * - Raw values: "85%", "4" → returned as-is
 * - Variable refs: "=SQ_1RM", "=BP_1RM * 0.85"
 * - Cell refs: "=W1_D1_R0_intensity + 5%"
 * - Functions: "=ROUND(SQ_1RM * 0.75, 2.5)"
 * - Ranges: "=SUM(W1_D1_R0_sets : W1_D3_R5_sets)"
 */
export function parseFormula(
  raw: string,
  cells: CellState,
  variables: VariableState
): ParseFormulaResult {
  // Non-formula strings returned as-is
  if (!raw.startsWith('=')) {
    return { resolved: raw, error: null };
  }

  let expr = raw.slice(1).trim();

  try {
    // 1. Substitute named variables with their values
    Object.entries(variables).forEach(([key, val]) => {
      const numVal = typeof val === 'number' ? val : parseFloat(String(val));
      expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), String(numVal));
    });

    // 2. Expand range references (W1_D1_R0_field : W4_D1_R0_field) to comma-separated
    expr = expandRangeReferences(expr, cells);

    // 3. Substitute individual cell references (W1_D1_R0_field)
    const cellRefPattern = /W\d+_D\d+_R\d+_\w+/g;
    expr = expr.replace(cellRefPattern, (ref) => {
      const cell = cells[ref];
      if (!cell) return '0';

      // Recursively parse referenced cell if it's a formula
      if (cell.raw.startsWith('=')) {
        const result = parseFormula(cell.raw, cells, variables);
        if (result.error) return '0'; // treat error as 0
        const val = parseFloat(result.resolved);
        return isNaN(val) ? `"${result.resolved}"` : String(val);
      }

      const val = parseFloat(cell.resolved);
      return isNaN(val) ? `"${cell.resolved}"` : String(val);
    });

    // 4. Replace built-in functions
    expr = replaceFunctions(expr);

    // 5. Handle percentage suffixes (e.g., "85%" → 0.85)
    expr = expr.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1 / 100)');

    // 6. Safely evaluate
    const result = new Function(`"use strict"; return (${expr})`)();
    return {
      resolved: String(result),
      error: null,
    };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    return {
      resolved: '#ERR',
      error: errorMsg,
    };
  }
}

/**
 * Expand range references like "W1_D1_R0_sets : W4_D1_R0_sets" to comma-separated list
 */
function expandRangeReferences(expr: string, cells: CellState): string {
  const rangePattern = /(W\d+_D\d+_R\d+_\w+)\s*:\s*(W\d+_D\d+_R\d+_\w+)/g;

  return expr.replace(rangePattern, (_match, start, end) => {
    // Simple expansion: assume ranges are sequential
    // In a production system, would need to parse start/end indices
    const cells_list = Object.keys(cells)
      .filter(
        (key) =>
          key >= start && key <= end && key.split('_').pop() === start.split('_').pop()
      )
      .map((key) => {
        const cell = cells[key];
        const val = parseFloat(cell?.resolved || '0');
        return isNaN(val) ? `"${cell?.resolved}"` : String(val);
      });

    return cells_list.length > 0 ? cells_list.join(',') : '0';
  });
}

/**
 * Replace all built-in function calls with evaluable expressions
 */
function replaceFunctions(expr: string): string {
  return (
    expr
      // ROUND(value, step) → Math.round(value / step) * step
      .replace(/ROUND\(([^,]+),\s*([^)]+)\)/g, (_, val, step) => {
        return `(Math.round((${val}) / (${step})) * (${step}))`;
      })
      // TONNAGE(sets, reps, load) → sets * reps * load
      .replace(/TONNAGE\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, (_, s, r, l) => {
        return `((${s}) * (${r}) * (${l}))`;
      })
      // RPE(rpe_val, reps) → estimated 1RM
      .replace(/RPE\(([^,]+),\s*([^)]+)\)/g, (_, rpe, reps) => {
        return `((${rpe}) * (1 + 0.0333 * (${reps})))`;
      })
      // IF(condition, true_val, false_val)
      .replace(/IF\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, (_, cond, t, f) => {
        return `((${cond}) ? (${t}) : (${f}))`;
      })
      // SUM(a, b, c) → a + b + c
      .replace(/SUM\(([^)]+)\)/g, (_, args) => {
        return `(${args.split(',').join('+')})`;
      })
      // AVG(a, b, c) → (a + b + c) / 3
      .replace(/AVG\(([^)]+)\)/g, (_, args) => {
        const parts = args.split(',');
        return `((${parts.join('+')}) / ${parts.length})`;
      })
      // MAX/MIN
      .replace(/MAX\(([^)]+)\)/g, (_, args) => `Math.max(${args})`)
      .replace(/MIN\(([^)]+)\)/g, (_, args) => `Math.min(${args})`)
      // AUTOLOAD(base_1rm, intensity_pct, weekly_increment) → progressive load
      .replace(
        /AUTOLOAD\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g,
        (_, base, pct, inc) => {
          return `(Math.round(((${base}) * (${pct}) + (WEEK-1) * (${inc})) / 2.5) * 2.5)`;
        }
      )
  );
}

/**
 * Build a dependency graph showing which cells reference which
 * Returns: { cellKey: [list of cells that depend on cellKey] }
 */
export function buildDependencyGraph(cells: CellState): DependencyGraph {
  const graph: DependencyGraph = {};

  // Initialize all cells in graph
  Object.keys(cells).forEach((key) => {
    if (!graph[key]) {
      graph[key] = [];
    }
  });

  // Find dependencies
  const cellRefPattern = /W\d+_D\d+_R\d+_\w+/g;
  Object.entries(cells).forEach(([key, cell]) => {
    const deps = cell.raw.match(cellRefPattern) || [];
    deps.forEach((dep) => {
      if (!graph[dep]) {
        graph[dep] = [];
      }
      graph[dep].push(key);
    });
  });

  return graph;
}

/**
 * Resolve all cells using topological sort to handle dependencies correctly
 * Ensures no stale values when formulas reference other cells
 */
export function resolveAll(cells: CellState, variables: VariableState): CellState {
  const resolved = { ...cells };
  const visited = new Set<string>();

  function resolveTopo(key: string) {
    if (visited.has(key)) return;
    visited.add(key);

    const cell = resolved[key];
    if (!cell) return;

    // Recursively resolve dependencies first
    if (cell.raw.startsWith('=')) {
      const cellRefPattern = /W\d+_D\d+_R\d+_\w+/g;
      const deps = cell.raw.match(cellRefPattern) || [];
      deps.forEach((dep) => {
        if (resolved[dep]) {
          resolveTopo(dep);
        }
      });
    }

    // Then resolve this cell
    if (cell.raw.startsWith('=')) {
      const result = parseFormula(cell.raw, resolved, variables);
      resolved[key] = {
        ...cell,
        resolved: result.resolved,
        error: result.error,
      };
    }
  }

  Object.keys(cells).forEach((key) => resolveTopo(key));
  return resolved;
}

/**
 * Get all cells with errors
 */
export function getErrorCells(cells: CellState): Array<{ key: string; error: string }> {
  return Object.entries(cells)
    .filter(([, cell]) => cell.error !== null)
    .map(([key, cell]) => ({
      key,
      error: cell.error || 'Unknown error',
    }));
}

/**
 * Get cells that a given cell depends on
 */
export function getDependencies(key: string, cells: CellState): string[] {
  const cell = cells[key];
  if (!cell) return [];

  const cellRefPattern = /W\d+_D\d+_R\d+_\w+/g;
  return cell.raw.match(cellRefPattern) || [];
}

/**
 * Get cells that depend on a given cell (reverse dependencies)
 */
export function getDependents(key: string, graph: DependencyGraph): string[] {
  return graph[key] || [];
}
