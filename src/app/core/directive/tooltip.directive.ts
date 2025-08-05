import {Directive, ElementRef, HostListener, input, InputSignal, Renderer2} from '@angular/core';

@Directive({
  selector: '[tooltipText]',
  standalone: true,
})
export class TooltipDirective {
  tooltipText: InputSignal<string> = input<string>('');

  private tooltipElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.showTooltip();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hideTooltip();
  }

  private showTooltip() {
    if (this.tooltipElement) return;

    this.tooltipElement = this.renderer.createElement('div');

    this.renderer.addClass(this.tooltipElement, 'absolute');
    this.renderer.addClass(this.tooltipElement, 'top-full');
    this.renderer.addClass(this.tooltipElement, 'left-1/2');
    this.renderer.addClass(this.tooltipElement, '-translate-x-1/2');
    this.renderer.addClass(this.tooltipElement, 'mt-4');

    this.renderer.addClass(this.tooltipElement, 'tooltip-style');

    this.renderer.setProperty(this.tooltipElement, 'textContent', this.tooltipText());
    this.renderer.appendChild(this.el.nativeElement, this.tooltipElement);
  }

  private hideTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(this.el.nativeElement, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

}
