import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, forkJoin } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environment/environment";
import { 
  Hero, Nav, Services, ServiceItem, Benefits, BenefitItem, 
  Statistiques, CTA, Contact, Footer, Common, Sidebar, 
  Header
} from "../models/landing.model";

interface StrapiResponse<T> {
  data: Array<{
    id: number;
    documentId?: string;
    attributes?: T;
    [key: string]: any;
  }>;
  meta?: any;
}

@Injectable({
    providedIn: 'root'
})
export class LandingService {
    private apiUrl = `${environment.apiUrl}`;
    
    constructor(private http: HttpClient) {}

    getNav(locale: string): Observable<Nav | null> {
        return this.http.get<StrapiResponse<Nav>>(
            `${this.apiUrl}/navs?locale=${locale}`
        ).pipe(
            map(res => {
                if (res.data.length > 0) {
                    return res.data[0].attributes || res.data[0] as any;
                }
                return null;
            })
        );
    }

    getHero(locale: string): Observable<Hero | null> {
        return this.http.get<StrapiResponse<Hero>>(
            `${this.apiUrl}/heroes?locale=${locale}&populate=*`
        ).pipe(
            map(res => {
                if (res.data.length > 0) {
                    return res.data[0].attributes || res.data[0] as any;
                }
                return null;
            })
        );
    }
    getHeader(locale: string): Observable<Header | null> {
        return this.http.get<StrapiResponse<Header>>(
            `${this.apiUrl}/headers?locale=${locale}&populate=*`
        ).pipe(
            map(res => {
                if (res.data.length > 0) {
                    return res.data[0].attributes || res.data[0] as any;
                }
                return null;
            })
        );
    }

    getServices(locale: string): Observable<Services | null> {
        return forkJoin({
            parent: this.http.get<StrapiResponse<Services>>(
                `${this.apiUrl}/services?locale=${locale}`
            ),
            items: this.http.get<StrapiResponse<ServiceItem>>(
                `${this.apiUrl}/service-items?locale=${locale}`
            )
        }).pipe(
            map(({ parent, items }) => {
                if (parent.data.length > 0) {
                    const service = parent.data[0].attributes || parent.data[0] as any;
                    // Attacher les items au service
                    const serviceItems = items.data.map(item => 
                        item.attributes ? { ...item.attributes, id: item.id, documentId: item.documentId } : item
                    );
                    return { ...service, items: serviceItems };
                }
                return null;
            })
        );
    }

    getBenefits(locale: string): Observable<Benefits | null> {
        return forkJoin({
            parent: this.http.get<StrapiResponse<Benefits>>(
                `${this.apiUrl}/benefits?locale=${locale}`
            ),
            items: this.http.get<StrapiResponse<BenefitItem>>(
                `${this.apiUrl}/benefit-items?locale=${locale}`
            )
        }).pipe(
            map(({ parent, items }) => {
                if (parent.data.length > 0) {
                    const benefit = parent.data[0].attributes || parent.data[0] as any;
                    // Attacher les items au benefit
                    const benefitItems = items.data.map(item => 
                        item.attributes ? { ...item.attributes, id: item.id, documentId: item.documentId } : item
                    );
                    return { ...benefit, items: benefitItems };
                }
                return null;
            })
        );
    }

    getStats(locale: string): Observable<Statistiques | null> {
        return this.http.get<StrapiResponse<Statistiques>>(
            `${this.apiUrl}/statistiques?locale=${locale}`
        ).pipe(
            map(res => {
                if (res.data.length > 0) {
                    return res.data[0].attributes || res.data[0] as any;
                }
                return null;
            })
        );
    }

    getCTA(locale: string): Observable<CTA | null> {
        return this.http.get<StrapiResponse<CTA>>(
            `${this.apiUrl}/ctas?locale=${locale}`
        ).pipe(
            map(res => {
                if (res.data.length > 0) {
                    return res.data[0].attributes || res.data[0] as any;
                }
                return null;
            })
        );
    }
    getContact(locale: string): Observable<Contact | null> {
        return this.http.get<any>(
            `${this.apiUrl}/contact?locale=${locale}&populate=*`
        ).pipe(
            map(res => {
            console.log('Contact response:', res);
            
            if (!res || !res.data) return null;

            // Pour Strapi v4 : data.attributes
            const data = res.data.attributes ? res.data.attributes : res.data;

            // Vérifier la locale renvoyée
            if (data.locale !== locale) {
                console.warn(` Locale demandée (${locale}) différente de celle renvoyée (${data.locale})`);
            }

            return data;
            })
        );
    }


    getFooter(locale: string): Observable<Footer | null> {
        return this.http.get<StrapiResponse<Footer>>(
            `${this.apiUrl}/footers?locale=${locale}`
        ).pipe(
            map(res => {
                if (res.data.length > 0) {
                    return res.data[0].attributes || res.data[0] as any;
                }
                return null;
            })
        );
    }

    getCommon(locale: string): Observable<Common | null> {
        return this.http.get<StrapiResponse<Common>>(
            `${this.apiUrl}/commons?locale=${locale}`
        ).pipe(
            map(res => {
                if (res.data.length > 0) {
                    return res.data[0].attributes || res.data[0] as any;
                }
                return null;
            })
        );
    }

}