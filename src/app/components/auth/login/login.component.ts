import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card fade-in-up">
        <div class="login-header">
          <div class="logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v6l3-3 3 3"/>
              <path d="M12 8v8"/>
              <path d="m8 14 4 4 4-4"/>
            </svg>
          </div>
          <h1>RecouvrePro</h1>
          <p>Connexion à votre espace personnel</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="credentials.email"
              name="email"
              placeholder="Votre adresse e-mail"
              required
              [disabled]="isLoading"
            >
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="credentials.password"
              name="password"
              placeholder="Votre mot de passe"
              required
              [disabled]="isLoading"
            >
          </div>

          <div class="error-message" *ngIf="errorMessage">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {{ errorMessage }}
          </div>

          <button type="submit" class="login-btn" [disabled]="isLoading">
            <span *ngIf="!isLoading">Se connecter</span>
            <span *ngIf="isLoading" class="loading">
              <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4m6 2-4 4m4 6-4-4m-6 4v-4m-6-2 4-4m-4-6 4 4"/>
              </svg>
              Connexion...
            </span>
          </button>
        </form>

        <div class="demo-accounts">
          <h3>Comptes de démonstration</h3>
          <div class="demo-grid">
            <div class="demo-account" (click)="loginAsDemo('debiteur@example.com')">
              <div class="demo-icon debtor">D</div>
              <div class="demo-info">
                <div class="demo-name">Débiteur</div>
                <div class="demo-email">debiteur&#64;example.com</div>
              </div>
            </div>
            <div class="demo-account" (click)="loginAsDemo('huissier@example.com')">
              <div class="demo-icon bailiff">H</div>
              <div class="demo-info">
                <div class="demo-name">Huissier</div>
                <div class="demo-email">huissier&#64;example.com</div>
              </div>
            </div>
            <div class="demo-account" (click)="loginAsDemo('avocat@example.com')">
              <div class="demo-icon lawyer">A</div>
              <div class="demo-info">
                <div class="demo-name">Avocat</div>
                <div class="demo-email">avocat&#64;example.com</div>
              </div>
            </div>
            <div class="demo-account" (click)="loginAsDemo('creancier@example.com')">
              <div class="demo-icon creditor">C</div>
              <div class="demo-info">
                <div class="demo-name">Créancier</div>
                <div class="demo-email">creancier&#64;example.com</div>
              </div>
            </div>
            <div class="demo-account" (click)="loginAsDemo('cedant@example.com')">
              <div class="demo-icon cedant">Cd</div>
              <div class="demo-info">
                <div class="demo-name">Cédant</div>
                <div class="demo-email">cedant&#64;example.com</div>
              </div>
            </div>
            <div class="demo-account" (click)="loginAsDemo('partenaire@example.com')">
              <div class="demo-icon partner">P</div>
              <div class="demo-info">
                <div class="demo-name">Partenaire</div>
                <div class="demo-email">partenaire&#64;example.com</div>
              </div>
            </div>
          </div>
          <p class="demo-note">Mot de passe pour tous les comptes : <code>password123</code></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: var(--surface);
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
      width: 100%;
      max-width: 480px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      margin-bottom: 24px;
    }

    .login-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .login-header p {
      color: var(--text-secondary);
      font-size: 16px;
    }

    .form-group {
      margin-bottom: 24px;
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
      padding: 16px;
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
      cursor: not-allowed;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--error);
      font-size: 14px;
      margin-bottom: 24px;
      padding: 12px;
      background: #fee2e2;
      border-radius: 8px;
      border: 1px solid #fecaca;
    }

    .login-btn {
      width: 100%;
      padding: 16px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 32px;
    }

    .login-btn:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .demo-accounts {
      border-top: 1px solid var(--border);
      padding-top: 32px;
    }

    .demo-accounts h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
      text-align: center;
    }

    .demo-grid {
      display: grid;
      gap: 12px;
      margin-bottom: 16px;
    }

    .demo-account {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .demo-account:hover {
      border-color: var(--primary);
      background: #eff6ff;
    }

    .demo-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 16px;
    }

    .demo-icon.debtor { background: #059669; }
    .demo-icon.bailiff { background: #ea580c; }
    .demo-icon.lawyer { background: #7c3aed; }
    .demo-icon.creditor { background: #2563eb; }
    .demo-icon.cedant { background: #059669; }
    .demo-icon.partner { background: #7c3aed; }

    .demo-info {
      flex: 1;
    }

    .demo-name {
      font-weight: 500;
      color: var(--text);
      font-size: 14px;
    }

    .demo-email {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .demo-note {
      text-align: center;
      font-size: 12px;
      color: var(--text-secondary);
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
    }

    .demo-note code {
      background: #e2e8f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
    }

    .back-to-home {
      margin-top: 16px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: var(--primary);
    }

    @media (max-width: 640px) {
      .login-card {
        padding: 32px 24px;
      }
      
      .login-header h1 {
        font-size: 24px;
      }
    }
  `]
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erreur de connexion';
        this.isLoading = false;
      }
    });
  }

  loginAsDemo(email: string) {
    this.credentials.email = email;
    this.credentials.password = 'password123';
    this.onSubmit();
  }
}