import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StrapiRole, User, Address, Role } from '../../../models/user.model';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent {
  userForm: FormGroup;
  roles = Object.values(StrapiRole); // Liste des rôles disponibles
  statut = ['Actif', 'Désactivé'];
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required] }),
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required], // Rôle en string
      statut: ['Actif', Validators.required], 
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const defaultPassword = 'default123'; // Mot de passe par défaut

      // On crée un user simplifié, role = string
      const newUser: Partial<User> = {
        username: formValue.username,
        email: formValue.email,
        phone: formValue.phone,
        firstname: formValue.firstName,
        lastname: formValue.lastName,
        address: formValue.address as Address,
        role: { name: formValue.role } as Role, // on mappe string -> objet minimal
        statut: formValue.statut,
      };

      console.log('✅ Formulaire envoyé :', newUser);
      this.successMessage = "Utilisateur créé avec succès ✅";
      this.errorMessage = "";
    } else {
      console.log('❌ Formulaire invalide');
      this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
      this.successMessage = "";
    }
  }
}
