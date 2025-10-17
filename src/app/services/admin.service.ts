import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environment/environment';
import { catchError } from 'rxjs/operators';
import { Debiteurs } from '../models/user.model';
import { map } from 'rxjs/operators';
import { DebtorInfo } from '../models/case.model';
import { 
  ApiDebtorResponse,
  CreditorDetail,
  ApiCreditorResponse,
  HuissierInfo,
  ApiHuissierResponse,
  PartenaireInfo,
  ApiPartenaireResponse,
  AvocatInfo,
  ApiResponseAvocat,
  GlobalApiResponse  
} from '../models/case.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = `${environment.baseUrl}/debiteurs`;
  private creancierUrl = `${environment.baseUrl}/creanciers`;
  private huissierUrl = `${environment.baseUrl}/huissiers`;
  private partenaireUrl = `${environment.baseUrl}/partenaires`;
  private avocatUrl = `${environment.baseUrl}/avocats`;
  private allUrl = `${environment.baseUrl}/get_all_users`;

  constructor(private http: HttpClient) {}

  // récupérer la liste des débiteurs
  getDebiteurs(sitename: string): Observable<DebtorInfo[]> {
    return this.http.get<ApiDebtorResponse>(`${this.apiUrl}/${sitename}`).pipe(
      map(res => res.data.map(item => ({
        firstName: item.map.prenomDebiteur,
        lastName: item.map.nomDebiteur,
        companyName: item.map.raisonSociale,
        email: item.map.emailDebiteur,
        phone: item.map.telephone,
        nodeId: item.map.nodeId,
        situation: item.map.situationFinanciere,
        dette: item.map.montantDette,
        address: {
          street: item.map.adresse,
          postalCode: item.map.codePostal,
          city: '', 
          country: '' 
        },
        type: item.map.typeDebiteur,
       
      })))
    );
  }

  // récupérer un débiteur par ID
  getDebiteurById(sitename: string, debiteurId: string): Observable<Debiteurs> {
    return this.http.get<Debiteurs>(`${this.apiUrl}/${sitename}/${debiteurId}`);
  }

  // récupérer la liste des créanciers
  getCreanciers(sitename: string): Observable<CreditorDetail[]> {
    return this.http.get<ApiCreditorResponse>(`${this.creancierUrl}/${sitename}`).pipe(
      map(res => res.data.map(item => item.map))
    );
  }

  // récupérer la liste des huissiers
  getHuissiers(sitename: string): Observable<HuissierInfo[]> {
    return this.http.get<ApiHuissierResponse>(`${this.huissierUrl}/${sitename}`).pipe(
      map(res => res.data.map(item => item.map))
    );
  }

  // récupérer la liste des partenaires
  getPartenaires(sitename: string): Observable<PartenaireInfo[]> {
    return this.http.get<ApiPartenaireResponse>(`${this.partenaireUrl}/${sitename}`).pipe(
      map(res => res.data.map(item => item.map))
    );
  }

  // récupérer les avocats
  getAvocats(sitename: string): Observable<AvocatInfo[]> {
    return this.http.get<ApiResponseAvocat>(`${this.avocatUrl}/${sitename}`).pipe(
      map(res => res.data.map(item => item.map))
    );
  }

  // récupérer tous les utilisateurs
  getAllUsers(sitename: string): Observable<GlobalApiResponse> {
    return this.http.get<GlobalApiResponse>(`${this.allUrl}/${sitename}`);
  }

  // --- intégration Strapi ---

  // récupérer un user Strapi par email
  getUserByEmail(email: string): Observable<any> {
    const url = `http://localhost:3000/auth/users/search/${encodeURIComponent(email)}`;

    console.log('Recherche utilisateur via BFF:', email);

    return this.http.get(url).pipe(
      map((response: any) => {
        console.log(' Utilisateur trouvé:', response);
        return response;
      }),
      catchError((error) => {
        if (error.status === 404) {
          console.log('ℹAucun utilisateur trouvé pour:', email);
          return of(null); // Retourne null si l'utilisateur n'existe pas
        }
        console.error('Erreur recherche utilisateur:', error);
        return of(null);
      })
    );
  }

  // Récupérer la liste des rôles Strapi
  getStrapiRoles(): Observable<any> {
    const url = `${environment.apiUrl}/users-permissions/roles`;
    return this.http.get<any>(url);
  }

  // créer un utilisateur dans Strapi
  // admin.service.ts
  createUserViaBFF(userData: any): Observable<any> {
  const url = 'http://localhost:3000/auth/register';

  const payload = {
    username: userData.username,
    email: userData.email,
    firstname: userData.firstName,
    lastname: userData.lastName,
    nodeId: userData.nodeId, // Vérifie bien que ce champ existe
    role: userData.role, // ID du rôle
  };

  // Log avant d’envoyer
  console.log('[Angular] Données envoyées au BFF:', payload);

  return this.http.post(url, payload);
  }


  getDebiteurRole() {
    return this.http.get(`${this.apiUrl}/roles/debiteur`);
  }


}