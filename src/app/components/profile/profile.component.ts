import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User, StrapiRole } from '../../models/user.model';
import { I18nService } from '../../services/i18n.service';

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

  translations: any = {};

  constructor(private authService: AuthService,  private i18nService: I18nService) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      // Créer une copie pour éviter la modification directe
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

  // Méthode pour obtenir le libellé du rôle de l'utilisateur
  getUserRoleLabel(): string {
    if (!this.user) return '';

    // Utilisation de l'énumération StrapiRole pour obtenir le libellé du rôle
    switch (this.user.role.name) {  // Utilisez "name" pour comparer avec l'énumération
      case StrapiRole.DEBTOR:
        return 'Débiteur';
      case StrapiRole.BAILIFF:
        return 'Huissier de Justice';
      case StrapiRole.LAWYER:
        return 'Avocat';
      case StrapiRole.CREDITOR:
        return 'Créancier';
      case StrapiRole.CEDANT:
        return 'Cédant';
      case StrapiRole.PARTNER:
        return 'Partenaire';
      case StrapiRole.RECOVERY_PARTNER:
        return 'Partenaire de recouvrement';
      case StrapiRole.ADMINISTRATEUR:
        return 'Administrateur';
      default:
        return 'Rôle inconnu';
    }
  }

  // Méthode pour mettre à jour le profil de l'utilisateur
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

  // Méthode pour afficher un message de succès
  private showSuccessMessage() {
    this.updateSuccess = true;
    setTimeout(() => {
      this.updateSuccess = false;
    }, 3000);
  }
}
