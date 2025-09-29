/**
 * Helper functions for binary input row calculations
 */

/**
 * Converts an array of binary digits (0 or 1) to decimal
 * @param binaryArray Array of binary digits, where index 0 is the most significant bit
 * @returns The decimal representation of the binary number
 */
export const binaryToDecimal = (binaryArray: number[]): number => {
  return binaryArray.reduce((decimal, bit, index) => {
    const position = binaryArray.length - 1 - index;
    return decimal + (bit * Math.pow(2, position));
  }, 0);
};

/**
 * Validates if a binary array contains only valid binary digits (0 or 1)
 * @param binaryArray Array to validate
 * @returns True if all elements are 0 or 1, false otherwise
 */
export const isValidBinaryArray = (binaryArray: number[]): boolean => {
  return binaryArray.every(bit => bit === 0 || bit === 1);
};

/**
 * Creates a binary input helper with utility functions
 * @param bitCount Number of bits in the binary representation (default: 8)
 */
export const createBinaryInputHelper = (bitCount: number = 8) => {
  
  /**
   * Calculates the decimal value from current binary state
   * @param binaryValues Array of current binary values
   * @returns Decimal representation or 0 if invalid
   */
  const calculateResult = (binaryValues: number[]): number => {
    if (binaryValues.length !== bitCount) {
      return 0;
    }
    
    if (!isValidBinaryArray(binaryValues)) {
      return 0;
    }
    
    return binaryToDecimal(binaryValues);
  };

  /**
   * Gets the maximum possible value for the given bit count
   * @returns Maximum decimal value (2^bitCount - 1)
   */
  const getMaxValue = (): number => {
    return Math.pow(2, bitCount) - 1;
  };

  /**
   * Formats the result for display
   * @param result Decimal result
   * @returns Formatted string representation
   */
  const formatResult = (result: number): string => {
    return result.toString();
  };

  return {
    calculateResult,
    getMaxValue,
    formatResult,
    bitCount
  };
};
