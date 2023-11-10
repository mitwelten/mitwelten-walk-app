import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-more-text',
  template: `
    <div class="content" [ngClass]="{'expanded': expanded}">
    <ng-content></ng-content>
    </div>
    <div style="display:inline-flex;align-items:center;cursor: pointer;" (click)="toggle()">
      <span *ngIf="!expanded" class="material-symbols-outlined">unfold_more</span>
      <span *ngIf="expanded" class="material-symbols-outlined">unfold_less</span>
      <span class="label">{{ expanded ? collapseLabel : expandLabel }}</span>
    </div>
  `,
  styles: [
    `
    :host {
      margin-bottom: 12px;
      display: block;
    }
    .content {
      max-height: 0;
      transition: max-height 0.15s ease-out;
      overflow: hidden;
    }
    .content.expanded {
      max-height: 1000px;
      overflow-y: scroll;
      transition: max-height 0.25s ease-in;
    }
    .material-symbols-outlined {
      margin-left: -4px;
      font-size: 18px;
    }
    `
  ]
})
export class MoreTextComponent {

  @Input()
  expandLabel = 'mehr...';

  @Input()
  collapseLabel = 'weniger...';

  @Input()
  expanded = false;

  toggle() {
    this.expanded = !this.expanded;
  }
}
