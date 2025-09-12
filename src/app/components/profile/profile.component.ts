import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header fade-in-up">
        <h1>Profil Utilisateur</h1>
        <p>Gérez vos informations personnelles</p>
      </div>

      <div class="profile-content fade-in-up" *ngIf="user">
        <div class="profile-card">
          <div class="profile-avatar">
            <div class="avatar-circle">
              {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
            </div>
            <div class="avatar-info">
              <h2>{{ user.firstName }} {{ user.lastName }}</h2>
              <p class="role">{{ getUserRoleLabel() }}</p>
            </div>
          </div>

          <form (ngSubmit)="updateProfile()" class="profile-form">
            <div class="form-section">
              <h3>Informations personnelles</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">Prénom</label>
                  <input
                    type="text"
                    id="firstName"
                    [(ngModel)]="user.firstName"
                    name="firstName"
                    required
                  >
                </div>
                <div class="form-group">
                  <label for="lastName">Nom</label>
                  <input
                    type="text"
                    id="lastName"
                    [(ngModel)]="user.lastName"
                    name="lastName"
                    required
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label for="email">Adresse e-mail</label>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="user.email"
                  name="email"
                  required
                  disabled
                >
              </div>
              
              <div class="form-group">
                <label for="phone">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  [(ngModel)]="user.phone"
                  name="phone"
                >
              </div>
            </div>

            <div class="form-section" *ngIf="user.companyName || user.licenseNumber">
              <h3>Informations professionnelles</h3>
              
              <div class="form-group" *ngIf="user.companyName">
                <label for="companyName">Nom de l'entreprise</label>
                <input
                  type="text"
                  id="companyName"
                  [(ngModel)]="user.companyName"
                  name="companyName"
                >
              </div>
              
              <div class="form-group" *ngIf="user.licenseNumber">
                <label for="licenseNumber">Numéro de licence</label>
                <input
                  type="text"
                  id="licenseNumber"
                  [(ngModel)]="user.licenseNumber"
                  name="licenseNumber"
                >
              </div>
            </div>

            <div class="form-section" *ngIf="user.address">
              <h3>Adresse</h3>
              
              <div class="form-group">
                <label for="street">Rue</label>
                <input
                  type="text"
                  id="street"
                  [(ngModel)]="user.address.street"
                  name="street"
                >
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="city">Ville</label>
                  <input
                    type="text"
                    id="city"
                    [(ngModel)]="user.address.city"
                    name="city"
                  >
                </div>
                <div class="form-group">
                  <label for="postalCode">Code postal</label>
                  <input
                    type="text"
                    id="postalCode"
                    [(ngModel)]="user.address.postalCode"
                    name="postalCode"
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label for="country">Pays</label>
                <input
                  type="text"
                  id="country"
                  [(ngModel)]="user.address.country"
                  name="country"
                >
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="isUpdating">
                <span *ngIf="!isUpdating">Mettre à jour</span>
                <span *ngIf="isUpdating">Mise à jour...</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="success-message" *ngIf="updateSuccess">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>
        Profil mis à jour avec succès
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
    }

    .profile-header {
      margin-bottom: 32px;
    }

    .profile-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .profile-header p {
      font-size: 16px;
      color: var(--text-secondary);
    }

    .profile-card {
      background: var(--surface);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .profile-avatar {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .avatar-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 600;
    }

    .avatar-info h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    .role {
      color: var(--text-secondary);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-group input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.2s ease;
      background: var(--surface);
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
    }

    .form-group input:disabled {
      background: #f8fafc;
      color: var(--text-secondary);
      cursor: not-allowed;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }

    .success-message {
      position: fixed;
      top: 24px;
      right: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #d1fae5;
      color: #065f46;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      z-index: 1000;
      animation: slideInRight 0.4s ease-out;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 16px;
      }

      .profile-card {
        padding: 24px;
      }

      .profile-avatar {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .form-actions {
        justify-content: center;
      }
    }
  `]
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