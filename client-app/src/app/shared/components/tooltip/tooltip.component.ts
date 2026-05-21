import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tooltip-inner text-xs px-2 py-1 rounded bg-dark text-white shadow-sm"
         [class.visible]="visible"
         [style.top.px]="top"
         [style.left.px]="left">
      {{ text }}
    </div>
  `,
  styles: [`
    :host {
        position: fixed;
        z-index: 1060;
        pointer-events: none;
        transition: opacity 0.15s;
    }
    .tooltip-inner {
        font-size: 0.75rem;
        max-width: 200px;
        opacity: 0;
        transform: scale(0.95);
        transition: all 0.1s ease-out;
        
        &.visible {
            opacity: 1;
            transform: scale(1);
        }
    }
  `]
})
export class TooltipComponent {
  @Input() text = '';
  visible = false;
  top = 0;
  left = 0;
}
