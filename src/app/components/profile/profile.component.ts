import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
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

  constructor(
    private authService: AuthService,
    private i18nService: I18nService,
    private router: Router,
    ) {}

  ngOnInit() {
    // si user vient du parent (UserList), on l’utilise directement
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

  // Fonction pour rediriger l\'utilisateur connecté vers son dashboard
  goBackToDashboard(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const userRole = currentUser.role;
    let roleType = '';

    // Gestion sécurisée du type avec vérifications
    if (typeof userRole === 'string') {
      roleType = userRole;
    } else if (userRole && typeof userRole === 'object') {
      // Vérification plus sécurisée pour les propriétés
      const roleObj = userRole as any; 
      roleType = (roleObj.type || roleObj.name || '').toUpperCase();
    } else {
      roleType = '';
    }

    // Rediriger vers le dashboard approprié
    switch (roleType) {
      case 'AVOCAT':
      case 'LAWYER':
        this.router.navigate(['/lawyer/dashboard']);
      break;

      case 'DEBITEUR':
      case 'DEBTOR':
        this.router.navigate(['/debtor/dashboard']);
      break;

      case 'CREANCIER':
      case 'CREDITOR':
        this.router.navigate(['/creditor/dashboard']);
      break;

      case 'CEDANT':
      case 'CéDANT':
        this.router.navigate(['/cedant/dashboard']);
      break;

      case 'HUISSIER':
      case 'BAILIFF':
        this.router.navigate(['/bailiff/dashboard']);
      break;

      case 'PARTENAIRE':
      case 'PARTNER':
        this.router.navigate(['/partner/dashboard']);
      break;

      case 'ADMINISTRATEUR':
      case 'ADMINISTRATEUR':
        this.router.navigate(['/Administrateur/dashboard']);
      break;

      default:
        // Redirection par défaut vers la page d'accueil
        console.warn('Rôle non reconnu, redirection vers la page d\'accueil');
        this.router.navigate(['/']);
      break;
    }
  }
}