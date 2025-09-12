import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, UserRole, LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

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
    }
  ];

  constructor() {
    // Récupérer l'utilisateur du localStorage au démarrage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const user = this.mockUsers.find(u => u.email === credentials.email);
    
    if (user && credentials.password === 'password123') {
      const response: LoginResponse = {
        user,
        token: 'mock-jwt-token-' + user.id
      };
      
      return of(response).pipe(
        delay(1000), // Simuler le délai réseau
        tap(response => {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('authToken', response.token);
          this.currentUserSubject.next(response.user);
        })
      );
    } else {
      return throwError(() => new Error('Identifiants invalides'));
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: UserRole): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.role === role;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    const updatedUser = { ...currentUser, ...userData };
    
    return of(updatedUser).pipe(
      delay(500),
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }
}