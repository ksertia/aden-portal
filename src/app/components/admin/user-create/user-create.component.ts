import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../models/user.model';
import { environment } from '../../../../environment/environment';

// 🔹 Définition du type de profil autorisé
type ProfilType =
  | 'debiteur'
  | 'creancier'
  | 'avocat'
  | 'huissier'
  | 'partenaire'
  | 'cedant'
  | 'authenticated';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
  @Input() prefillData: any; // infos venant du BFF (email, prénom, nom, role, nodeId…)
  @Input() isDrawerOpen: boolean = false;
  @Output() drawerClosed = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<any>();

  userForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  // ⚡ Map typée des types d'utilisateurs vers les roleIds
  private readonly ROLE_IDS: Record<ProfilType, string> = {
    debiteur: '3',      // À adapter selon ta config Strapi
    creancier: '6',
    avocat: '5',
    huissier: '4',
    partenaire: '8',
    cedant: '7',
    authenticated: '1'  // Rôle par défaut
  };

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['1'], // ⚡ Valeur par défaut = Authenticated
      nodeId: ['']
    });
  }

  ngOnInit(): void {
    if (this.prefillData) {
      let roleId = '1'; // Défaut = Authenticated

      if (this.prefillData.roleId) {
        roleId = this.prefillData.roleId;
      } else if (this.prefillData.userType) {
        // ✅ Utilisation du typage strict
        const userType = this.prefillData.userType.toLowerCase() as ProfilType;
        roleId = this.ROLE_IDS[userType] || '1';
      }

      this.userForm.patchValue({
        email: this.prefillData.email,
        firstName: this.prefillData.firstName,
        lastName: this.prefillData.lastName,
        username: this.prefillData.username || this.generateUsername(),
        role: roleId,
        nodeId: this.prefillData.nodeId || ''
      });
    }
  }

  private generateUsername(): string {
    if (this.prefillData?.email) {
      return this.prefillData.email.split('@')[0];
    }
    return '';
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;

      if (!formValue.role || formValue.role === '') {
        this.errorMessage = "Le rôle utilisateur est requis";
        return;
      }

      const newUser = {
        username: formValue.username,
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        role: formValue.role,
        nodeId: formValue.nodeId
      };

      console.log('🚀 Création utilisateur avec données:', newUser);

      this.adminService.createUserViaBFF(newUser).subscribe({
        next: (res) => {
          this.successMessage = "Utilisateur créé avec succès ✅";
          this.errorMessage = "";
          this.userCreated.emit(res);
          this.userForm.reset();
          setTimeout(() => this.closeDrawer(), 1500);
        },
        error: (err) => {
          console.error('❌ Erreur création utilisateur:', err);
          this.errorMessage =
            err.error?.message ||
            err.error?.error ||
            "Erreur lors de la création de l'utilisateur";
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
