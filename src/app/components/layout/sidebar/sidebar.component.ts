import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User, UserRole } from '../../../models/user.model';
import { I18nService } from '../../../services/i18n.service';
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  translations: any = {};

  constructor(private authService: AuthService, private router: Router, private i18nService: I18nService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadTranslations();

    this.i18nService.currentLocale$.subscribe(() => {
      this.loadTranslations();
    });
  }

  private loadTranslations() {
    const locale = this.i18nService.getCurrentLocale();
    this.i18nService.loadTranslations(locale).subscribe(translations => {
      this.translations = translations;
    });
  }

  t(key: string): string {
    return this.i18nService.translate(key, this.translations);
  }

  get isDebtorUser(): boolean {
    return this.authService.hasRole(UserRole.DEBTOR);
  }
  get isBailiffUser(): boolean {
    return this.authService.hasRole(UserRole.BAILIFF);
  }
  get isLawyerUser(): boolean {
    return this.authService.hasRole(UserRole.LAWYER);
  }
  get isProfessionalUser(): boolean {
    return this.isBailiffUser || this.isLawyerUser || this.isCedantUser;
  }
  get isCreditorUser(): boolean {
    return this.authService.hasRole(UserRole.CREDITOR);
  }
  get isCedantUser(): boolean {
    return this.authService.hasRole(UserRole.CEDANT);
  }
  getUserRoleLabel(): string {
    if (!this.currentUser) return '';
    switch (this.currentUser.role) {
      case UserRole.DEBTOR:
        return 'Débiteur';
      case UserRole.BAILIFF:
        return 'Huissier';
      case UserRole.LAWYER:
        return 'Avocat';
      case UserRole.CREDITOR:
        return 'Créancier';
      case UserRole.CEDANT:
        return 'Cédant';
      case UserRole.RECOVERY_PARTNER:
        return 'Partenaire';
      case UserRole.RECOVERY_PARTNER:
        return 'Partenaire';
      default:
        return '';
    }
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
