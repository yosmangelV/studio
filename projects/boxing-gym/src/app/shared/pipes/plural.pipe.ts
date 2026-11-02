import { Pipe, PipeTransform } from '@angular/core';

/** `{{ count | plural:'pago':'pagos' }}` → "1 pago", "3 pagos", "0 pagos". */
@Pipe({ name: 'plural', standalone: true })
export class PluralPipe implements PipeTransform {
  transform(count: number | null | undefined, one: string, other: string): string {
    const n = count ?? 0;
    return `${n} ${n === 1 ? one : other}`;
  }
}
