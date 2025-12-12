import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword implements OnInit {

  resetForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  showNewPassword = false;
  showConfirmPassword = false;

  // 🔑 Ce code provient du lien envoyé par mail : ?code=xxxxxx
  private resetCode = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // ✅ On récupère le code depuis l'URL
    this.resetCode = this.route.snapshot.queryParamMap.get('code') || '';

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'newPassword') this.showNewPassword = !this.showNewPassword;
    else if (field === 'confirmPassword') this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    const { newPassword, confirmPassword } = this.resetForm.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ✅ On envoie le code avec les mots de passe au service
    this.authService.resetPassword(this.resetCode, newPassword, confirmPassword).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Mot de passe réinitialisé avec succès !';
        this.resetForm.reset();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de la réinitialisation du mot de passe';
      }
    });
  }

  
}
