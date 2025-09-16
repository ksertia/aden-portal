import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: ` `,
  styles: [` `]
})
export class UnauthorizedComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}