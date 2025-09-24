import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
<<<<<<< HEAD
import { User, StrapiRole } from '../../../models/user.model';

=======
import { User, UserRole } from '../../../models/user.model';
import { I18nService } from '../../../services/i18n.service';
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component';
>>>>>>> 46c5a20a0d9b9ac18ee54f50e69e413032e318be
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
<<<<<<< HEAD

  constructor(private authService: AuthService, private router: Router) {}
=======
  translations: any = {};

  constructor(private authService: AuthService, private router: Router, private i18nService: I18nService) {}
>>>>>>> 46c5a20a0d9b9ac18ee54f50e69e413032e318be

  ngOnInit() {
    // Subscribe to the currentUser$ observable to update the current user state
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadTranslations();

    this.i18nService.currentLocale$.subscribe(() => {
      this.loadTranslations();
    });
  }

<<<<<<< HEAD
  // Getters to check the user's role
=======
  private loadTranslations() {
    const locale = this.i18nService.getCurrentLocale();
    this.i18nService.loadTranslations(locale).subscribe(translations => {
      this.translations = translations;
    });
  }

  t(key: string): string {
    return this.i18nService.translate(key, this.translations);
  }

>>>>>>> 46c5a20a0d9b9ac18ee54f50e69e413032e318be
  get isDebtorUser(): boolean {
    return this.authService.hasRole(StrapiRole.DEBTOR);
  }

  get isBailiffUser(): boolean {
    return this.authService.hasRole(StrapiRole.BAILIFF);
  }

  get isLawyerUser(): boolean {
    return this.authService.hasRole(StrapiRole.LAWYER);
  }

  get isProfessionalUser(): boolean {
    return this.isBailiffUser || this.isLawyerUser || this.isCedantUser;
  }

  get isCreditorUser(): boolean {
    return this.authService.hasRole(StrapiRole.CREDITOR);
  }

  get isCedantUser(): boolean {
    return this.authService.hasRole(StrapiRole.CEDANT);
  }

  // Method to get the label for the current user's role
  getUserRoleLabel(): string {
    if (!this.currentUser) return '';

    switch (this.currentUser.role.name) { // Compare the role name with the StrapiRole enum
      case StrapiRole.DEBTOR:
        return 'Débiteur';
      case StrapiRole.BAILIFF:
        return 'Huissier';
      case StrapiRole.LAWYER:
        return 'Avocat';
      case StrapiRole.CREDITOR:
        return 'Créancier';
      case StrapiRole.CEDANT:
        return 'Cédant';
      case StrapiRole.RECOVERY_PARTNER:
        return 'Partenaire de recouvrement';
      default:
        return '';
    }
  }

  // Method to log out the user
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
