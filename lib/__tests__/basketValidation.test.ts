import { describe, it, expect } from 'vitest';
import { validateFoodBasketRows, BasketDishRow } from '../basketValidation';

describe('Multi-Dish Basket Validation Unit Tests', () => {
  const currentTime = '2026-10-09T12:00:00.000Z';

  it('validates a complete, correctly filled food basket', () => {
    const validRows: BasketDishRow[] = [
      {
        dishId: 'idli',
        dishName: 'Idli',
        foodType: 'Veg',
        quantity: 50,
        unit: 'portions',
        preparedTime: '2026-10-09T11:00:00.000Z',
        useBeforeTime: '2026-10-09T16:00:00.000Z',
      },
      {
        dishId: 'sambar-rice',
        dishName: 'Sambar Rice',
        foodType: 'Veg',
        quantity: 30,
        unit: 'portions',
        preparedTime: '2026-10-09T11:30:00.000Z',
        useBeforeTime: '2026-10-09T17:00:00.000Z',
      },
    ];

    const result = validateFoodBasketRows(validRows, currentTime);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
    expect(result.firstErrorRowIndex).toBeNull();
  });

  it('rejects rows with missing dish name or zero/negative quantity', () => {
    const invalidRows: BasketDishRow[] = [
      {
        dishId: '',
        dishName: '', // empty name
        foodType: 'Veg',
        quantity: 0, // invalid quantity
        unit: 'portions',
        preparedTime: '2026-10-09T11:00:00.000Z',
        useBeforeTime: '2026-10-09T16:00:00.000Z',
      },
    ];

    const result = validateFoodBasketRows(invalidRows, currentTime);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]?.dishName).toBeDefined();
    expect(result.errors[0]?.quantity).toBeDefined();
    expect(result.firstErrorRowIndex).toBe(0);
  });

  it('rejects rows where use-before time is in the past or before prepared time', () => {
    const invalidRows: BasketDishRow[] = [
      {
        dishId: 'idli',
        dishName: 'Idli',
        foodType: 'Veg',
        quantity: 20,
        unit: 'portions',
        preparedTime: '2026-10-09T10:00:00.000Z',
        useBeforeTime: '2026-10-09T11:30:00.000Z', // past time relative to 12:00
      },
      {
        dishId: 'pongal',
        dishName: 'Ven Pongal',
        foodType: 'Veg',
        quantity: 25,
        unit: 'portions',
        preparedTime: '2026-10-09T14:00:00.000Z',
        useBeforeTime: '2026-10-09T13:00:00.000Z', // before prepared time!
      },
    ];

    const result = validateFoodBasketRows(invalidRows, currentTime);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]?.useBeforeTime).toBe('Use-before time must be in the future');
    expect(result.errors[1]?.useBeforeTime).toBe('Use-before time must be after the prepared time');
  });
});
