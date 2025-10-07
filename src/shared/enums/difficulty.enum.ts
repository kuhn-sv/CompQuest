// Shared difficulty enum (English values for internal consistency)
export enum Difficulty {
	Easy = 'easy',
	Medium = 'medium',
	Hard = 'hard',
	Expert = 'expert',
}

// Convenience array for iteration (UI selects, etc.)
export const DIFFICULTIES = [
	Difficulty.Easy,
	Difficulty.Medium,
	Difficulty.Hard,
	Difficulty.Expert,
] as const;
