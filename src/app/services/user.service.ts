import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, StrapiRole } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.strapiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createUser(userData: Partial<User>): Observable<User> {
    const payload = {
      data: {
        ...userData,
        password: 'default123', // Mot de passe par défaut
        firstLogin: true,
        confirmed: true // Confirmer l'utilisateur automatiquement pour admin
      }
    };
    return this.http.post<User>(`${this.apiUrl}`, payload, { headers: this.getAuthHeaders() });
  }

  listUsersByRole(role: StrapiRole): Observable<{ data: User[] }> {
    return this.http.get<{ data: User[] }>(`${this.apiUrl}?filters[role][name][$eq]=${role}&populate=role`, { headers: this.getAuthHeaders() });
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    const payload = { data: userData };
    return this.http.put<User>(`${this.apiUrl}/${id}`, payload, { headers: this.getAuthHeaders() });
  }

  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<any> {
    const payload = {
      data: {
        currentPassword,
        password: newPassword
      }
    };
    return this.http.put<any>(`${this.apiUrl}/${userId}/change-password`, payload, { headers: this.getAuthHeaders() });
  }

  linkBusiness(userId: number, businessId: string): Observable<User> {
    const payload = { data: { businessId } };
    return this.http.put<User>(`${this.apiUrl}/${userId}`, payload, { headers: this.getAuthHeaders() });
  }
}
