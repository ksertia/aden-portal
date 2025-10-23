import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DebtCase } from '../models/case.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';


@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private casesSubject = new BehaviorSubject<DebtCase[]>([]);
  public cases$ = this.casesSubject.asObservable();

  private apiUrl = `${environment.baseUrl}/debiteurs`;

  private documentApiUrl = `${environment.baseUrl}/documents`;

  constructor(private http: HttpClient) {
    // this.casesSubject.next(this.mockCases);
  }
  
  getDossiersDebiteur(siteName: string, debiteurNodeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${siteName}/dossiers`, {
      params: { debiteurNodeId } // Ajout du paramètre de requête
    });
  }
  getDossiersCreancier(siteName: string, creancierNodeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${siteName}/dossiers`, {
      params: { creancierNodeId } // Ajout du paramètre de requête
    });
  }

  getDossiersCedant(siteName: string, cedantNodeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${siteName}/dossiers`, {
      params: { cedantNodeId } // Ajout du paramètre de requête
    });
  }
  getDossiersHuissier(siteName: string, huissierNodeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${siteName}/dossiers`, {
      params: { huissierNodeId } // Ajout du paramètre de requête
    });
  }
  getDossiersAvocat(siteName: string, avocatNodeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${siteName}/dossiers`, {
      params: { avocatNodeId } // Ajout du paramètre de requête
    });
  }



  // Récupération du contenu d'un document (pour visualisation)
  getDocumentContent(nodeId: string): Observable<Blob> {
    return this.http.get(`${this.documentApiUrl}/${nodeId}/content`, {
      responseType: 'blob'
    });
  }

  // Récupération des métadonnées d'un document
  getDocumentMetadata(nodeId: string): Observable<any> {
    return this.http.get(`${this.documentApiUrl}/${nodeId}/metadata`);
  }

   // Télécharger un document
  downloadDocument(nodeId: string, fileName: string): void {
    this.getDocumentContent(nodeId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
      }
    });
  }

  //  Nouvelle méthode : Upload d'un document vers Alfresco
  uploadDocument(file: File, metadata?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Ajouter des métadonnées si nécessaire
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });
    }

    return this.http.post(`${this.documentApiUrl}/upload`, formData);
  }


}