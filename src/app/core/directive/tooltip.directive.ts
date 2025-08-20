import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  OnDestroy
} from '@angular/core';

@Directive({
  selector: '[tooltip-text]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('tooltip-text') tooltipText: string = '';
  @Input('tooltip-position') position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input('tooltip-delay') delay: number = 50;

  private tooltip: HTMLElement | null = null;
  private timeoutId: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltipText) return;

    this.timeoutId = setTimeout(() => {
      this.showTooltip();
    }, this.delay);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.hideTooltip();
  }

  @HostListener('click')
  onClick(): void {
    this.hideTooltip();
  }

  private showTooltip(): void {
    if (this.tooltip) return;

    // Create tooltip element
    this.tooltip = this.renderer.createElement('div');

    const baseClasses = 'fixed z-[9999] px-3 py-1.5 text-xs font-bold text-white bg-gray-900 rounded-md shadow-lg pointer-events-none whitespace-nowrap transition-opacity duration-200 opacity-0';
    this.renderer.setAttribute(this.tooltip, 'class', baseClasses);

    // Set tooltip text
    const text = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltip, text);

    // Append to body
    this.renderer.appendChild(document.body, this.tooltip);

    // Add arrow first before positioning
    this.addArrow();

    if (this.tooltip) {
      // Force browser to calculate dimensions
      this.tooltip.offsetHeight;
    }

    // Position the tooltip after adding content
    this.setPosition();

    // Trigger fade-in animation
    requestAnimationFrame(() => {
      if (this.tooltip) {
        this.renderer.removeClass(this.tooltip, 'opacity-0');
        this.renderer.addClass(this.tooltip, 'opacity-100');
      }
    });
  }

  private hideTooltip(): void {
    if (!this.tooltip) return;

    // Fade out
    this.renderer.removeClass(this.tooltip, 'opacity-100');
    this.renderer.addClass(this.tooltip, 'opacity-0');

    // Remove after animation
    setTimeout(() => {
      if (this.tooltip && this.tooltip.parentNode) {
        this.renderer.removeChild(document.body, this.tooltip);
        this.tooltip = null;
      }
    }, this.delay);
  }

  private setPosition(): void {
    if (!this.tooltip) return;

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const offset = 12; // Distance from element

    let top: number;
    let left: number;

    switch (this.position) {
      case 'top':
        top = hostRect.top - tooltipRect.height - offset;
        left = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = hostRect.bottom + offset;
        left = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = hostRect.top + hostRect.height / 2 - tooltipRect.height / 2;
        left = hostRect.left - tooltipRect.width - offset;
        break;
      case 'right':
        top = hostRect.top + hostRect.height / 2 - tooltipRect.height / 2;
        left = hostRect.right + offset;
        break;
      default:
        top = hostRect.top - tooltipRect.height - offset;
        left = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2;
    }

    // Check boundaries and adjust if needed
    const margin = 8;

    // Check horizontal boundaries
    if (left < margin) {
      left = margin;
    } else if (left + tooltipRect.width > window.innerWidth - margin) {
      left = window.innerWidth - tooltipRect.width - margin;
    }

    // Check vertical boundaries
    if (top < margin) {
      // If tooltip goes above viewport, show it below
      if (this.position === 'top') {
        top = hostRect.bottom + offset;
        this.position = 'bottom';
        // Update arrow position
        this.updateArrowPosition();
      } else {
        top = margin;
      }
    } else if (top + tooltipRect.height > window.innerHeight - margin) {
      // If tooltip goes below viewport, show it above
      if (this.position === 'bottom') {
        top = hostRect.top - tooltipRect.height - offset;
        this.position = 'top';
        // Update arrow position
        this.updateArrowPosition();
      } else {
        top = window.innerHeight - tooltipRect.height - margin;
      }
    }

    // Apply the calculated position using fixed positioning
    this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
  }

  private updateArrowPosition(): void {
    if (!this.tooltip) return;

    // Remove existing arrow
    const existingArrow = this.tooltip.querySelector('.tooltip-arrow');
    if (existingArrow) {
      this.renderer.removeChild(this.tooltip, existingArrow);
    }

    // Add new arrow with updated position
    this.addArrow();
  }

  private addArrow(): void {
    if (!this.tooltip) return;

    const arrow = this.renderer.createElement('div');

    // Arrow styling based on position
    let arrowClasses = 'absolute ';

    switch (this.position) {
      case 'top':
        arrowClasses += 'w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-900 -bottom-[6px] left-1/2 -translate-x-1/2';
        break;
      case 'bottom':
        arrowClasses += 'w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-gray-900 -top-[6px] left-1/2 -translate-x-1/2';
        break;
      case 'left':
        arrowClasses += 'w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-gray-900 -right-[6px] top-1/2 -translate-y-1/2';
        break;
      case 'right':
        arrowClasses += 'w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-gray-900 -left-[6px] top-1/2 -translate-y-1/2';
        break;
    }

    this.renderer.setAttribute(arrow, 'class', arrowClasses);
    this.renderer.appendChild(this.tooltip, arrow);
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.hideTooltip();
  }
}
