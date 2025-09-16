import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isUpdating = false;
  updateSuccess = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      // Créer une copie pour éviter la modification directe
      this.user = { ...this.user };
      if (this.user.address) {
        this.user.address = { ...this.user.address };
      }
    }
  }

  getUserRoleLabel(): string {
    if (!this.user) return '';
    
    switch (this.user.role) {
      case 'debtor':
        return 'Débiteur';
      case 'bailiff':
        return 'Huissier de Justice';
      case 'lawyer':
        return 'Avocat';
      default:
        return '';
    }
  }

  updateProfile() {
    if (!this.user) return;

    this.isUpdating = true;

    this.authService.updateProfile(this.user).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isUpdating = false;
        this.showSuccessMessage();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.isUpdating = false;
      }
    });
  }

  private showSuccessMessage() {
    this.updateSuccess = true;
    setTimeout(() => {
      this.updateSuccess = false;
    }, 3000);
  }
}