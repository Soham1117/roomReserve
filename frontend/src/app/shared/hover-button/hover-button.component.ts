import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hover-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hover-button.component.html',
  styleUrls: ['./hover-button.component.css'],
})
export class HoverButtonComponent {
  @Input() buttonText: string = 'Click Me'; // Default text
  @Input() iconSvgPath?: string; // Optional SVG path data
  @Input() type?: string; // Optional icon class
  @Input() h?: string; // Optional height
  @Input() w?: string; // Optional width
  @Output() onClick = new EventEmitter<MouseEvent>(); // Emit click events

  constructor(private el: ElementRef) {} // Inject ElementRef to query selector

  onButtonMouseMove(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    // Query within the component's template
    const circle = this.el.nativeElement.querySelector('.hover-circle') as HTMLElement;

    if (!button || !circle) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    const width = button.offsetWidth;
    const height = button.offsetHeight;
    const diameter =
      Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y)
      ) * 2;

    circle.style.width = `${diameter}px`;
    circle.style.height = `${diameter}px`;
  }

  onButtonMouseLeave(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    // Query within the component's template
    const circle = this.el.nativeElement.querySelector('.hover-circle') as HTMLElement;
    if (circle) {
      circle.style.width = '0px';
      circle.style.height = '0px';
    }
  }
}
