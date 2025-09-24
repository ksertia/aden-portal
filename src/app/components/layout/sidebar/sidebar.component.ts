import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User, StrapiRole } from '../../../models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribe to the currentUser$ observable to update the current user state
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  // Getters to check the user's role
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
