import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cutText',
})
export class CutTextPipe implements PipeTransform {
  transform(text: string, limit: number = 60): string {
    if (!text) return '';

    if (text.length <= limit) {
      return text;
    }

    let cutPosition = limit;

    while (cutPosition < text.length && text[cutPosition] !== ' ') {
      cutPosition++;
    }
    return text.substring(0, cutPosition) + '...';
  }
}
