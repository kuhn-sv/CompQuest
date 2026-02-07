/**
 * Centralised task_id → display name mapping.
 *
 * This is the **single source of truth** for how task IDs are rendered to
 * users.  Import this constant wherever you need a human-readable task title
 * instead of duplicating the strings.
 */
export const TASK_DISPLAY_NAMES: Record<string, string> = {
  'number-system': 'Zahlensystem-Konverter',
  'positive-arithmetic': 'Positive Arithmetik',
  'complements': 'Einer- & Zweierkomplement',
  'twos-complement-arithmetic': 'Zweierkomplement-Arithmetik',
  'quiz': 'Quiz',
  'von-neumann': 'Von-Neumann-Architektur',
  'read-assembly': 'Assembler-Programm lesen',
  'write-assembly': 'Assembler-Programm schreiben',
  'java-to-assembly': 'Java → Assembler',
};
