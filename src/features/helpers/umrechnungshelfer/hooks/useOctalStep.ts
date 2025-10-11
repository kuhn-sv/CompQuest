import { useMemo, useState } from 'react';
import { useBaseConvert } from './useBaseConvert';

const BITS = 8;

export const useOctalStep = (expectedOctDigits: number[], expectedDec: number) => {
  const { octalDigitsToDecimal } = useBaseConvert();
  const [octEntries, setOctEntries] = useState<Array<number | null>>(
    Array(BITS).fill(null),
  );

  const expectedOctalDigitsPadded = useMemo(() => {
    const digits = expectedOctDigits;
    const needed = Math.max(0, BITS - digits.length);
    return [...Array(needed).fill(0), ...digits];
  }, [expectedOctDigits]);

  const userOctDigits = useMemo(
    () =>
      octEntries.map(v => (v == null ? 0 : (Math.max(0, Math.min(7, v)) as number))),
    [octEntries],
  );

  const userOctDec = useMemo(
    () => octalDigitsToDecimal(userOctDigits),
    [octalDigitsToDecimal, userOctDigits],
  );

  const isCorrect = userOctDec === expectedDec;

  const onChange = (idx: number, val: number | null) =>
    setOctEntries(prev => prev.map((v, i) => (i === idx ? (val ?? null) : v)));

  const reset = () => setOctEntries(Array(BITS).fill(null));

  return {
    octEntries,
    setOctEntries,
    expectedOctalDigitsPadded,
    userOctDec,
    isCorrect,
    onChange,
    reset,
  } as const;
};
