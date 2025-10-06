import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
  @Input() prefillData: any; // infos venant du BFF (email, prénom, nom, role…)
  @Output() userCreated = new EventEmitter<any>();

  userForm: FormGroup;
  roles: any[] = []; // récupérés depuis Strapi
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required], // contiendra l'ID du rôle
    });
  }

  ngOnInit(): void {
    // Charger les rôles depuis Strapi
    this.adminService.getStrapiRoles().subscribe({
      next: (res: any) => {
        this.roles = res.data;
      },
      error: (err) => console.error('Erreur lors du chargement des rôles:', err)
    });

    // Préremplir si données dispo
    if (this.prefillData) {
      this.userForm.patchValue({
        email: this.prefillData.email,
        firstName: this.prefillData.firstName,
        lastName: this.prefillData.lastName,
        role: this.prefillData.roleId || '' // si ton BFF stocke déjà un roleId
      });
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const defaultPassword = 'default123';

      const newUser: Partial<User> = {
        username: formValue.username,
        email: formValue.email,
        firstname: formValue.firstName,
        lastname: formValue.lastName,
        // password: defaultPassword,
        role: formValue.role // ⚠️ c’est l’ID du rôle dans Strapi
      };

      this.adminService.createUserInStrapi(newUser).subscribe({
        next: (res) => {
          this.successMessage = "Utilisateur créé avec succès ✅";
          this.errorMessage = "";
          this.userCreated.emit(res);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = "Erreur lors de la création de l'utilisateur";
          this.successMessage = "";
        }
      });
    } else {
      this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
      this.successMessage = "";
    }
  }
}
