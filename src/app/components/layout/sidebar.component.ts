import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v6l3-3 3 3"/>
            <path d="M12 8v8"/>
            <path d="m8 14 4 4 4-4"/>
          </svg>
          <span>RecouvrePro</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>Tableau de bord</span>
            </a>
          </li>

          <li *ngIf="isDebtorUser">
            <a routerLink="/debtor/cases" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <span>Mes Dossiers</span>
            </a>
          </li>

          <li *ngIf="isDebtorUser">
            <a routerLink="/debtor/payments" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <span>Paiements</span>
            </a>
          </li>

          <li *ngIf="isDebtorUser">
            <a routerLink="/debtor/documents" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <span>Mes Documents</span>
            </a>
          </li>

          <li *ngIf="isBailiffUser">
            <a routerLink="/bailiff/cases" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <span>Gestion Dossiers</span>
            </a>
          </li>

          <li *ngIf="isBailiffUser">
            <a routerLink="/bailiff/actions" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
              <span>Actions Légales</span>
            </a>
          </li>

          <li *ngIf="isLawyerUser">
            <a routerLink="/lawyer/cases" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <span>Dossiers Juridiques</span>
            </a>
          </li>

          <li *ngIf="isLawyerUser">
            <a routerLink="/lawyer/consultations" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Consultations</span>
            </a>
          </li>

          <!-- Navigation commune aux professionnels -->
          <li *ngIf="isProfessionalUser">
            <a routerLink="/professional/reports" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 2v6l3-3 3 3-3 3v6"/>
                <path d="M15 8h6"/>
                <path d="M15 16h6"/>
              </svg>
              <span>Rapports</span>
            </a>
          </li>

          <!-- Navigation spécifique aux créanciers -->
          <li *ngIf="isCreditorUser">
            <a routerLink="/creditor/cases" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <span>Mes Créances</span>
            </a>
          </li>

          <li *ngIf="isCreditorUser">
            <a routerLink="/creditor/tracking" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
              <span>Suivi Temps Réel</span>
            </a>
          </li>

          <li *ngIf="isCreditorUser">
            <a routerLink="/creditor/notifications" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span>Notifications</span>
            </a>
          </li>

          <!-- Navigation spécifique aux cédants -->
          <li *ngIf="isCedantUser">
            <a routerLink="/cedant/portfolios" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <span>Mes Portefeuilles</span>
            </a>
          </li>

          <li *ngIf="isCedantUser">
            <a routerLink="/cedant/invoices" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span>Suivi des Factures</span>
            </a>
          </li>

          <li *ngIf="isCedantUser">
            <a routerLink="/cedant/sales" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span>Processus de Vente</span>
            </a>
          </li>

          <li *ngIf="isProfessionalUser">
            <a routerLink="/professional/documents" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <span>Documents</span>
            </a>
          </li>

          <li>
            <a routerLink="/profile" routerLinkActive="active" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Profil</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info" *ngIf="currentUser">
          <div class="user-avatar">
            {{ currentUser.firstName.charAt(0) }}{{ currentUser.lastName.charAt(0) }}
          </div>
          <div class="user-details">
            <div class="user-name">{{ currentUser.firstName }} {{ currentUser.lastName }}</div>
            <div class="user-role">{{ getUserRoleLabel() }}</div>
          </div>
        </div>
        <button (click)="logout()" class="logout-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid var(--border);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 20px;
      color: var(--primary);
    }

    .sidebar-nav {
      flex: 1;
      padding: 24px 0;
      overflow-y: auto;
    }

    .sidebar-nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar-nav li {
      margin-bottom: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s ease;
      border-right: 3px solid transparent;
    }

    .nav-item:hover {
      background: #f8fafc;
      color: var(--text);
    }

    .nav-item.active {
      background: #eff6ff;
      color: var(--primary);
      border-right-color: var(--primary);
    }

    .sidebar-footer {
      padding: 24px;
      border-top: 1px solid var(--border);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: 500;
      color: var(--text);
      font-size: 14px;
    }

    .user-role {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 12px;
      background: #fee2e2;
      color: #991b1b;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      background: #fecaca;
    }

    @media (max-width: 1024px) {
      .sidebar {
        width: 260px;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .sidebar.open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
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