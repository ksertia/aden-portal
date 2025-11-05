import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';


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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]]
    });
  }

  onSubmit() {
    if (this.codeForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const enteredCode = this.codeForm.value.code;

    // On stocke le code dans AuthService pour ResetPassword
    this.authService.setResetCode(enteredCode);
    this.isSubmitting = false;
    this.successMessage = 'Code enregistré avec succès ! Redirection...';
    setTimeout(() => this.router.navigate(['/reset-password']), 1500);
  }
}
