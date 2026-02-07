import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  speed?: number;
  startDelay?: number;
}

interface UseTypewriterReturn {
  displayedText: string;
  isComplete: boolean;
  /** Skip the animation and show the full text immediately */
  skip: () => void;
}

export const useTypewriter = (
  text: string,
  options: UseTypewriterOptions = {},
): UseTypewriterReturn => {
  const { speed = 35, startDelay = 200 } = options;
  const [charIndex, setCharIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCharIndex(0);
    setStarted(false);

    const delayId = setTimeout(() => setStarted(true), startDelay);
    return () => {
      clearTimeout(delayId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, startDelay]);

  // Advance one character at a time
  useEffect(() => {
    if (!started || charIndex >= text.length) return;

    timeoutRef.current = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, speed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [started, charIndex, text, speed]);

  const skip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCharIndex(text.length);
  }, [text]);

  return {
    displayedText: text.slice(0, charIndex),
    isComplete: charIndex >= text.length,
    skip,
  };
};
