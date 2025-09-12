import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="view-toggle">
      <button 
        class="toggle-btn" 
        [class.active]="currentView === 'grid'"
        (click)="switchView('grid')"
        title="Vue grille"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        Grille
      </button>
      <button 
        class="toggle-btn" 
        [class.active]="currentView === 'table'"
        (click)="switchView('table')"
        title="Vue tableau"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18"/>
          <path d="M3 12h18"/>
          <path d="M3 18h18"/>
        </svg>
        Tableau
      </button>
    </div>
  `,
  styles: [`
    .view-toggle {
      display: flex;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toggle-btn:hover {
      background: #f8fafc;
      color: var(--text);
    }

    .toggle-btn.active {
      background: var(--primary);
      color: white;
    }

    .toggle-btn.active:hover {
      background: var(--primary-dark);
    }
  `]
})
export class ViewToggleComponent {
  @Input() currentView: 'grid' | 'table' = 'grid';
  @Output() viewChange = new EventEmitter<'grid' | 'table'>();

  switchView(view: 'grid' | 'table') {
    this.currentView = view;
    this.viewChange.emit(view);
  }
}