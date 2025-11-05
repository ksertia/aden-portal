import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  forgotForm: FormGroup;
  isSubmitting = false;
  emailSent = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulation d’un appel API
    setTimeout(() => {
      this.isSubmitting = false;
      const email = this.forgotForm.value.email;

      if (email === 'test@example.com') {
        this.emailSent = true;
        this.successMessage = 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.';
        setTimeout(() => this.router.navigate(['/reset-password']), 3000);
      } else {
        this.errorMessage = 'Aucun compte associé à cette adresse e-mail.';
      }
    }, 2000);
  }

}
