import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/user.model';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  translations: any = {};
   
  credentials: LoginRequest = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService,
     private router: Router,
     private i18nService: I18nService,
    ) {}


  ngOnInit() {

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

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        // this.router.navigate(['/dashboard']);
        this.redirectToDashboard(response.user);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erreur de connexion';
        this.isLoading = false;
      }
    });
    
  }

  private redirectToDashboard(user: any): void {
    console.log('Structure complète user:', JSON.stringify(user, null, 2));
      
    if (!user || !user.role) {
      console.warn('Utilisateur ou rôle manquant');
      this.router.navigate(['/dashboard']);
      return;
    }

    // CORRECTION : Utiliser les mêmes noms de rôles que dans vos routes
    const roleName = user.role.name;
    console.log('Nom du rôle détecté:', roleName);

    switch (roleName) {
      case 'debtor':
        this.router.navigate(['/debtor/dashboard']); // Rediriger vers le dashboard du débiteur
      break;
      case 'Administrateur':
        this.router.navigate(['/Administrateur/dashboard']); // Rediriger vers le dashboard de l'adminstrateur
      break;
      case 'bailiff':
        this.router.navigate(['/bailiff/dashboard']); // Rediriger vers le dashboard de l'huissier
      break;
      case 'lawyer':
        this.router.navigate(['/lawyer/dashboard']); // Rediriger vers le dashboard de l'avocat
      break;
      case 'creditor':
        this.router.navigate(['/creditor/dashboard']); // Rediriger vers une le dashboard du creancier 
      break;
      case 'cedant':
        this.router.navigate(['/cedant/dashboard']); // Rediriger vers le dashboard du cédant
      break;
      case 'partner':
        this.router.navigate(['/partner/dashboard']); // Rediriger vers le dashboard du partenaire
      break;
      default:
        this.router.navigate(['/dashboard']);
        console.warn(`Rôle non géré: ${roleName}`);
      break;
    }
  }
  
  loginAsDemo(email: string) {
    this.credentials.email = email;
    this.credentials.password = 'password123';
    this.onSubmit();
  }

  showPassword: boolean = false;



}