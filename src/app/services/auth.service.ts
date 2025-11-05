import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from '../../environment/environment';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { User, StrapiRole, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.baseUrl}/auth`; //  Mon BFF Express
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Récupérer l'utilisateur du localStorage au démarrage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Connexion via le BFF
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
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
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
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

  // Exemple : mise à jour du profil (via BFF → Strapi)
  updateProfile(userData: Partial<User>): Observable<User> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    return this.http.put<User>(`${this.apiUrl}/profile`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }
}

