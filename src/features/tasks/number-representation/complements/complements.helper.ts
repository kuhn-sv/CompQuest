export type ComplementMode = 'ones' | 'twos';

export interface ComplementRound {
  id: string;
  mode: ComplementMode;
  sourceBits: number[]; // input binary to complement
  bitCount: number;
}

export const decimalToBits = (n: number, bitCount: number): number[] => {
  const max = (1 << bitCount) - 1;
  const clamped = Math.max(0, Math.min(n, max));
  const bin = clamped.toString(2).padStart(bitCount, '0');
  return bin.split('').map((ch) => (ch === '1' ? 1 : 0));
};

export const bitsToDecimal = (bits: number[]): number => {
  return bits.reduce((acc, b) => (acc << 1) + (b ? 1 : 0), 0);
};

export const bitsToString = (bits: number[]): string => bits.join('');

export const invertBits = (bits: number[]): number[] => bits.map((b: number) => (b === 0 ? 1 : 0));

export const addOne = (bits: number[]): number[] => {
  const out: number[] = [...bits];
  let carry = 1;
  for (let i = out.length - 1; i >= 0; i--) {
    const sum = out[i] + carry;
    out[i] = (sum & 1) as 0 | 1 as unknown as number;
    carry = sum >> 1;
  }
  return out;
};

export const twosComplement = (bits: number[]): number[] => addOne(invertBits(bits));

export const randomBits = (bitCount: number): number[] => {
  const n = Math.floor(Math.random() * ((1 << bitCount) - 1)); // avoid overflow to full 1s
  return decimalToBits(n, bitCount);
};

export const generateRounds = (count: number, bitCount: number = 8): ComplementRound[] => {
  // Requirement: First round is 'ones' complement, all subsequent rounds are 'twos' complement
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, i) => ({
    id: `round-${i + 1}`,
    mode: i === 0 ? 'ones' : 'twos',
    sourceBits: randomBits(bitCount),
    bitCount,
  }));
};
