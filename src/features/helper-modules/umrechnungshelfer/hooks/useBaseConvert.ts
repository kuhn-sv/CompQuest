import { useMemo } from 'react';

export const useBaseConvert = () => {
  const toBits = (n: number, width: number) =>
    Array.from({ length: width }, (_, i) => (n >> (width - 1 - i)) & 1);

  const bitsToDecimal = (bits: number[]) =>
    bits.reduce((sum, b, idx) => sum + b * (1 << (bits.length - 1 - idx)), 0);

  const decimalToHex = (n: number) => n.toString(16).toUpperCase();
  const decimalToOct = (n: number) => n.toString(8).toUpperCase();

  const bitsToOctalDigits = (bits: number[]): number[] => {
    const padded = [...bits];
    const rem = bits.length % 3;
    if (rem !== 0) {
      for (let i = 0; i < 3 - rem; i++) padded.unshift(0);
    }
    const digits: number[] = [];
    for (let i = 0; i < padded.length; i += 3) {
      const v = (padded[i] << 2) | (padded[i + 1] << 1) | padded[i + 2];
      digits.push(v);
    }
    while (digits.length > 1 && digits[0] === 0) digits.shift();
    return digits;
  };

  const octalDigitsToBits = (digits: number[], width: number): number[] => {
    const bin = digits
      .map(d => d.toString(2).padStart(3, '0'))
      .join('')
      .replace(/^0+(?=\d)/, '');
    const trimmed = bin.length === 0 ? '0' : bin;
    const padded = trimmed.length < width ? trimmed.padStart(width, '0') : trimmed.slice(-width);
    return padded.split('').map(c => Number(c) as 0 | 1);
  };

  const octalDigitsToString = (digits: number[]) => digits.join('');
  const octalDigitsToDecimal = (digits: number[]) =>
    digits.reduce((acc, d) => acc * 8 + d, 0);

  return useMemo(() => ({
    toBits,
    bitsToDecimal,
    decimalToHex,
    decimalToOct,
    bitsToOctalDigits,
    octalDigitsToBits,
    octalDigitsToString,
    octalDigitsToDecimal,
  }), []);
};
