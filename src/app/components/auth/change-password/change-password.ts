import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {

  changePasswordForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirmation: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.changePasswordForm.invalid) return;

    const { currentPassword, password, passwordConfirmation } = this.changePasswordForm.value;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.changePassword(currentPassword, password, passwordConfirmation).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'Mot de passe mis à jour avec succès 🎉';
        this.changePasswordForm.reset();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  }

}
