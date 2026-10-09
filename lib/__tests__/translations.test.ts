import { describe, it, expect } from 'vitest';
import en from '../../locales/en.json';
import ta from '../../locales/ta.json';

function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

describe('Translation Keys Parity Check', () => {
  const enKeys = getAllKeys(en).sort();
  const taKeys = getAllKeys(ta).sort();

  it('has identical translation keys in both en.json and ta.json', () => {
    const missingInTa = enKeys.filter((k) => !taKeys.includes(k));
    const missingInEn = taKeys.filter((k) => !enKeys.includes(k));

    expect(missingInTa).toEqual([]);
    expect(missingInEn).toEqual([]);
    expect(enKeys.length).toBe(taKeys.length);
  });
});
