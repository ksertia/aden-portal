import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environment/environment";
import {
  User,
  StrapiRole,
  LoginRequest,
  LoginResponse,
} from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = `${environment.baseUrl}/auth`; //  Mon BFF Express
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Pour stocker temporairement le code de réinitialisation
  private resetCodeSubject = new BehaviorSubject<string | null>(null);
  public resetCode$ = this.resetCodeSubject.asObservable();

  constructor(private http: HttpClient) {
    // Récupérer l'utilisateur du localStorage au démarrage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Connexion via le BFF
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          console.log("Login response", response); // utile pour debug
          // Stocke le token correctement
          localStorage.setItem("authToken", response.jwt);
          localStorage.setItem("currentUser", JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  //Inscription
  register(user: any): Observable<User> {
    // user.role = ID du rôle
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
    this.currentUserSubject.next(null);
  }

  // Vérifie si connecté
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Vérifie si l’utilisateur a un rôle
  hasRole(role: StrapiRole): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.role.name === role; // Compare le nom du rôle de l'utilisateur avec l'énumération
  }

  // Récupère l’utilisateur actuel
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Récupère le token
  getToken(): string | null {
    return localStorage.getItem("authToken"); // c'est exactement la clé utilisée
  }

  // ==================== GESTION DU PROFIL ====================

  /**
   * 🔄 Récupère les informations complètes de l'utilisateur connecté
   * GET /auth/me
   */
  getMe(): Observable<{ user: User }> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error("Token manquant"));
    }

    return this.http
      .get<{ user: User }>(`${this.apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        tap((response) => {
          // Mise à jour du profil local
          localStorage.setItem("currentUser", JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        catchError((error) => {
          console.error("❌ Erreur récupération profil:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * 📝 Met à jour le profil de l'utilisateur connecté
   * PUT /auth/users/:id
   * @param userId - ID de l'utilisateur
   * @param userData - Données à mettre à jour (firstname, lastname, Phone, etc.)
   */

  // ==================== GESTION DES MOTS DE PASSE ====================

  /**
   * 🔐 Change le mot de passe de l'utilisateur connecté
   * POST /auth/change-password
   * @param currentPassword - Mot de passe actuel
   * @param newPassword - Nouveau mot de passe
   * @param passwordConfirmation - Confirmation du nouveau mot de passe
   */
 changePassword(currentPassword: string, newPassword: string, passwordConfirmation: string): Observable<any> {
    const token = this.getToken();
    if (!token) throw new Error('Utilisateur non connecté ou token manquant');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body = {
      currentPassword,
      password: newPassword,
      passwordConfirmation
    };

    return this.http.post(`${this.apiUrl}/change-password`, body, { headers });
  }

  // ==================== RESET PASSWORD FLOW ====================

  // Stocke temporairement le code reçu par email
  setResetCode(code: string) {
    this.resetCodeSubject.next(code);
  }

  // Récupère le code
  getResetCode(): string | null {
    return this.resetCodeSubject.value;
  }

  // Demande de réinitialisation (forgot-password)
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  // Réinitialisation du mot de passe (reset-password)
  // ✅ Réinitialiser le mot de passe
  resetPassword(code: string, password: string, passwordConfirmation: string) {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      code,
      password,
      passwordConfirmation,
    });
  }
  updateProfile(
  userId: number,
  userData: Partial<User>
): Observable<{ message: string; user: User }> {
  const token = this.getToken();
  
  if (!token) {
    console.error("Token manquant ou expiré !");
    return throwError(() => new Error("Utilisateur non connecté"));
  }

  console.log("🔄 Envoi updateProfile:", { userId, userData });

  return this.http
    .put<{ message: string; user: User }>(
      `${this.apiUrl}/users/${userId}`,
      userData,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    .pipe(
      tap((response) => {
        console.log("✅ Profil mis à jour:", response);
        // Mise à jour du profil local
        localStorage.setItem("currentUser", JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      }),
      catchError((error) => {
        console.error("❌ Erreur mise à jour profil:", error);
        return throwError(() => error);
      })
    );
}

}
