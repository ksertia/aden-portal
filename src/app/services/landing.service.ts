import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environment/environment";
import { Hero, Nav, Services, Benefits, Statistiques, CTA, Contact, Footer, Common, Sidebar } from "../models/landing.model";

@Injectable({
    providedIn: 'root'
})
export class LandingService {

    private apiUrl = `${environment.apiUrl}`;
    constructor( private http: HttpClient ) {}

    getNav(): Observable<{ data: Nav[] }> {
    return this.http.get<{ data: Nav[] }>(`${this.apiUrl}/navs`);
    }


    getHero(): Observable<{ data: Hero[] }> {
    return this.http.get<{ data: Hero[] }>(`${this.apiUrl}/heroes`);
   }


   getServices(): Observable<{ data: Services[]  }> {
    return this.http.get<{ data: Services[] }>(`${this.apiUrl}/services`);
   }

   getBenefits(): Observable<{ data: Benefits[] }> {
    return this.http.get<{ data: Benefits[] }>(`${this.apiUrl}/benefits`);
   }

   getStats(): Observable<{ data: Statistiques[] }> {
    return this.http.get<{ data: Statistiques[] }>(`${this.apiUrl}/statistiques`);
   }

   getCTA(): Observable<{ data: CTA[] }> {
    return this.http.get<{ data: CTA[] }>(`${this.apiUrl}/ctas`);
   }

    getContact(): Observable<{ data: Contact[] }> {
     return this.http.get<{ data: Contact[] }>(`${this.apiUrl}/contact`);
    }

    getFooter(): Observable<{ data: Footer[] }> {
     return this.http.get<{ data: Footer[] }>(`${this.apiUrl}/footers`);
    }

    getCommon(): Observable<{ data: Common[] }> {
     return this.http.get<{ data: Common[] }>(`${this.apiUrl}/commons`);
    }
    //Sidebar
    getSidebar(): Observable<{ data: Sidebar[] }> {
     return this.http.get<{ data: Sidebar[] }>(`${this.apiUrl}/sidebar`);
    }
}