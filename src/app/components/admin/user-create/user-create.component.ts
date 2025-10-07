import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../models/user.model';
import { environment } from '../../../../environment/environment';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
  @Input() prefillData: any; // infos venant du BFF (email, prénom, nom, role…)
  @Input() isDrawerOpen: boolean = false;
  @Output() drawerClosed = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<any>();

  userForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: [''], // prérempli depuis le BFF
    });
  }

  ngOnInit(): void {
    // Préremplir avec les infos du BFF
    if (this.prefillData) {
      this.userForm.patchValue({
        email: this.prefillData.email,
        firstName: this.prefillData.firstName,
        lastName: this.prefillData.lastName,
        username: this.prefillData.username || '',
        role: this.prefillData.roleId || this.prefillData.role || '' // rôle transmis
      });
    }
  }

  onSubmit() {
  if (this.userForm.valid) {
    const formValue = this.userForm.value;

    const newUser = {
      username: formValue.username,
      email: formValue.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      role: formValue.role // ID du rôle transmis par le BFF
    };

    this.adminService.createUserViaBFF(newUser).subscribe({
      next: (res) => {
        this.successMessage = "Utilisateur créé avec succès ✅";
        this.errorMessage = "";
        this.userCreated.emit(res);
        this.closeDrawer();
      },
      error: (err) => {
        console.error(err);
        // Affiche le message reçu du BFF si dispo
        this.errorMessage = err.error?.message || "Erreur lors de la création de l'utilisateur";
        this.successMessage = "";
      }
    });
  } else {
    this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
    this.successMessage = "";
  }
}


  closeDrawer() {
    this.isDrawerOpen = false;
    this.drawerClosed.emit();
  }
}
