import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  DebtCase, 
  CaseStatus, 
  Priority, 
  PartnerUpdate, 
  CessionContract,
  ActivityType,
  CaseActivity,
  DocumentType
} from '../models/case.model';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private mockCededCases: DebtCase[] = [];
  private mockPartnerUpdates: PartnerUpdate[] = [];
  private mockCessionContracts: CessionContract[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Simulation de dossiers cédés
    this.mockCededCases = [
      {
        id: 'partner-case-1',
        caseNumber: 'REC-P-2024-001',
        debtor: {
          firstName: 'Michel',
          lastName: 'Bernard',
          email: 'michel.bernard@email.com',
          phone: '+33 1 23 45 67 88',
          type: 'individual',
          address: {
            street: '15 Rue des Lilas',
            city: 'Lyon',
            postalCode: '69000',
            country: 'France'
          }
        },
        creditor: {
          name: 'TechCorp Solutions',
          contactPerson: 'Thomas Moreau',
          email: 'thomas.moreau@techcorp.fr',
          phone: '+33 1 23 45 67 93',
          address: {
            street: '789 Rue de l\'Innovation',
            city: 'Marseille',
            postalCode: '13000',
            country: 'France'
          }
        },
        amount: 5000,
        amountPaid: 1500,
        debtBreakdown: {
          principalAmount: 4000,
          interests: [
            {
              id: '1',
              type: 'legal',
              rate: 3.15,
              startDate: new Date('2024-01-15'),
              amount: 300,
              description: 'Intérêts légaux'
            },
            {
              id: '2',
              type: 'delay',
              rate: 10,
              startDate: new Date('2024-02-15'),
              amount: 200,
              description: 'Intérêts de retard'
            }
          ],
          penalties: [
            {
              id: '1',
              type: 'late_payment',
              amount: 200,
              appliedDate: new Date('2024-02-15'),
              description: 'Pénalité de retard de paiement'
            },
            {
              id: '2',
              type: 'administrative',
              amount: 100,
              appliedDate: new Date('2024-02-20'),
              description: 'Frais administratifs'
            }
          ],
          fees: [
            {
              id: '1',
              type: 'collection',
              amount: 150,
              appliedDate: new Date('2024-01-20'),
              description: 'Frais de recouvrement'
            },
            {
              id: '2',
              type: 'legal',
              amount: 50,
              appliedDate: new Date('2024-01-25'),
              description: 'Frais juridiques'
            }
          ],
          totalInterests: 500,
          totalPenalties: 300,
          totalFees: 200,
          totalAmount: 5000
        },
        status: CaseStatus.ACTIVE,
        priority: Priority.HIGH,
        createdAt: new Date('2024-01-15'),
        dueDate: new Date('2024-03-15'),
        partnerCommission: 25,
        cededBy: '5',
        cededAt: new Date('2024-01-20'),
        documents: [
          {
            id: '1',
            name: 'Contrat de service TechCorp.pdf',
            type: DocumentType.CONTRACT,
            url: '#',
            uploadedAt: new Date('2024-01-15'),
            uploadedBy: 'Thomas Moreau'
          },
          {
            id: '2',
            name: 'Facture impayée F-2024-001.pdf',
            type: DocumentType.INVOICE,
            url: '#',
            uploadedAt: new Date('2024-01-16'),
            uploadedBy: 'Thomas Moreau'
          },
          {
            id: '3',
            name: 'Correspondance client.pdf',
            type: DocumentType.CORRESPONDENCE,
            url: '#',
            uploadedAt: new Date('2024-01-18'),
            uploadedBy: 'Thomas Moreau'
          }
        ],
        history: [
          {
            id: '1',
            type: ActivityType.CASE_CEDED,
            description: 'Dossier cédé au partenaire Recouvrement Solutions',
            date: new Date('2024-01-20'),
            userId: '5',
            userName: 'Thomas Moreau'
          },
          {
            id: '2',
            type: ActivityType.PAYMENT_RECEIVED,
            description: 'Paiement partiel reçu de 1500€',
            date: new Date('2024-01-25'),
            userId: '6',
            userName: 'Laurent Rousseau'
          },
          {
            id: '3',
            type: ActivityType.PARTNER_UPDATE,
            description: 'Contact établi avec le débiteur, négociation en cours',
            date: new Date('2024-01-23'),
            userId: '6',
            userName: 'Laurent Rousseau'
          }
        ]
      },
      {
        id: 'partner-case-2',
        caseNumber: 'REC-P-2024-002',
        debtor: {
          firstName: 'Claire',
          lastName: 'Dubois',
          email: 'claire.dubois@email.com',
          phone: '+33 1 23 45 67 87',
          type: 'individual',
          address: {
            street: '42 Avenue des Champs',
            city: 'Nice',
            postalCode: '06000',
            country: 'France'
          }
        },
        creditor: {
          name: 'ABC Services',
          contactPerson: 'Sophie Lambert',
          email: 'sophie.lambert@abc-services.fr',
          phone: '+33 1 23 45 67 92',
          address: {
            street: '456 Avenue des Affaires',
            city: 'Lyon',
            postalCode: '69000',
            country: 'France'
          }
        },
        amount: 3200,
        amountPaid: 800,
        debtBreakdown: {
          principalAmount: 2800,
          interests: [
            {
              id: '3',
              type: 'contractual',
              rate: 8,
              startDate: new Date('2024-01-10'),
              amount: 150,
              description: 'Intérêts contractuels'
            }
          ],
          penalties: [
            {
              id: '3',
              type: 'late_payment',
              amount: 100,
              appliedDate: new Date('2024-02-10'),
              description: 'Pénalité de retard'
            }
          ],
          fees: [
            {
              id: '3',
              type: 'administrative',
              amount: 50,
              appliedDate: new Date('2024-01-18'),
              description: 'Frais de dossier'
            }
          ],
          totalInterests: 200,
          totalPenalties: 150,
          totalFees: 50,
          totalAmount: 3200
        },
        status: CaseStatus.NEGOTIATION,
        priority: Priority.MEDIUM,
        createdAt: new Date('2024-01-10'),
        dueDate: new Date('2024-03-10'),
        partnerCommission: 30,
        cededBy: '4',
        cededAt: new Date('2024-01-18'),
        documents: [
          {
            id: '4',
            name: 'Contrat ABC Services.pdf',
            type: DocumentType.CONTRACT,
            url: '#',
            uploadedAt: new Date('2024-01-10'),
            uploadedBy: 'Sophie Lambert'
          },
          {
            id: '5',
            name: 'Mise en demeure préalable.pdf',
            type: DocumentType.LEGAL_NOTICE,
            url: '#',
            uploadedAt: new Date('2024-01-12'),
            uploadedBy: 'Sophie Lambert'
          }
        ],
        history: [
          {
            id: '2',
            type: ActivityType.CASE_CEDED,
            description: 'Dossier cédé au partenaire Recouvrement Solutions',
            date: new Date('2024-01-18'),
            userId: '4',
            userName: 'Sophie Lambert'
          },
          {
            id: '4',
            type: ActivityType.STATUS_CHANGED,
            description: 'Statut modifié vers "Négociation" par le partenaire',
            date: new Date('2024-01-22'),
            userId: '6',
            userName: 'Laurent Rousseau'
          },
          {
            id: '5',
            type: ActivityType.PAYMENT_RECEIVED,
            description: 'Paiement partiel reçu de 800€',
            date: new Date('2024-01-24'),
            userId: '6',
            userName: 'Laurent Rousseau'
          }
        ]
      }
    ];

    // Simulation de mises à jour partenaire
    this.mockPartnerUpdates = [
      {
        id: '1',
        caseId: 'partner-case-1',
        partnerId: '6',
        partnerName: 'Laurent Rousseau',
        updateType: 'payment_received',
        description: 'Paiement partiel reçu de 1500€',
        amount: 1500,
        createdAt: new Date('2024-01-25')
      },
      {
        id: '2',
        caseId: 'partner-case-2',
        partnerId: '6',
        partnerName: 'Laurent Rousseau',
        updateType: 'status_change',
        description: 'Dossier passé en négociation suite à contact avec le débiteur',
        newStatus: CaseStatus.NEGOTIATION,
        createdAt: new Date('2024-01-22')
      }
    ];

    // Simulation de contrats de cession
    this.mockCessionContracts = [
      {
        id: '1',
        caseId: 'partner-case-1',
        partnerId: '6',
        partnerName: 'Recouvrement Solutions',
        cededBy: '5',
        cededAt: new Date('2024-01-20'),
        commission: 25,
        terms: 'Commission de 25% sur les montants recouvrés',
        status: 'active'
      },
      {
        id: '2',
        caseId: 'partner-case-2',
        partnerId: '6',
        partnerName: 'Recouvrement Solutions',
        cededBy: '4',
        cededAt: new Date('2024-01-18'),
        commission: 30,
        terms: 'Commission de 30% sur les montants recouvrés',
        status: 'active'
      }
    ];
  }

  // Méthodes pour les partenaires
  getAssignedCases(partnerId: string): Observable<DebtCase[]> {
    // Les partenaires peuvent accéder à tous les dossiers cédés
    return of(this.mockCededCases).pipe(delay(300));
  }

  updateCaseStatus(caseId: string, newStatus: CaseStatus, description: string): Observable<DebtCase> {
    const caseIndex = this.mockCededCases.findIndex(c => c.id === caseId);
    if (caseIndex === -1) {
      return throwError(() => new Error('Dossier non trouvé'));
    }

    const case_ = this.mockCededCases[caseIndex];
    case_.status = newStatus;
    
    // Ajouter à l'historique
    const activity: CaseActivity = {
      id: Date.now().toString(),
      type: ActivityType.STATUS_CHANGED,
      description: `Statut modifié vers "${newStatus}" - ${description}`,
      date: new Date(),
      userId: case_.assignedPartner!,
      userName: 'Partenaire de recouvrement'
    };
    case_.history.push(activity);

    return of(case_).pipe(delay(300));
  }

  recordPayment(caseId: string, amount: number, description: string): Observable<DebtCase> {
    const caseIndex = this.mockCededCases.findIndex(c => c.id === caseId);
    if (caseIndex === -1) {
      return throwError(() => new Error('Dossier non trouvé'));
    }

    const case_ = this.mockCededCases[caseIndex];
    case_.amountPaid += amount;
    
    // Ajouter à l'historique
    const activity: CaseActivity = {
      id: Date.now().toString(),
      type: ActivityType.PAYMENT_RECEIVED,
      description: `Paiement reçu de ${amount}€ - ${description}`,
      date: new Date(),
      userId: case_.assignedPartner!,
      userName: 'Partenaire de recouvrement'
    };
    case_.history.push(activity);

    // Créer une mise à jour partenaire
    const update: PartnerUpdate = {
      id: Date.now().toString(),
      caseId,
      partnerId: case_.assignedPartner!,
      partnerName: 'Recouvrement Solutions',
      updateType: 'payment_received',
      description: `Paiement reçu de ${amount}€`,
      amount,
      createdAt: new Date()
    };
    this.mockPartnerUpdates.push(update);

    return of(case_).pipe(delay(300));
  }

  addPartnerNote(caseId: string, content: string, type: 'action_taken' | 'note_added'): Observable<boolean> {
    const case_ = this.mockCededCases.find(c => c.id === caseId);
    if (!case_) {
      return throwError(() => new Error('Dossier non trouvé'));
    }

    // Ajouter à l'historique
    const activity: CaseActivity = {
      id: Date.now().toString(),
      type: ActivityType.PARTNER_UPDATE,
      description: content,
      date: new Date(),
      userId: case_.assignedPartner!,
      userName: 'Partenaire de recouvrement'
    };
    case_.history.push(activity);

    // Créer une mise à jour partenaire
    const update: PartnerUpdate = {
      id: Date.now().toString(),
      caseId,
      partnerId: case_.assignedPartner!,
      partnerName: 'Recouvrement Solutions',
      updateType: type,
      description: content,
      createdAt: new Date()
    };
    this.mockPartnerUpdates.push(update);

    return of(true).pipe(delay(300));
  }

  // Méthodes pour les cédants (voir les mises à jour)
  getCededCases(cedantId: string): Observable<DebtCase[]> {
    const cededCases = this.mockCededCases.filter(c => c.cededBy === cedantId);
    return of(cededCases).pipe(delay(300));
  }

  getPartnerUpdates(caseId?: string): Observable<PartnerUpdate[]> {
    let updates = this.mockPartnerUpdates;
    if (caseId) {
      updates = updates.filter(u => u.caseId === caseId);
    }
    return of(updates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())).pipe(delay(200));
  }

  getCessionContracts(cedantId: string): Observable<CessionContract[]> {
    const contracts = this.mockCessionContracts.filter(c => c.cededBy === cedantId);
    return of(contracts).pipe(delay(200));
  }

  cedeCase(caseId: string, partnerId: string, commission: number, terms: string): Observable<CessionContract> {
    const case_ = this.mockCededCases.find(c => c.id === caseId);
    if (!case_) {
      return throwError(() => new Error('Dossier non trouvé'));
    }

    // Créer le contrat de cession
    const contract: CessionContract = {
      id: Date.now().toString(),
      caseId,
      partnerId,
      partnerName: 'Recouvrement Solutions',
      cededBy: case_.cededBy || '',
      cededAt: new Date(),
      commission,
      terms,
      status: 'active'
    };

    this.mockCessionContracts.push(contract);

    // Mettre à jour le dossier
    case_.partnerCommission = commission;
    case_.cededAt = new Date();

    return of(contract).pipe(delay(500));
  }

  getPartnerStatistics(partnerId: string): Observable<any> {
    // Statistiques basées sur tous les dossiers cédés accessibles
    const assignedCases = this.mockCededCases;
    const totalRecovered = assignedCases.reduce((sum, c) => sum + c.amountPaid, 0);
    const totalCommission = assignedCases.reduce((sum, c) => sum + (c.amountPaid * (c.partnerCommission || 0) / 100), 0);

    const stats = {
      totalCases: assignedCases.length,
      activeCases: assignedCases.filter(c => c.status === CaseStatus.ACTIVE || c.status === CaseStatus.NEGOTIATION).length,
      completedCases: assignedCases.filter(c => c.status === CaseStatus.COMPLETED).length,
      totalRecovered,
      totalCommission,
      averageRecoveryRate: assignedCases.length > 0 ? 
        Math.round((assignedCases.reduce((sum, c) => sum + (c.amountPaid / c.amount), 0) / assignedCases.length) * 100) : 0
    };

    return of(stats).pipe(delay(200));
  }

  getCedantStatistics(cedantId: string): Observable<any> {
    const cededCases = this.mockCededCases.filter(c => c.cededBy === cedantId);
    const totalCeded = cededCases.reduce((sum, c) => sum + c.amount, 0);
    const totalRecovered = cededCases.reduce((sum, c) => sum + c.amountPaid, 0);
    const totalCommissionPaid = cededCases.reduce((sum, c) => sum + (c.amountPaid * (c.partnerCommission || 0) / 100), 0);

    const stats = {
      totalCededCases: cededCases.length,
      activeCededCases: cededCases.filter(c => c.status === CaseStatus.ACTIVE || c.status === CaseStatus.NEGOTIATION).length,
      totalCededAmount: totalCeded,
      totalRecoveredAmount: totalRecovered,
      totalCommissionPaid,
      netRecovered: totalRecovered - totalCommissionPaid,
      recoveryRate: totalCeded > 0 ? Math.round((totalRecovered / totalCeded) * 100) : 0
    };

    return of(stats).pipe(delay(200));
  }
}