/**
 * Spreadsheet Formula Engine
 * Evaluates formulas and cell references
 */

import type { SpreadsheetData, CellData, FormulaResult } from '../components/spreadsheet/types';

export class FormulaEngine {
  private data: SpreadsheetData;

  constructor(data: SpreadsheetData) {
    this.data = data;
  }

  evaluate(formula: string): FormulaResult {
    if (!formula.startsWith('=')) {
      return { value: formula };
    }

    const expression = formula.slice(1).trim();

    try {
      const result = this.parseExpression(expression);
      return { value: String(result) };
    } catch (error) {
      return {
        value: '#ERROR!',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private parseExpression(expression: string): string | number | Array<string | number> {
    // Handle functions
    if (expression.includes('(')) {
      return this.evaluateFunction(expression);
    }

    // Handle cell references and ranges
    if (this.isCellReference(expression) || this.isRangeReference(expression)) {
      return this.evaluateReference(expression);
    }

    // Handle arithmetic expressions
    return this.evaluateArithmetic(expression);
  }

  private evaluateFunction(expression: string): string | number {
    const functionMatch = expression.match(/^(\w+)\((.*)\)$/);
    if (!functionMatch) {
      throw new Error('Invalid function syntax');
    }

    const [, functionName, args] = functionMatch;
    const argList = this.parseArguments(args);

    switch (functionName.toUpperCase()) {
      case 'SUM':
        return this.sum(argList);
      case 'AVERAGE':
      case 'AVG':
        return this.average(argList);
      case 'MAX':
        return this.max(argList);
      case 'MIN':
        return this.min(argList);
      case 'COUNT':
        return this.count(argList);
      case 'ROUND':
        return this.round(argList);
      case 'ABS':
        return this.abs(argList);
      case 'SQRT':
        return this.sqrt(argList);
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }

  private parseArguments(args: string): Array<string | number | Array<string | number>> {
    const parsedArgs: Array<string | number | Array<string | number>> = [];
    let currentArg = '';
    let parenDepth = 0;

    for (let i = 0; i < args.length; i++) {
      const char = args[i];

      if (char === '(') {
        parenDepth++;
        currentArg += char;
      } else if (char === ')') {
        parenDepth--;
        currentArg += char;
      } else if (char === ',' && parenDepth === 0) {
        parsedArgs.push(this.parseExpression(currentArg.trim()));
        currentArg = '';
      } else {
        currentArg += char;
      }
    }

    if (currentArg.trim()) {
      parsedArgs.push(this.parseExpression(currentArg.trim()));
    }

    return parsedArgs;
  }

  private evaluateReference(reference: string): string | number | Array<string | number> {
    if (this.isRangeReference(reference)) {
      const [start, end] = reference.split(':');
      const cells = this.getRangeCells(start, end);
      return cells.map(cellId => this.getCellValue(cellId));
    } else if (this.isCellReference(reference)) {
      return this.getCellValue(reference);
    }

    throw new Error(`Invalid reference: ${reference}`);
  }

  private evaluateArithmetic(expression: string): number {
    // Simple arithmetic evaluation
    // In a real implementation, you'd use a proper expression parser
    try {
      // Replace cell references with their values
      let processedExpression = expression;

      // Find all cell references in the expression
      const cellRefs = expression.match(/[A-Z]+\d+/g) || [];
      cellRefs.forEach(ref => {
        const value = this.getCellValue(ref);
        const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
        processedExpression = processedExpression.replace(
          new RegExp(`\\b${ref}\\b`, 'g'),
          String(numValue)
        );
      });

      // Use Function constructor for safe evaluation
      // In production, use a proper math expression parser
      const result = new Function(`"use strict"; return (${processedExpression})`)();
      return typeof result === 'number' ? result : 0;
    } catch (error) {
      throw new Error(`Arithmetic error: ${expression}`);
    }
  }

  private getCellValue(cellId: string): string | number {
    const cell = this.data.cells[cellId];
    if (!cell) return 0;

    if (cell.computed !== undefined) {
      return cell.computed;
    }

    const numValue = parseFloat(cell.value);
    return isNaN(numValue) ? cell.value : numValue;
  }

  private getRangeCells(start: string, end: string): string[] {
    const startPos = this.parseCellPosition(start);
    const endPos = this.parseCellPosition(end);

    const cells: string[] = [];
    const minRow = Math.min(startPos.row, endPos.row);
    const maxRow = Math.max(startPos.row, endPos.row);
    const minCol = Math.min(startPos.col, endPos.col);
    const maxCol = Math.max(startPos.col, endPos.col);

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        cells.push(`${numberToColumnLabel(col)}${row + 1}`);
      }
    }

    return cells;
  }

  private parseCellPosition(cellId: string): { row: number; col: number } {
    const match = cellId.match(/^([A-Z]+)(\d+)$/);
    if (!match) throw new Error(`Invalid cell reference: ${cellId}`);

    const colLabel = match[1];
    const rowNum = parseInt(match[2], 10) - 1;
    const colNum = columnLabelToNumber(colLabel);

    return { row: rowNum, col: colNum };
  }

  private isCellReference(str: string): boolean {
    return /^[A-Z]+\d+$/.test(str);
  }

  private isRangeReference(str: string): boolean {
    return /^[A-Z]+\d+:[A-Z]+\d+$/.test(str);
  }

  // Function implementations
  private sum(args: Array<string | number | Array<string | number>>): number {
    const flattened = args.flat(2).map((arg) => {
      if (Array.isArray(arg)) {
        return arg;
      }
      return arg;
    });

    const flatArgs = flattened.flat().map((arg) =>
      typeof arg === 'number' ? arg : parseFloat(String(arg)) || 0
    );

    return flatArgs.reduce((sum, num) => sum + num, 0);
  }

  private average(args: Array<string | number | Array<string | number>>): number {
    const total = this.sum(args);
    const count = args.flat(2).length;
    if (count === 0) return 0;
    return total / count;
  }

  private max(args: Array<string | number | Array<string | number>>): number {
    const flatArgs = args.flat(2).map((arg) =>
      typeof arg === 'number' ? arg : parseFloat(String(arg)) || 0
    );

    return Math.max(...flatArgs);
  }

  private min(args: Array<string | number | Array<string | number>>): number {
    const flatArgs = args.flat(2).map((arg) =>
      typeof arg === 'number' ? arg : parseFloat(String(arg)) || 0
    );

    return Math.min(...flatArgs);
  }

  private count(args: Array<string | number | Array<string | number>>): number {
    return args.flat(2).length;
  }

  private round(args: Array<string | number | Array<string | number>>): number {
    if (args.length < 1) throw new Error('ROUND requires at least 1 argument');
    const value = typeof args[0] === 'number' ? args[0] : parseFloat(String(args[0])) || 0;
    const decimals = args.length > 1 ? (typeof args[1] === 'number' ? args[1] : parseFloat(String(args[1])) || 0) : 0;
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  private abs(args: Array<string | number | Array<string | number>>): number {
    if (args.length !== 1) throw new Error('ABS requires 1 argument');
    const arg = args.flat(2)[0];
    const value = typeof arg === 'number' ? arg : parseFloat(String(arg)) || 0;
    return Math.abs(value);
  }

  private sqrt(args: Array<string | number | Array<string | number>>): number {
    if (args.length !== 1) throw new Error('SQRT requires 1 argument');
    const arg = args.flat(2)[0];
    const value = typeof arg === 'number' ? arg : parseFloat(String(arg)) || 0;
    if (value < 0) throw new Error('SQRT of negative number');
    return Math.sqrt(value);
  }
}

// Helper functions
function numberToColumnLabel(num: number): string {
  let label = '';
  let n = num;

  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }

  return label;
}

function columnLabelToNumber(label: string): number {
  let result = 0;
  for (let i = 0; i < label.length; i++) {
    result = result * 26 + (label.charCodeAt(i) - 65 + 1);
  }
  return result - 1;
}

// Export a function to evaluate formulas
export function evaluateFormula(formula: string, data: SpreadsheetData): FormulaResult {
  const engine = new FormulaEngine(data);
  return engine.evaluate(formula);
}

// Export a function to update all computed values
export function updateComputedValues(data: SpreadsheetData): SpreadsheetData {
  const engine = new FormulaEngine(data);
  const updatedCells: Record<string, CellData> = {};

  Object.entries(data.cells).forEach(([cellId, cell]) => {
    if (cell.value.startsWith('=')) {
      const result = engine.evaluate(cell.value);
      let computedValue = result.value;
      if (Array.isArray(result.value)) {
        computedValue = result.value.join(', ');
      }

      updatedCells[cellId] = {
        ...cell,
        computed: String(computedValue),
        error: result.error
      };
    } else {
      updatedCells[cellId] = {
        ...cell,
        computed: cell.value,
        error: undefined
      };
    }
  });

  return {
    ...data,
    cells: updatedCells
  };
}