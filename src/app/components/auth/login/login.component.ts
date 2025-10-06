import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest, LoginResponse } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
        // this.router.navigate(['/dashboard']);
        this.redirectToDashboard(response.user);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erreur de connexion';
        this.isLoading = false;
      }
    });
    
  }
  // private redirectBasedOnUserRole(user: any) {
  //   // Supposons que l'utilisateur ait une propriété 'role'
  //   switch (user.role) {
  //     case 'adebtor':
  //       this.router.navigate(['/debtor/dashboard']);
  //       break;
  //     case 'manager':
  //       this.router.navigate(['/manager/dashboard']);
  //       break;
  //     case 'user':
  //       this.router.navigate(['/user/dashboard']);
  //       break;
  //     default:
  //       this.router.navigate(['/dashboard']);
  //   }
  // }
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
      case 'debtor': // ← CORRIGÉ : 'debiteur' au lieu de 'adebtor'
        this.router.navigate(['/debtor/dashboard']);
        break;
      case 'administrateur': // ← CORRIGÉ : 'administrateur' au lieu de 'manager'
        this.router.navigate(['/Administrateur/user-list']); // Rediriger vers une page existante
        break;
      case 'huissier':
        this.router.navigate(['/bailiff/cases']); // Rediriger vers une page existante
        break;
      case 'avocat':
        this.router.navigate(['/lawyer/cases']); // Rediriger vers une page existante
        break;
      case 'creditor':
        this.router.navigate(['/creditor/dashboard']); // Rediriger vers une page existante
        break;
      case 'cedant':
        this.router.navigate(['/cedant/portfolios']); // Rediriger vers une page existante
        break;
      case 'partenaire':
        this.router.navigate(['/partner/cases']); // Rediriger vers une page existante
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

}