import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

import { User, StrapiRole } from '../../models/user.model';

import { I18nService } from '../../services/i18n.service';
import { LanguageSwitcherComponent } from '../shared/language-switcher/language-switcher.component';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @Input() user: User | null = null;  // <- un seul champ

  isUpdating = false;
  updateSuccess = false;
  translations: any = {};

  constructor(private authService: AuthService, private i18nService: I18nService) {}

  ngOnInit() {
    // ⚠️ si user vient du parent (UserList), on l’utilise directement
    if (!this.user) {
      // sinon on fallback sur l’utilisateur connecté
      this.user = this.authService.getCurrentUser();
    }

    if (this.user) {
      this.user = { ...this.user };
      if (this.user.address) {
        this.user.address = { ...this.user.address };
      }
    }

    this.loadTranslations();
    this.i18nService.currentLocale$.subscribe(() => this.loadTranslations());
  }

  private loadTranslations() {
    const currentLocale = this.i18nService.getCurrentLocale();
    this.i18nService.loadTranslations(currentLocale).subscribe(translations => {
      this.translations = translations;
    });
  }

  t(key: string): string {
    return this.i18nService.translate(key, this.translations);
  }

  getUserRoleLabel(): string {
    if (!this.user) return '';
    switch (this.user.role.name) {
      case StrapiRole.DEBTOR: return 'Débiteur';
      case StrapiRole.BAILIFF: return 'Huissier de Justice';
      case StrapiRole.LAWYER: return 'Avocat';
      case StrapiRole.CREDITOR: return 'Créancier';
      case StrapiRole.CEDANT: return 'Cédant';
      case StrapiRole.PARTNER: return 'Partenaire';
      case StrapiRole.RECOVERY_PARTNER: return 'Partenaire de recouvrement';
      case StrapiRole.ADMINISTRATEUR: return 'Administrateur';
      default: return 'Rôle inconnu';
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
    setTimeout(() => (this.updateSuccess = false), 3000);
  }
}
