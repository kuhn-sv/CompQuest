/**
 * Shared types and interfaces for Assembly-related tasks
 */

/**
 * Represents a single assembly command with an operation and optional argument
 */
export interface AssemblyCommand {
  /** The operation code (e.g., 'LDA', 'ADD', 'STA') */
  op: string;
  /** The optional argument (e.g., '(13)', '#1', '15') or null */
  arg: string | null;
}

/**
 * Base interface for assembly tasks
 */
export interface BaseAssemblyTask {
  /** Unique task identifier */
  id: string;
  /** Difficulty level: 'leicht', 'mittel', or 'schwer' */
  difficulty: string;
}

