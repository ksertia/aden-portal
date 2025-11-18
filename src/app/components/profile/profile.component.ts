import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, StrapiRole } from '../../models/user.model';
import { I18nService } from '../../services/i18n.service';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @Input() user: User | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isUpdating = false;
  updateSuccess = false;
  translations: any = {};

  // 📸 Gestion avatar
  avatarFile: File | null = null;
  avatarPreviewUrl: string | null = null;
  isUploadingAvatar = false;

  // 🔐 Gestion changement mot de passe
  showPasswordForm = false;
  isChangingPassword = false;
  passwordChangeSuccess = false;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    passwordConfirmation: ''
  };

  constructor(
    private authService: AuthService,
    private i18nService: I18nService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.user) this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.user = { ...this.user };
      // Construire l'URL de l'avatar s'il existe
      this.loadAvatarUrl();
    }

    this.loadTranslations();
    this.i18nService.currentLocale$.subscribe(() => this.loadTranslations());
  }

  /**
   * Charge l'URL de l'avatar depuis Strapi
   */
  private loadAvatarUrl() {
    if (this.user && (this.user as any).profil) {
      const profil = (this.user as any).profil;
      
      // Si profil est un objet avec url
      if (typeof profil === 'object' && profil.url) {
        this.avatarPreviewUrl = `${environment.apiUrl}${profil.url}`;
      } 
      // Si profil est déjà une URL complète
      else if (typeof profil === 'string') {
        this.avatarPreviewUrl = profil;
      }
    }
  }

  private loadTranslations() {
    const currentLocale = this.i18nService.getCurrentLocale();
    this.i18nService.loadTranslations(currentLocale).subscribe(translations => {
      this.translations = translations;
    });
  }

  t(key: string): string {
    return this.i18nService.translate(key, this.translations);
  }

  getUserRoleLabel(): string {
    if (!this.user) return '';
    switch (this.user.role?.name) {
      case StrapiRole.DEBTOR: return 'Débiteur';
      case StrapiRole.BAILIFF: return 'Huissier de Justice';
      case StrapiRole.LAWYER: return 'Avocat';
      case StrapiRole.CREDITOR: return 'Créancier';
      case StrapiRole.CEDANT: return 'Cédant';
      case StrapiRole.RECOVERY_PARTNER: return 'Partenaire de recouvrement';
      case StrapiRole.ADMINISTRATEUR: return 'Administrateur';
      default: return 'Rôle inconnu';
    }
  }

  // ==================== GESTION AVATAR ====================

  /**
   * Ouvre le sélecteur de fichiers
   */
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  /**
   * Gère la sélection d'un fichier
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validation du type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Validation de la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 5 MB');
      return;
    }

    this.avatarFile = file;

    // Prévisualisation immédiate
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarPreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload automatique
    this.uploadAvatar();
  }

  /**
   * Upload l'avatar vers le serveur
   */
  uploadAvatar() {
    if (!this.avatarFile || !this.user) return;

    this.isUploadingAvatar = true;
    const userId = Number(this.user.id);

    this.authService.uploadAvatar(userId, this.avatarFile).subscribe({
      next: (response) => {
        console.log("✅ Avatar uploadé:", response);
        this.isUploadingAvatar = false;
        
        // Mise à jour de l'utilisateur local
        if (response.user) {
          this.user = response.user;
          this.loadAvatarUrl();
        }

        // Message de succès
        this.updateSuccess = true;
        setTimeout(() => this.updateSuccess = false, 3000);
      },
      error: (err) => {
        console.error("❌ Erreur upload avatar:", err);
        this.isUploadingAvatar = false;
        alert(err?.error?.message || "Erreur lors de l'upload de la photo");
      }
    });
  }

  // ==================== MISE À JOUR PROFIL ====================

  onSubmitProfile() {
    if (!this.user) return;

    this.isUpdating = true;

    const userId = Number(this.user.id);
    if (isNaN(userId)) {
      console.error('User id invalide');
      this.isUpdating = false;
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.error("Token manquant, veuillez vous reconnecter !");
      this.isUpdating = false;
      this.router.navigate(['/login']);
      return;
    }

    const userData = {
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      email: this.user.email,
      Phone: this.user.Phone
    };

    console.log("📤 Envoi userData:", userData);

    this.authService.updateProfile(userId, userData).subscribe({
      next: (response) => {
        console.log("✅ Réponse serveur:", response);
        this.isUpdating = false;
        
        if (response.user) {
          this.user = response.user;
          this.loadAvatarUrl();
        }
        
        this.showSuccessMessage();
      },
      error: (err) => {
        console.error("❌ Erreur lors de la mise à jour:", err);
        this.isUpdating = false;
        
        if (err?.error?.message?.includes("Token invalide") || 
            err?.error?.message?.includes("Accès refusé")) {
          alert("Votre session a expiré ou vous n'avez pas les droits. Veuillez vous reconnecter.");
          this.router.navigate(['/login']);
        } else {
          alert(err?.error?.message || "Erreur lors de la mise à jour du profil");
        }
      }
    });
  }

  private showSuccessMessage() {
    this.updateSuccess = true;
    setTimeout(() => this.updateSuccess = false, 3000);
  }

  // ==================== CHANGEMENT MOT DE PASSE ====================

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.resetPasswordForm();
    }
  }

  cancelPasswordChange() {
    this.showPasswordForm = false;
    this.resetPasswordForm();
  }

  private resetPasswordForm() {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      passwordConfirmation: ''
    };
  }

  onSubmitPasswordChange() {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.passwordConfirmation) {
      alert('Tous les champs sont requis');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.passwordConfirmation) {
      alert('Le nouveau mot de passe et la confirmation ne correspondent pas');
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    this.isChangingPassword = true;

    this.authService.changePassword(
      this.passwordData.currentPassword,
      this.passwordData.newPassword,
      this.passwordData.passwordConfirmation
    ).subscribe({
      next: (response) => {
        console.log("✅ Mot de passe changé avec succès:", response);
        this.isChangingPassword = false;
        this.passwordChangeSuccess = true;

        setTimeout(() => {
          this.passwordChangeSuccess = false;
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error("❌ Erreur changement mot de passe:", err);
        this.isChangingPassword = false;
        
        const errorMessage = err?.error?.message || err?.error?.error?.message || 'Erreur lors du changement de mot de passe';
        
        if (errorMessage.includes('incorrect') || errorMessage.includes('Mot de passe actuel incorrect')) {
          alert('Le mot de passe actuel est incorrect');
        } else {
          alert(errorMessage);
        }
      }
    });
  }

  // ==================== NAVIGATION ====================

  goBackToDashboard(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) { this.router.navigate(['/login']); return; }

    const roleName = currentUser.role?.name?.toUpperCase() || '';
    switch (roleName) {
      case 'AVOCAT': case 'LAWYER': this.router.navigate(['/lawyer/dashboard']); break;
      case 'DEBITEUR': case 'DEBTOR': this.router.navigate(['/debtor/dashboard']); break;
      case 'CREANCIER': case 'CREDITOR': this.router.navigate(['/creditor/dashboard']); break;
      case 'CEDANT': this.router.navigate(['/cedant/dashboard']); break;
      case 'HUISSIER': case 'BAILIFF': this.router.navigate(['/bailiff/dashboard']); break;
      case 'PARTENAIRE': case 'PARTNER': this.router.navigate(['/partner/dashboard']); break;
      case 'ADMINISTRATEUR': this.router.navigate(['/Administrateur/dashboard']); break;
      default: this.router.navigate(['/']); break;
    }
  }
}