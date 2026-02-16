/**
 * Centralised task_id → display name mapping.
 *
 * This is the **single source of truth** for how task IDs are rendered to
 * users.  Import this constant wherever you need a human-readable task title
 * instead of duplicating the strings.
 */
export const TASK_DISPLAY_NAMES: Record<string, string> = {
  'number-system': 'Zahlensystem-Decoder initialisieren',
  'positive-arithmetic': 'Additions-Schaltkreis prüfen',
  'complements': 'Negativzahlen-Modul wiederherstellen',
  'twos-complement-arithmetic': 'Vorzeichenbehaftete Recheneinheit aktivieren',
  'quiz': 'Systemcheck mit Tim',
  'von-neumann': 'Architekturcheck Von-Neumann',
  'read-assembly': 'Code-Interpreter aktivieren',
  'write-assembly': 'Befehlssequenzer reparieren',
  'java-to-assembly': 'Compiler-Brücke wiederherstellen',
  'fixed-floating-point': 'Dezimalzahl-Konverter einstellen',
};
