import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'khrFormat'
})
export class KhrFormatPipe implements PipeTransform {
  transform(value: number): string {
    if (!value && value !== 0) return '';
    const rounded = Math.round(value);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
