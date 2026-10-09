import { describe, it, expect } from 'vitest';

describe('Currency Audit (Fix 2)', () => {
  // Vite raw glob import of all src files
  const allFiles = import.meta.glob('/src/**/*.{ts,tsx,json,css}', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  it('scans all src files and ensures no "USD" text is present', () => {
    const violations: { file: string; line: number; text: string }[] = [];

    for (const [filePath, content] of Object.entries(allFiles)) {
      if (filePath.includes('__tests__')) continue;
      const lines = content.split('\n');
      lines.forEach((line: string, index: number) => {
        if (line.includes('USD')) {
          violations.push({
            file: filePath,
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('scans all src files and ensures "$" is not used as a currency symbol', () => {
    const violations: { file: string; line: number; text: string }[] = [];
    const currencyRegex = /(\$\s*\d+)|(\$\s*\$\{)|(['"]\s*\$\s*['"])/;

    for (const [filePath, content] of Object.entries(allFiles)) {
      if (filePath.includes('__tests__')) continue;
      const lines = content.split('\n');
      lines.forEach((line: string, index: number) => {
        if (currencyRegex.test(line)) {
          violations.push({
            file: filePath,
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(violations).toEqual([]);
  });
});
