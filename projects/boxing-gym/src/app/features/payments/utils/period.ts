// A billing period is a month, keyed as 'YYYY-MM' (the API's period_year/period_month).

export function currentPeriod(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** "Noviembre de 2026": Intl gives "noviembre de 2026", and only the first letter is raised. */
export function periodLabel(year: number, month: number): string {
  const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function periodLabelFromKey(period: string): string {
  const [year, month] = period.split('-').map(Number);
  return periodLabel(year, month);
}
