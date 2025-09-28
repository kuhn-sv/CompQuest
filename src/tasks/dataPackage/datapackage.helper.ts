/**
 * Helper functions for DataPackage page operations
 */

/**
 * Generates a random number between min and max (inclusive)
 * @param min Minimum value (default: 0)
 * @param max Maximum value (default: 255)
 * @returns Random integer between min and max
 */
export const generateRandomNumber = (min: number = 0, max: number = 255): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Validates if a number is within the valid range for 8-bit values
 * @param value Number to validate
 * @returns True if the number is between 0 and 255, false otherwise
 */
export const isValidByteValue = (value: number): boolean => {
  return Number.isInteger(value) && value >= 0 && value <= 255;
};

/**
 * Converts a decimal number to binary array representation
 * @param decimal Decimal number to convert (0-255)
 * @param bitCount Number of bits (default: 8)
 * @returns Array of binary digits (0 or 1)
 */
export const decimalToBinaryArray = (decimal: number, bitCount: number = 8): number[] => {
  if (!isValidByteValue(decimal)) {
    throw new Error(`Invalid decimal value: ${decimal}. Must be between 0 and 255.`);
  }
  
  const binary = decimal.toString(2).padStart(bitCount, '0');
  return binary.split('').map(bit => parseInt(bit, 10));
};

/**
 * Creates a data package helper with utility functions
 */
export const createDataPackageHelper = () => {
  
  /**
   * Generates a new random challenge number
   * @returns Random number between 0 and 255
   */
  const generateChallenge = (): number => {
    return generateRandomNumber(0, 255);
  };

  /**
   * Formats a number for display in the input field
   * @param value Number to format
   * @returns Formatted string representation
   */
  const formatDisplayValue = (value: number): string => {
    return value.toString();
  };

  /**
   * Gets the binary representation of a decimal number
   * @param decimal Decimal number to convert
   * @returns Binary array representation
   */
  const getBinaryRepresentation = (decimal: number): number[] => {
    try {
      return decimalToBinaryArray(decimal);
    } catch {
      // Return array of zeros if conversion fails
      return new Array(8).fill(0);
    }
  };

  /**
   * Gets the maximum possible value (255 for 8-bit)
   * @returns Maximum value
   */
  const getMaxValue = (): number => {
    return 255;
  };

  /**
   * Gets the minimum possible value
   * @returns Minimum value
   */
  const getMinValue = (): number => {
    return 0;
  };

  return {
    generateChallenge,
    formatDisplayValue,
    getBinaryRepresentation,
    getMaxValue,
    getMinValue
  };
};
