import { PluralPipe } from './plural.pipe';

describe('PluralPipe', () => {
  const pipe = new PluralPipe();

  it.each([
    [0, '0 pagos'],
    [1, '1 pago'],
    [2, '2 pagos'],
    [null, '0 pagos'],
  ])('formats %s', (count, expected) => {
    expect(pipe.transform(count, 'pago', 'pagos')).toBe(expected);
  });
});
