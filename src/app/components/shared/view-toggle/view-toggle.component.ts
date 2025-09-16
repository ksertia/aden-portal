import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-toggle.component.html',
  styleUrls: ['./view-toggle.component.css']
})
export class ViewToggleComponent {
  @Input() currentView: 'grid' | 'table' = 'grid';
  @Output() viewChange = new EventEmitter<'grid' | 'table'>();

  switchView(view: 'grid' | 'table') {
    this.currentView = view;
    this.viewChange.emit(view);
  }
}