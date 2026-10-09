import { FoodType, UnitType as FoodUnit } from '../types';

export interface BasketDishRow {
  dishId: string;
  dishName: string;
  foodType: FoodType;
  quantity: number;
  unit: FoodUnit;
  preparedTime: string; // ISO string
  useBeforeTime: string; // ISO string
}

export interface BasketValidationResult {
  isValid: boolean;
  errors: Record<number, Record<string, string>>;
  firstErrorRowIndex: number | null;
}

/**
 * Section 8: Validate each row inline:
 * - dish required
 * - quantity above 0
 * - use-before time in the future (relative to currentTime)
 * - use-before time after the prepared time
 */
export function validateFoodBasketRows(
  rows: BasketDishRow[],
  currentTime: Date | string
): BasketValidationResult {
  const errors: Record<number, Record<string, string>> = {};
  let firstErrorRowIndex: number | null = null;
  const currentMs = new Date(currentTime).getTime();

  if (!rows || rows.length === 0) {
    return {
      isValid: false,
      errors: { 0: { general: 'At least one dish must be listed' } },
      firstErrorRowIndex: 0,
    };
  }

  rows.forEach((row, index) => {
    const rowErrors: Record<string, string> = {};

    if (!row.dishName || !row.dishName.trim()) {
      rowErrors.dishName = 'Dish name is required';
    }

    if (row.quantity === undefined || row.quantity === null || isNaN(row.quantity) || row.quantity <= 0) {
      rowErrors.quantity = 'Quantity must be greater than 0';
    }

    const prepMs = new Date(row.preparedTime).getTime();
    const useBeforeMs = new Date(row.useBeforeTime).getTime();

    if (isNaN(useBeforeMs)) {
      rowErrors.useBeforeTime = 'Valid use-before time is required';
    } else if (useBeforeMs <= currentMs) {
      rowErrors.useBeforeTime = 'Use-before time must be in the future';
    } else if (!isNaN(prepMs) && useBeforeMs <= prepMs) {
      rowErrors.useBeforeTime = 'Use-before time must be after the prepared time';
    }

    if (Object.keys(rowErrors).length > 0) {
      errors[index] = rowErrors;
      if (firstErrorRowIndex === null) {
        firstErrorRowIndex = index;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorRowIndex,
  };
}
