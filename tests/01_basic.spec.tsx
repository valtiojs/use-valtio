import { expect, test } from 'vitest';
import { useValtio } from 'use-valtio';

test('should export functions', () => {
  expect(useValtio).toBeDefined();
});
