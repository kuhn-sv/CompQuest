export interface Operation {
  id: string;
  command: string;
  description: string;
  correctDescriptionId?: string; // Tracks which description is actually correct
}

