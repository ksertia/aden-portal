import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, StrapiRole } from '../../models/user.model';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @Input() user: User | null = null;
  isUpdating = false;
  updateSuccess = false;
  translations: any = {};

  avatarFile: File | null = null;
  avatarPreviewUrl: string | null = null; // ✅ ajout pour corriger l'erreur

  constructor(
    private authService: AuthService,
    private i18nService: I18nService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.user) this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.user = { ...this.user };
      if ((this.user as any).avatar) this.avatarPreviewUrl = (this.user as any).avatar;
    }

    this.loadTranslations();
    this.i18nService.currentLocale$.subscribe(() => this.loadTranslations());
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

    // Création de l'objet userData
    const userData: {
      firstname?: string;
      lastname?: string;
      email?: string;
      Phone?: string;
      photo?: File;
    } = {
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      email: this.user.email,
      Phone: this.user.Phone
    };

    if (this.avatarFile) userData.photo = this.avatarFile;

    console.log("Envoi userData:", userData);
    console.log("User id:", userId);

    // Ici on force le type any pour éviter l'erreur FormData vs objet TS
    this.authService.updateProfileMultipart(userId, userData as any).subscribe({
      next: (resp) => {
        this.isUpdating = false;
        if (resp.user) {
          this.user = resp.user;
        }
        this.showSuccessMessage();
      },
      error: (err) => {
        console.error("Erreur lors de la mise à jour", err);
        this.isUpdating = false;
        if (err?.error?.message?.includes("Token invalide")) {
          alert("Votre session a expiré. Veuillez vous reconnecter.");
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private showSuccessMessage() {
    this.updateSuccess = true;
    setTimeout(() => this.updateSuccess = false, 3000);
  }

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

  goToChangePassword() {
    this.router.navigate(['/change-password']);
  }
}
