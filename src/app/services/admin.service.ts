import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, Avocats } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api'; // ton backend Strapi

  constructor(private http: HttpClient) {}

    // Récupération d'un avocat
  getLawyers(): Observable<Avocats[]> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map((res) => {
        if (res?.data?.map) {
          const lawyer = res.data.map;
          return [ // on retourne un tableau pour s’adapter au composant
            {
              objetId: lawyer.objetId,
              nomAvocat: lawyer.nomAvocat,
              prenomAvocat: lawyer.prenomAvocat,
              nomCabinet: lawyer.nomCabinet,
              emailProfessionnel: lawyer.emailProfessionnel,
              telephone: lawyer.telephone,
              barreau: lawyer.barreau,
              specialites: lawyer.specialites || [],
              languesParles: lawyer.languesParles || [],
              tarifHoraire: lawyer.tarifHoraire,
              tarifForfaitaire: lawyer.tarifForfaitaire,
              disponibilite: lawyer.disponibilite,
              statutGlobal: lawyer.statutGlobal,
              commentaires: lawyer.commentaires,
              dateCreation: lawyer.dateCreation
            } as Avocats
          ];
        }
        return [];
      })
    );
  }

  deleteLawyer(objetId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${objetId}`);
  }


}
