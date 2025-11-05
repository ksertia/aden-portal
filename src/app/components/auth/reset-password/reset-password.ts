import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {

  resetForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
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

    // Simulation d’appel backend
    setTimeout(() => {
      this.isSubmitting = false;
      this.successMessage = 'Mot de passe réinitialisé avec succès !';
      this.resetForm.reset();
    }, 1500);
  }

}
