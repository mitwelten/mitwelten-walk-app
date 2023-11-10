import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paragraphs'
})
export class ParagraphPipe implements PipeTransform {

  transform(value?: string): string|void {
    if (value !== undefined && value !== null) {
      return value.split('\n').map((p) => `<p>${p}</p>`).join('');
    }
  }

}
