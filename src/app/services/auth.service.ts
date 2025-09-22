import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { User, UserRole, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // 👉 Ton BFF Express
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // ✅ mockUsers bien placé comme propriété de la classe
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'debiteur@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      role: UserRole.DEBTOR,
      phone: '+33 1 23 45 67 89',
      address: {
        street: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      }
    },
    {
      id: '2',
      email: 'huissier@example.com',
      firstName: 'Marie',
      lastName: 'Martin',
      role: UserRole.BAILIFF,
      phone: '+33 1 23 45 67 90',
      companyName: 'Étude Martin & Associés',
      licenseNumber: 'HU75001',
      address: {
        street: '45 Avenue de l\'Opéra',
        city: 'Paris',
        postalCode: '75002',
        country: 'France'
      }
    },
    {
      id: '3',
      email: 'avocat@example.com',
      firstName: 'Pierre',
      lastName: 'Durand',
      role: UserRole.LAWYER,
      phone: '+33 1 23 45 67 91',
      companyName: 'Cabinet Durand',
      licenseNumber: 'AV75002',
      address: {
        street: '78 Boulevard Saint-Germain',
        city: 'Paris',
        postalCode: '75006',
        country: 'France'
      }
    },
    {
      id: '4',
      email: 'creancier@example.com',
      firstName: 'Sophie',
      lastName: 'Lambert',
      role: UserRole.CREDITOR,
      phone: '+33 1 23 45 67 92',
      companyName: 'ABC Services',
      address: {
        street: '456 Avenue des Affaires',
        city: 'Lyon',
        postalCode: '69000',
        country: 'France'
      }
    },
    {
      id: '5',
      email: 'cedant@example.com',
      firstName: 'Thomas',
      lastName: 'Moreau',
      role: UserRole.CEDANT,
      phone: '+33 1 23 45 67 93',
      companyName: 'TechCorp Solutions',
      address: {
        street: '789 Rue de l\'Innovation',
        city: 'Marseille',
        postalCode: '13000',
        country: 'France'
      }
    },
    {
      id: '6',
      email: 'partenaire@example.com',
      firstName: 'Laurent',
      lastName: 'Rousseau',
      role: UserRole.RECOVERY_PARTNER,
      phone: '+33 1 23 45 67 94',
      companyName: 'Recouvrement Solutions',
      licenseNumber: 'RP75003',
      address: {
        street: '321 Avenue du Commerce',
        city: 'Toulouse',
        postalCode: '31000',
        country: 'France'
      }
    }
  ];

  constructor(private http: HttpClient) {
    // Récupérer l'utilisateur du localStorage au démarrage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // ✅ Connexion via le BFF
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  // ✅ Déconnexion
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  // ✅ Vérifie si connecté
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // ✅ Vérifie si l’utilisateur a un rôle
  hasRole(role: UserRole): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.role === role;
  }

  // ✅ Récupère l’utilisateur actuel
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ✅ Exemple : mise à jour du profil (via BFF → Strapi)
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
