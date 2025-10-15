import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

// Type pour l'inscription
interface RegisterUser {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  role: string; // clé du rôle (ex : 'creancier', 'avocat')
}

// Map des types de profil vers roleId Strapi
const ROLE_IDS: Record<string, number> = {
  debiteur: 3,
  creancier: 6,
  avocat: 5,
  huissier: 4,
  partenaire: 8,
  cedant: 7,
  authenticated: 1
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {

  user: RegisterUser = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    role: ''
  };

  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  roles = [
    { value: 'debiteur', label: 'Débiteur' },
    { value: 'creancier', label: 'Créditeur' },
    { value: 'avocat', label: 'Avocat' },
    { value: 'huissier', label: 'Huissier' },
    { value: 'partenaire', label: 'Partenaire' },
    { value: 'cedant', label: 'Cédant' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.user.nom || !this.user.prenom || !this.user.email || !this.user.telephone || !this.user.password || !this.confirmPassword || !this.user.role) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.user.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userPayload = {
      username: `${this.user.nom}${this.user.prenom}`,
      email: this.user.email,
      password: this.user.password,
      firstname: this.user.prenom,
      lastname: this.user.nom,
      phone: this.user.telephone,
      role: ROLE_IDS[this.user.role] // ID du rôle
    };

    this.authService.register(userPayload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Erreur lors de l’inscription';
        this.isLoading = false;
      }
    });
  }
}
