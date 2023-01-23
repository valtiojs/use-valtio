import { useValtio } from '../src/index';

describe('basic spec', () => {
  it('should export functions', () => {
    expect(useValtio).toBeDefined();
  });
});
