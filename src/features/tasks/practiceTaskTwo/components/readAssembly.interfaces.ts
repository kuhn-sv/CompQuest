export interface AssemblyInstruction {
  addr: string;
  op: string;
  arg: string;
}

export interface AssemblyTask {
  id: string;
  variant: 1 | 2;
  question: string;
  program: AssemblyInstruction[];
  options: string[];
  correct_index: number;
  initial_values?: Record<string, number>;
}
