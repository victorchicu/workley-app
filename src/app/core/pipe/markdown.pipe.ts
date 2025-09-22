import {Pipe, PipeTransform, SecurityContext} from '@angular/core';
import {marked} from 'marked';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
  name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, ...args: unknown[]): unknown {
    if (!value) return '';
    const html = marked.parse(value) as string;
    return this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
  }

}
