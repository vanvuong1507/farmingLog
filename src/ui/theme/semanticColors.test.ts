/**
 * @jest-environment node
 */
import {semanticColors} from '@ui/theme/semanticColors';

describe('semanticColors', () => {
  it('defines light and dark palettes with expected keys', () => {
    expect(Object.keys(semanticColors).sort()).toEqual(['dark', 'light']);
    expect(semanticColors.light).toMatchObject({
      text: expect.any(String),
      background: expect.any(String),
    });
    expect(semanticColors.dark.background).toMatch(/^#/);
  });
});
