/**
 * Template Engine
 * Predefined training program templates that coaches can apply
 */

import type { CellState, TemplateDefinition, VariableState } from '../types/spreadsheet';

/**
 * Linear Progression template
 * Week-by-week intensity increase
 */
export const linearProgressionTemplate: TemplateDefinition = {
  name: 'Linear Progression',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generate: (_weeks: number, variables: VariableState | null): CellState => {
    const cells: CellState = {};
    const squat1RM = (variables?.SQ_1RM as number) || 315;

    for (let w = 1; w <= 4; w++) {
      const intensity = 70 + w * 2.5; // 72.5%, 75%, 77.5%, 80%
      const day = 1;
      const row = 0;
      const cellKey = `W${w}_D${day}_R${row}`;

      cells[`${cellKey}_intensity`] = {
        raw: String(intensity),
        resolved: String(intensity),
        error: null,
      };

      cells[`${cellKey}_sets`] = {
        raw: String(3 + (w > 2 ? 1 : 0)),
        resolved: String(3 + (w > 2 ? 1 : 0)),
        error: null,
      };

      cells[`${cellKey}_reps`] = {
        raw: '5',
        resolved: '5',
        error: null,
      };

      cells[`${cellKey}_load`] = {
        raw: `=ROUND(SQ_1RM * ${intensity / 100}, 2.5)`,
        resolved: String(Math.round((squat1RM * intensity) / 100 / 2.5) * 2.5),
        error: null,
      };

      cells[`${cellKey}_rest`] = {
        raw: '3',
        resolved: '3',
        error: null,
      };
    }

    return cells;
  },
};

/**
 * Texas Method template
 * Volume Monday, Intensity Wednesday, Light Friday
 */
export const texasMethodTemplate: TemplateDefinition = {
  name: 'Texas Method',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generate: (_weeks: number, _variables: VariableState | null): CellState => {
    const cells: CellState = {};
    const rows = [
      { day: 1, intensity: 75, sets: 5, reps: 5, rest: 3 }, // Mon: high volume
      { day: 2, intensity: 70, sets: 3, reps: 5, rest: 2 }, // Wed: high intensity
      { day: 3, intensity: 65, sets: 3, reps: 5, rest: 2 }, // Fri: light
    ];

    for (let w = 1; w <= 4; w++) {
      rows.forEach((row) => {
        const cellKey = `W${w}_D${row.day}_R0`;
        cells[`${cellKey}_intensity`] = {
          raw: String(row.intensity + (w - 1) * 2.5),
          resolved: String(row.intensity + (w - 1) * 2.5),
          error: null,
        };
        cells[`${cellKey}_sets`] = {
          raw: String(row.sets),
          resolved: String(row.sets),
          error: null,
        };
        cells[`${cellKey}_reps`] = {
          raw: String(row.reps),
          resolved: String(row.reps),
          error: null,
        };
        cells[`${cellKey}_rest`] = {
          raw: String(row.rest),
          resolved: String(row.rest),
          error: null,
        };
      });
    }

    return cells;
  },
};

/**
 * 5/3/1 Block template
 * Four-week progressive block: 5s, 3s, 1s, deload
 */
export const fiveThreeOneTemplate: TemplateDefinition = {
  name: '5/3/1 Block',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generate: (_weeks: number, _variables: VariableState | null): CellState => {
    const cells: CellState = {};
    const baseIntensity = 65;
    const blocks = [
      { week: 1, reps: 5, intensity: 5 },
      { week: 2, reps: 5, intensity: 7 },
      { week: 3, reps: 3, intensity: 9 },
      { week: 4, reps: 5, intensity: 3 }, // deload
    ];

    blocks.forEach(({ week, reps, intensity }) => {
      const cellKey = `W${week}_D1_R0`;
      cells[`${cellKey}_intensity`] = {
        raw: String(baseIntensity + intensity),
        resolved: String(baseIntensity + intensity),
        error: null,
      };
      cells[`${cellKey}_sets`] = {
        raw: '3',
        resolved: '3',
        error: null,
      };
      cells[`${cellKey}_reps`] = {
        raw: String(reps),
        resolved: String(reps),
        error: null,
      };
    });

    return cells;
  },
};

/**
 * Daily Undulating Periodization template
 * Different rep ranges each session
 */
export const dailyUndulatingTemplate: TemplateDefinition = {
  name: 'Daily Undulating',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generate: (_weeks: number, _variables: VariableState | null): CellState => {
    const cells: CellState = {};
    const sessions = [
      { day: 1, rep_range: 'low', intensity: 80, reps: 3, sets: 5 },
      { day: 2, rep_range: 'mid', intensity: 75, reps: 5, sets: 4 },
      { day: 3, rep_range: 'high', intensity: 70, reps: 8, sets: 3 },
    ];

    for (let w = 1; w <= 4; w++) {
      sessions.forEach(({ day, intensity, reps, sets }) => {
        const cellKey = `W${w}_D${day}_R0`;
        cells[`${cellKey}_intensity`] = {
          raw: String(intensity),
          resolved: String(intensity),
          error: null,
        };
        cells[`${cellKey}_sets`] = {
          raw: String(sets),
          resolved: String(sets),
          error: null,
        };
        cells[`${cellKey}_reps`] = {
          raw: String(reps),
          resolved: String(reps),
          error: null,
        };
      });
    }

    return cells;
  },
};

export const templates: Record<string, TemplateDefinition> = {
  linearProgression: linearProgressionTemplate,
  texasMethod: texasMethodTemplate,
  fiveThreeOne: fiveThreeOneTemplate,
  dailyUndulating: dailyUndulatingTemplate,
};

export function getTemplateList(): Array<{ id: string; name: string }> {
  return Object.entries(templates).map(([id, template]) => ({
    id,
    name: template.name,
  }));
}
