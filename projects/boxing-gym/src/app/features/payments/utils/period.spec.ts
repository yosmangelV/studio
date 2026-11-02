import { currentPeriod, periodLabel, periodLabelFromKey } from './period';

describe('period', () => {
  it('keys the current month as YYYY-MM', () => {
    expect(currentPeriod(new Date(2026, 0, 15))).toBe('2026-01');
    expect(currentPeriod(new Date(2026, 10, 2))).toBe('2026-11');
  });

  it('raises only the first letter of the label', () => {
    expect(periodLabel(2026, 11)).toBe('Noviembre de 2026');
  });

  it('labels a YYYY-MM key', () => {
    expect(periodLabelFromKey('2026-03')).toBe('Marzo de 2026');
  });
});
