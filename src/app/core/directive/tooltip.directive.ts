import { Directive, ElementRef, HostListener, Inject, Renderer2, input, InputSignal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[tooltipText]',
  standalone: true,
})
export class TooltipDirective {
  tooltipText: InputSignal<string> = input<string>('');

  private tooltipElement: HTMLDivElement | null = null;

  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.showTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.hideTooltip();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {
    if (this.tooltipElement) this.positionTooltip();
  }

  private showTooltip() {
    if (this.tooltipElement) return;

    const el = this.renderer.createElement('div') as HTMLDivElement;
    this.renderer.addClass(el, 'tooltip-style');
    this.renderer.setProperty(el, 'textContent', this.tooltipText());

    this.renderer.appendChild(this.doc.body, el);

    this.tooltipElement = el;

    this.positionTooltip();
  }

  private positionTooltip() {
    if (!this.tooltipElement) return;

    const rect = this.host.nativeElement.getBoundingClientRect();

    this.renderer.setStyle(this.tooltipElement, 'top', `${rect.bottom + 4}px`); // 8px gap
    this.renderer.setStyle(this.tooltipElement, 'left', `${rect.left + rect.width * 2}px`);
    this.renderer.setStyle(this.tooltipElement, 'transform', 'translateX(-50%)');
  }

  private hideTooltip() {
    if (!this.tooltipElement) return;

    this.renderer.removeChild(this.doc.body, this.tooltipElement);
    this.tooltipElement = null;
  }
}
