import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundHundreds',
})
export class RoundHundredsPipe implements PipeTransform {
  transform(
    total: number,
    mode: 'getFromCustomer' | 'changeForCustomer' | 'total'
  ): number {
    if (typeof total !== 'number' || isNaN(total)) return 0;

    switch (mode) {
      case 'getFromCustomer':
        return Math.ceil(total / 100) * 100;
      case 'changeForCustomer':
        return Math.floor(total / 100) * 100;
      default:
        return total;
    }
  }
}
