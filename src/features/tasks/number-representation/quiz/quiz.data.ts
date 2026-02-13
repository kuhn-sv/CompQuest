import type {QuizQuestion} from './quiz.interfaces';

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'Was sind Tetraden-Codes?',
    answers: [
      'Binärcode, der eine Zahl ziffernweise codiert',
      'Hexadezimal Darstellung von Zahlen',
      'Ein Fehlererkennungscode',
      'Eine Komprimierungsmethode',
    ],
    correctIndex: 0,
  },
  {
    id: 'q2',
    text: 'Was ist der am häufigsten eingesetzte Tetraden-Code?',
    answers: ['Gray-Code', 'Aiken-Code', 'BCD-Code', 'Stibitz-Code'],
    correctIndex: 2,
  },
  {
    id: 'q3',
    text: 'Welchen Nachteil haben Tetraden-Codes wie BCD-Code, Stibitz-Code, Aiken-Code oder Gray-Code?',
    answers: [
      'Zu komplex',
      'Nicht fehlererkennend',
      'Zu langsam in der Verarbeitung',
      'Benötigen zu viel Speicherplatz',
    ],
    correctIndex: 1,
  },
];

export const TOTAL = QUESTIONS.length;
