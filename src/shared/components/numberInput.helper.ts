export interface NumberInputConfig {
  min: number;
  max: number;
}

export const createNumberInputHelpers = (config: NumberInputConfig) => {
  const { min, max } = config;

  const clampValue = (value: number): number => {
    return Math.max(min, Math.min(max, value));
  };

  const increment = (currentValue: number): number => {
    return currentValue < max ? currentValue + 1 : currentValue;
  };

  const decrement = (currentValue: number): number => {
    return currentValue > min ? currentValue - 1 : currentValue;
  };

  const parseInputValue = (inputValue: string): number => {
    const parsedValue = parseInt(inputValue) || min;
    return clampValue(parsedValue);
  };

  const canIncrement = (currentValue: number): boolean => {
    return currentValue < max;
  };

  const canDecrement = (currentValue: number): boolean => {
    return currentValue > min;
  };

  return {
    clampValue,
    increment,
    decrement,
    parseInputValue,
    canIncrement,
    canDecrement,
  };
};