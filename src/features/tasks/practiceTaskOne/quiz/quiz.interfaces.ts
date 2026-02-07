export interface QuizQuestion {
  id: string;
  text: string;
  answers: string[]; // length 4
  correctIndex: number; // 0..3
}
