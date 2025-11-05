import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-reset-code',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-code.html',
  styleUrl: './reset-code.css'
})
export class ResetCode {

  codeForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]]
    });
  }

  onSubmit() {
    if (this.codeForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulation d’un appel API de vérification du code
    setTimeout(() => {
      this.isSubmitting = false;
      const enteredCode = this.codeForm.value.code;

      if (enteredCode === '123456') {
        this.successMessage = 'Code vérifié avec succès ! Redirection vers la réinitialisation du mot de passe...';
        setTimeout(() => this.router.navigate(['/new-password']), 3000);
      } else {
        this.errorMessage = 'Le code saisi est invalide ou expiré.';
      }
    }, 2000);
  }

}
