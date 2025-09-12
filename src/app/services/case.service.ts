import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DebtCase, CaseStatus, Priority, DocumentType, ActivityType, PaymentProposal, CaseNote, CaseFilter, CaseDocument } from '../models/case.model';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private casesSubject = new BehaviorSubject<DebtCase[]>([]);
  public cases$ = this.casesSubject.asObservable();

  private mockCases: DebtCase[] = [
    // Dossiers pour le débiteur Jean Dupont (debiteur@example.com)
    {
      id: '1',
      caseNumber: 'REC2024-001',
      debtor: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.com',
        phone: '+33 1 23 45 67 89',
        address: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        type: 'individual'
      },
      creditor: {
        name: 'ABC Services',
        contactPerson: 'Sophie Lambert',
        email: 'contact@abc-services.fr',
        phone: '+33 1 23 45 67 88',
        address: {
          street: '456 Avenue des Affaires',
          city: 'Lyon',
          postalCode: '69000',
          country: 'France'
        }
      },
      amount: 5000,
      amountPaid: 1500,
      debtBreakdown: {
        principalAmount: 4200,
        interests: [
          {
            id: '1',
            type: 'legal',
            rate: 3.15,
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-03-15'),
            amount: 420,
            description: 'Intérêts légaux (3,15% par an)'
          },
          {
            id: '2',
            type: 'delay',
            rate: 10,
            startDate: new Date('2024-02-15'),
            amount: 280,
            description: 'Intérêts de retard (10% par an)'
          }
        ],
        penalties: [
          {
            id: '1',
            type: 'late_payment',
            amount: 50,
            appliedDate: new Date('2024-02-15'),
            description: 'Pénalité de retard forfaitaire'
          }
        ],
        fees: [
          {
            id: '1',
            type: 'collection',
            amount: 50,
            appliedDate: new Date('2024-02-01'),
            description: 'Frais de recouvrement'
          }
        ],
        totalInterests: 700,
        totalPenalties: 50,
        totalFees: 50,
        totalAmount: 5000
      },
      status: CaseStatus.ACTIVE,
      priority: Priority.HIGH,
      createdAt: new Date('2024-01-15'),
      dueDate: new Date('2024-03-15'),
      assignedBailiff: '2',
      documents: [
        {
          id: '1',
          name: 'Facture impayée.pdf',
          type: DocumentType.INVOICE,
          url: '#',
          uploadedAt: new Date('2024-01-15'),
          uploadedBy: 'Sophie Lambert'
        }
      ],
      history: [
        {
          id: '1',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2024-01-15'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '2',
          type: ActivityType.REMINDER_SENT,
          description: 'Première relance envoyée par email',
          date: new Date('2024-01-25'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '3',
          type: ActivityType.REMINDER_SENT,
          description: 'Relance téléphonique effectuée',
          date: new Date('2024-02-05'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '4',
          type: ActivityType.FORMAL_NOTICE_SENT,
          description: 'Mise en demeure envoyée par courrier recommandé',
          date: new Date('2024-02-15'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '5',
          type: ActivityType.REMINDER_SENT,
          description: 'Relance par SMS - Rappel échéance proche',
          date: new Date('2024-02-25'),
          userId: '2',
          userName: 'Marie Martin'
        }
      ]
    },
    {
      id: '3',
      caseNumber: 'REC2024-003',
      debtor: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.com',
        phone: '+33 1 23 45 67 89',
        address: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        type: 'individual'
      },
      creditor: {
        name: 'TechCorp Solutions',
        contactPerson: 'Alice Martin',
        email: 'alice@techcorp.fr',
        phone: '+33 1 23 45 67 85',
        address: {
          street: '789 Avenue Innovation',
          city: 'Toulouse',
          postalCode: '31000',
          country: 'France'
        }
      },
      amount: 2500,
      amountPaid: 2500,
      debtBreakdown: {
        principalAmount: 2200,
        interests: [
          {
            id: '5',
            type: 'legal',
            rate: 3.15,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-02-15'),
            amount: 250,
            description: 'Intérêts légaux (3,15% par an)'
          }
        ],
        penalties: [
          {
            id: '3',
            type: 'late_payment',
            amount: 30,
            appliedDate: new Date('2024-01-15'),
            description: 'Pénalité de retard forfaitaire'
          }
        ],
        fees: [
          {
            id: '3',
            type: 'collection',
            amount: 20,
            appliedDate: new Date('2024-01-10'),
            description: 'Frais de recouvrement'
          }
        ],
        totalInterests: 250,
        totalPenalties: 30,
        totalFees: 20,
        totalAmount: 2500
      },
      status: CaseStatus.COMPLETED,
      priority: Priority.LOW,
      createdAt: new Date('2024-01-01'),
      dueDate: new Date('2024-02-15'),
      assignedBailiff: '2',
      documents: [
        {
          id: '3',
          name: 'Contrat de service.pdf',
          type: DocumentType.CONTRACT,
          url: '#',
          uploadedAt: new Date('2024-01-01'),
          uploadedBy: 'Alice Martin'
        },
        {
          id: '4',
          name: 'Preuve de paiement.pdf',
          type: DocumentType.PAYMENT_PROOF,
          url: '#',
          uploadedAt: new Date('2024-02-15'),
          uploadedBy: 'Jean Dupont'
        }
      ],
      history: [
        {
          id: '7',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2024-01-01'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '8',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Paiement complet reçu - 2500€',
          date: new Date('2024-02-15'),
          userId: '1',
          userName: 'Jean Dupont'
        }
      ]
    },
    {
      id: '4',
      caseNumber: 'REC2024-004',
      debtor: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.com',
        phone: '+33 1 23 45 67 89',
        address: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        type: 'individual'
      },
      creditor: {
        name: 'Services Plus',
        contactPerson: 'Thomas Leroy',
        email: 'thomas@servicesplus.fr',
        phone: '+33 1 23 45 67 84',
        address: {
          street: '321 Rue du Commerce',
          city: 'Bordeaux',
          postalCode: '33000',
          country: 'France'
        }
      },
      amount: 1800,
      amountPaid: 600,
      debtBreakdown: {
        principalAmount: 1500,
        interests: [
          {
            id: '6',
            type: 'delay',
            rate: 8,
            startDate: new Date('2024-02-01'),
            amount: 240,
            description: 'Intérêts de retard (8% par an)'
          }
        ],
        penalties: [
          {
            id: '4',
            type: 'late_payment',
            amount: 40,
            appliedDate: new Date('2024-02-15'),
            description: 'Pénalité de retard forfaitaire'
          }
        ],
        fees: [
          {
            id: '4',
            type: 'collection',
            amount: 20,
            appliedDate: new Date('2024-02-10'),
            description: 'Frais de recouvrement'
          }
        ],
        totalInterests: 240,
        totalPenalties: 40,
        totalFees: 20,
        totalAmount: 1800
      },
      status: CaseStatus.PAYMENT_PLAN,
      priority: Priority.MEDIUM,
      createdAt: new Date('2024-02-01'),
      dueDate: new Date('2024-04-01'),
      assignedBailiff: '2',
      documents: [
        {
          id: '5',
          name: 'Facture services.pdf',
          type: DocumentType.INVOICE,
          url: '#',
          uploadedAt: new Date('2024-02-01'),
          uploadedBy: 'Thomas Leroy'
        }
      ],
      paymentPlan: {
        id: '1',
        totalAmount: 1200,
        monthlyAmount: 200,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-08-01'),
        installments: [
          {
            id: '1',
            amount: 200,
            dueDate: new Date('2024-03-01'),
            paidDate: new Date('2024-03-01'),
            status: 'paid'
          },
          {
            id: '2',
            amount: 200,
            dueDate: new Date('2024-04-01'),
            paidDate: new Date('2024-04-01'),
            status: 'paid'
          },
          {
            id: '3',
            amount: 200,
            dueDate: new Date('2024-05-01'),
            paidDate: new Date('2024-05-01'),
            status: 'paid'
          },
          {
            id: '4',
            amount: 200,
            dueDate: new Date('2024-06-01'),
            status: 'pending'
          },
          {
            id: '5',
            amount: 200,
            dueDate: new Date('2024-07-01'),
            status: 'pending'
          },
          {
            id: '6',
            amount: 200,
            dueDate: new Date('2024-08-01'),
            status: 'pending'
          }
        ]
      },
      history: [
        {
          id: '9',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2024-02-01'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '10',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Premier paiement reçu - 200€',
          date: new Date('2024-03-01'),
          userId: '1',
          userName: 'Jean Dupont'
        },
        {
          id: '11',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Deuxième paiement reçu - 200€',
          date: new Date('2024-04-01'),
          userId: '1',
          userName: 'Jean Dupont'
        },
        {
          id: '12',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Troisième paiement reçu - 200€',
          date: new Date('2024-05-01'),
          userId: '1',
          userName: 'Jean Dupont'
        }
      ]
    },
    {
      id: '5',
      caseNumber: 'REC2024-005',
      debtor: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.com',
        phone: '+33 1 23 45 67 89',
        address: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        type: 'individual'
      },
      creditor: {
        name: 'Consulting Pro',
        contactPerson: 'Isabelle Moreau',
        email: 'isabelle@consultingpro.fr',
        phone: '+33 1 23 45 67 83',
        address: {
          street: '654 Boulevard Expert',
          city: 'Lille',
          postalCode: '59000',
          country: 'France'
        }
      },
      amount: 8500,
      amountPaid: 0,
      debtBreakdown: {
        principalAmount: 7500,
        interests: [
          {
            id: '7',
            type: 'contractual',
            rate: 15,
            startDate: new Date('2024-01-15'),
            amount: 800,
            description: 'Intérêts contractuels (15% par an)'
          }
        ],
        penalties: [
          {
            id: '5',
            type: 'breach',
            amount: 150,
            appliedDate: new Date('2024-02-01'),
            description: 'Pénalité pour rupture de contrat'
          }
        ],
        fees: [
          {
            id: '5',
            type: 'legal',
            amount: 50,
            appliedDate: new Date('2024-02-15'),
            description: 'Frais de mise en demeure'
          }
        ],
        totalInterests: 800,
        totalPenalties: 150,
        totalFees: 50,
        totalAmount: 8500
      },
      status: CaseStatus.LEGAL_ACTION,
      priority: Priority.URGENT,
      createdAt: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      assignedBailiff: '2',
      assignedLawyer: '3',
      documents: [
        {
          id: '6',
          name: 'Contrat consulting.pdf',
          type: DocumentType.CONTRACT,
          url: '#',
          uploadedAt: new Date('2024-01-15'),
          uploadedBy: 'Isabelle Moreau'
        },
        {
          id: '7',
          name: 'Mise en demeure.pdf',
          type: DocumentType.LEGAL_NOTICE,
          url: '#',
          uploadedAt: new Date('2024-02-15'),
          uploadedBy: 'Marie Martin'
        },
        {
          id: '8',
          name: 'Assignation tribunal.pdf',
          type: DocumentType.COURT_DOCUMENT,
          url: '#',
          uploadedAt: new Date('2024-03-01'),
          uploadedBy: 'Pierre Durand'
        }
      ],
      history: [
        {
          id: '13',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2024-01-15'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '14',
          type: ActivityType.FORMAL_NOTICE_SENT,
          description: 'Mise en demeure envoyée',
          date: new Date('2024-02-15'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '15',
          type: ActivityType.LEGAL_ACTION_INITIATED,
          description: 'Procédure judiciaire engagée',
          date: new Date('2024-03-01'),
          userId: '3',
          userName: 'Pierre Durand'
        }
      ]
    },
    {
      id: '6',
      caseNumber: 'REC2024-006',
      debtor: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.com',
        phone: '+33 1 23 45 67 89',
        address: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        type: 'individual'
      },
      creditor: {
        name: 'Électricité Moderne',
        contactPerson: 'François Petit',
        email: 'francois@elecmoderne.fr',
        phone: '+33 1 23 45 67 82',
        address: {
          street: '147 Avenue Électrique',
          city: 'Nantes',
          postalCode: '44000',
          country: 'France'
        }
      },
      amount: 950,
      amountPaid: 300,
      debtBreakdown: {
        principalAmount: 800,
        interests: [
          {
            id: '8',
            type: 'legal',
            rate: 3.15,
            startDate: new Date('2024-02-15'),
            amount: 120,
            description: 'Intérêts légaux (3,15% par an)'
          }
        ],
        penalties: [
          {
            id: '6',
            type: 'late_payment',
            amount: 20,
            appliedDate: new Date('2024-03-01'),
            description: 'Pénalité de retard forfaitaire'
          }
        ],
        fees: [
          {
            id: '6',
            type: 'collection',
            amount: 10,
            appliedDate: new Date('2024-02-20'),
            description: 'Frais de recouvrement'
          }
        ],
        totalInterests: 120,
        totalPenalties: 20,
        totalFees: 10,
        totalAmount: 950
      },
      status: CaseStatus.NEGOTIATION,
      priority: Priority.MEDIUM,
      createdAt: new Date('2024-02-15'),
      dueDate: new Date('2024-03-15'),
      assignedBailiff: '2',
      documents: [
        {
          id: '9',
          name: 'Facture électricité.pdf',
          type: DocumentType.INVOICE,
          url: '#',
          uploadedAt: new Date('2024-02-15'),
          uploadedBy: 'François Petit'
        }
      ],
      history: [
        {
          id: '16',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2024-02-15'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '17',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Paiement partiel reçu - 300€',
          date: new Date('2024-03-10'),
          userId: '1',
          userName: 'Jean Dupont'
        },
        {
          id: '18',
          type: ActivityType.STATUS_CHANGED,
          description: 'Statut modifié vers "Négociation"',
          date: new Date('2024-03-12'),
          userId: '2',
          userName: 'Marie Martin'
        }
      ]
    },
    // Dossiers pour l'huissier Marie Martin (assignedBailiff: '2')
    {
      id: '2',
      caseNumber: 'REC2024-002',
      debtor: {
        firstName: 'Paul',
        lastName: 'Bernard',
        companyName: 'Bernard SARL',
        email: 'paul.bernard@bernard-sarl.fr',
        phone: '+33 1 23 45 67 90',
        address: {
          street: '789 Rue du Commerce',
          city: 'Marseille',
          postalCode: '13000',
          country: 'France'
        },
        type: 'company'
      },
      creditor: {
        name: 'XYZ Consulting',
        contactPerson: 'Marc Durand',
        email: 'marc@xyz-consulting.fr',
        phone: '+33 1 23 45 67 87',
        address: {
          street: '321 Boulevard de la Tech',
          city: 'Nice',
          postalCode: '06000',
          country: 'France'
        }
      },
      amount: 12000,
      amountPaid: 0,
      debtBreakdown: {
        principalAmount: 10000,
        interests: [
          {
            id: '3',
            type: 'contractual',
            rate: 12,
            startDate: new Date('2024-02-01'),
            amount: 1500,
            description: 'Intérêts contractuels (12% par an)'
          }
        ],
        penalties: [
          {
            id: '2',
            type: 'breach',
            amount: 300,
            appliedDate: new Date('2024-02-15'),
            description: 'Pénalité pour rupture de contrat'
          }
        ],
        fees: [
          {
            id: '2',
            type: 'legal',
            amount: 200,
            appliedDate: new Date('2024-02-10'),
            description: 'Frais de mise en demeure'
          }
        ],
        totalInterests: 1500,
        totalPenalties: 300,
        totalFees: 200,
        totalAmount: 12000
      },
      status: CaseStatus.PENDING,
      priority: Priority.MEDIUM,
      createdAt: new Date('2024-02-01'),
      dueDate: new Date('2024-04-01'),
      documents: [],
      history: [
        {
          id: '2',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier en attente d\'assignation',
          date: new Date('2024-02-01'),
          userId: '3',
          userName: 'Pierre Durand'
        },
        {
          id: '6',
          type: ActivityType.REMINDER_SENT,
          description: 'Première relance par courrier simple',
          date: new Date('2024-02-10'),
          userId: '3',
          userName: 'Pierre Durand'
        }
      ]
    },
    {
      id: '7',
      caseNumber: 'REC2024-007',
      debtor: {
        firstName: 'Claire',
        lastName: 'Rousseau',
        companyName: 'Rousseau Design',
        email: 'claire@rousseaudesign.fr',
        phone: '+33 1 23 45 67 95',
        address: {
          street: '258 Rue Créative',
          city: 'Lyon',
          postalCode: '69002',
          country: 'France'
        },
        type: 'company'
      },
      creditor: {
        name: 'Matériaux Pro',
        contactPerson: 'Vincent Dubois',
        email: 'vincent@materiauxpro.fr',
        phone: '+33 1 23 45 67 81',
        address: {
          street: '963 Zone Industrielle',
          city: 'Lyon',
          postalCode: '69003',
          country: 'France'
        }
      },
      amount: 15000,
      amountPaid: 5000,
      debtBreakdown: {
        principalAmount: 13000,
        interests: [
          {
            id: '9',
            type: 'contractual',
            rate: 10,
            startDate: new Date('2024-01-01'),
            amount: 1500,
            description: 'Intérêts contractuels (10% par an)'
          }
        ],
        penalties: [
          {
            id: '7',
            type: 'breach',
            amount: 400,
            appliedDate: new Date('2024-02-01'),
            description: 'Pénalité pour rupture de contrat'
          }
        ],
        fees: [
          {
            id: '7',
            type: 'legal',
            amount: 100,
            appliedDate: new Date('2024-02-15'),
            description: 'Frais de mise en demeure'
          }
        ],
        totalInterests: 1500,
        totalPenalties: 400,
        totalFees: 100,
        totalAmount: 15000
      },
      status: CaseStatus.ACTIVE,
      priority: Priority.HIGH,
      createdAt: new Date('2024-01-01'),
      dueDate: new Date('2024-03-01'),
      assignedBailiff: '2',
      documents: [
        {
          id: '10',
          name: 'Bon de commande matériaux.pdf',
          type: DocumentType.CONTRACT,
          url: '#',
          uploadedAt: new Date('2024-01-01'),
          uploadedBy: 'Vincent Dubois'
        },
        {
          id: '11',
          name: 'Correspondance client.pdf',
          type: DocumentType.CORRESPONDENCE,
          url: '#',
          uploadedAt: new Date('2024-02-10'),
          uploadedBy: 'Marie Martin'
        }
      ],
      history: [
        {
          id: '19',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2024-01-01'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '20',
          type: ActivityType.REMINDER_SENT,
          description: 'Première relance par email',
          date: new Date('2024-01-20'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '21',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Paiement partiel reçu - 5000€',
          date: new Date('2024-02-15'),
          userId: '7',
          userName: 'Claire Rousseau'
        },
        {
          id: '22',
          type: ActivityType.FORMAL_NOTICE_SENT,
          description: 'Mise en demeure envoyée',
          date: new Date('2024-03-01'),
          userId: '2',
          userName: 'Marie Martin'
        }
      ]
    },
    {
      id: '8',
      caseNumber: 'REC2024-008',
      debtor: {
        firstName: 'Michel',
        lastName: 'Lefevre',
        email: 'michel.lefevre@email.com',
        phone: '+33 1 23 45 67 96',
        address: {
          street: '741 Avenue République',
          city: 'Strasbourg',
          postalCode: '67000',
          country: 'France'
        },
        type: 'individual'
      },
      creditor: {
        name: 'Assurance Santé Plus',
        contactPerson: 'Nathalie Blanc',
        email: 'nathalie@assurancesante.fr',
        phone: '+33 1 23 45 67 80',
        address: {
          street: '852 Rue Assurance',
          city: 'Strasbourg',
          postalCode: '67001',
          country: 'France'
        }
      },
      amount: 3200,
      amountPaid: 3200,
      debtBreakdown: {
        principalAmount: 3000,
        interests: [
          {
            id: '10',
            type: 'legal',
            rate: 3.15,
            startDate: new Date('2023-12-01'),
            endDate: new Date('2024-01-15'),
            amount: 150,
            description: 'Intérêts légaux (3,15% par an)'
          }
        ],
        penalties: [
          {
            id: '8',
            type: 'administrative',
            amount: 30,
            appliedDate: new Date('2024-01-01'),
            description: 'Pénalité administrative'
          }
        ],
        fees: [
          {
            id: '8',
            type: 'collection',
            amount: 20,
            appliedDate: new Date('2024-01-05'),
            description: 'Frais de recouvrement'
          }
        ],
        totalInterests: 150,
        totalPenalties: 30,
        totalFees: 20,
        totalAmount: 3200
      },
      status: CaseStatus.COMPLETED,
      priority: Priority.LOW,
      createdAt: new Date('2023-12-01'),
      dueDate: new Date('2024-01-15'),
      assignedBailiff: '2',
      documents: [
        {
          id: '12',
          name: 'Police assurance.pdf',
          type: DocumentType.CONTRACT,
          url: '#',
          uploadedAt: new Date('2023-12-01'),
          uploadedBy: 'Nathalie Blanc'
        },
        {
          id: '13',
          name: 'Justificatif paiement.pdf',
          type: DocumentType.PAYMENT_PROOF,
          url: '#',
          uploadedAt: new Date('2024-01-15'),
          uploadedBy: 'Michel Lefevre'
        }
      ],
      history: [
        {
          id: '23',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2023-12-01'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '24',
          type: ActivityType.REMINDER_SENT,
          description: 'Relance par courrier',
          date: new Date('2023-12-15'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '25',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Paiement complet reçu - 3200€',
          date: new Date('2024-01-15'),
          userId: '8',
          userName: 'Michel Lefevre'
        }
      ]
    },
    // Dossiers pour l'avocat Pierre Durand (assignedLawyer: '3')
    {
      id: '9',
      caseNumber: 'REC2024-009',
      debtor: {
        firstName: 'Sylvie',
        lastName: 'Moreau',
        companyName: 'Moreau Consulting',
        email: 'sylvie@moreauconsulting.fr',
        phone: '+33 1 23 45 67 97',
        address: {
          street: '369 Boulevard Business',
          city: 'Montpellier',
          postalCode: '34000',
          country: 'France'
        },
        type: 'company'
      },
      creditor: {
        name: 'Formation Expert',
        contactPerson: 'Julien Roux',
        email: 'julien@formationexpert.fr',
        phone: '+33 1 23 45 67 79',
        address: {
          street: '159 Rue Formation',
          city: 'Montpellier',
          postalCode: '34001',
          country: 'France'
        }
      },
      amount: 25000,
      amountPaid: 8000,
      debtBreakdown: {
        principalAmount: 22000,
        interests: [
          {
            id: '11',
            type: 'contractual',
            rate: 12,
            startDate: new Date('2023-11-01'),
            amount: 2500,
            description: 'Intérêts contractuels (12% par an)'
          }
        ],
        penalties: [
          {
            id: '9',
            type: 'breach',
            amount: 400,
            appliedDate: new Date('2024-01-01'),
            description: 'Pénalité pour rupture de contrat'
          }
        ],
        fees: [
          {
            id: '9',
            type: 'legal',
            amount: 100,
            appliedDate: new Date('2024-01-15'),
            description: 'Frais juridiques'
          }
        ],
        totalInterests: 2500,
        totalPenalties: 400,
        totalFees: 100,
        totalAmount: 25000
      },
      status: CaseStatus.LEGAL_ACTION,
      priority: Priority.URGENT,
      createdAt: new Date('2023-11-01'),
      dueDate: new Date('2024-01-01'),
      assignedBailiff: '2',
      assignedLawyer: '3',
      documents: [
        {
          id: '14',
          name: 'Contrat formation.pdf',
          type: DocumentType.CONTRACT,
          url: '#',
          uploadedAt: new Date('2023-11-01'),
          uploadedBy: 'Julien Roux'
        },
        {
          id: '15',
          name: 'Expertise juridique.pdf',
          type: DocumentType.LEGAL_NOTICE,
          url: '#',
          uploadedAt: new Date('2024-01-15'),
          uploadedBy: 'Pierre Durand'
        }
      ],
      history: [
        {
          id: '26',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2023-11-01'),
          userId: '3',
          userName: 'Pierre Durand'
        },
        {
          id: '27',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Paiement partiel reçu - 8000€',
          date: new Date('2024-01-20'),
          userId: '9',
          userName: 'Sylvie Moreau'
        },
        {
          id: '28',
          type: ActivityType.LEGAL_ACTION_INITIATED,
          description: 'Procédure judiciaire engagée',
          date: new Date('2024-02-01'),
          userId: '3',
          userName: 'Pierre Durand'
        }
      ]
    },
    {
      id: '10',
      caseNumber: 'REC2024-010',
      debtor: {
        firstName: 'Antoine',
        lastName: 'Girard',
        email: 'antoine.girard@email.com',
        phone: '+33 1 23 45 67 98',
        address: {
          street: '147 Rue Liberté',
          city: 'Rennes',
          postalCode: '35000',
          country: 'France'
        },
        type: 'individual'
      },
      creditor: {
        name: 'Banque Régionale',
        contactPerson: 'Catherine Leroy',
        email: 'catherine@banqueregionale.fr',
        phone: '+33 1 23 45 67 78',
        address: {
          street: '753 Avenue Banque',
          city: 'Rennes',
          postalCode: '35001',
          country: 'France'
        }
      },
      amount: 45000,
      amountPaid: 0,
      debtBreakdown: {
        principalAmount: 40000,
        interests: [
          {
            id: '12',
            type: 'contractual',
            rate: 18,
            startDate: new Date('2023-10-01'),
            amount: 4200,
            description: 'Intérêts contractuels (18% par an)'
          }
        ],
        penalties: [
          {
            id: '10',
            type: 'breach',
            amount: 600,
            appliedDate: new Date('2024-01-01'),
            description: 'Pénalité pour défaut de paiement'
          }
        ],
        fees: [
          {
            id: '10',
            type: 'legal',
            amount: 200,
            appliedDate: new Date('2024-01-15'),
            description: 'Frais juridiques et de recouvrement'
          }
        ],
        totalInterests: 4200,
        totalPenalties: 600,
        totalFees: 200,
        totalAmount: 45000
      },
      status: CaseStatus.LEGAL_ACTION,
      priority: Priority.URGENT,
      createdAt: new Date('2023-10-01'),
      dueDate: new Date('2023-12-01'),
      assignedBailiff: '2',
      assignedLawyer: '3',
      documents: [
        {
          id: '16',
          name: 'Contrat de prêt.pdf',
          type: DocumentType.CONTRACT,
          url: '#',
          uploadedAt: new Date('2023-10-01'),
          uploadedBy: 'Catherine Leroy'
        },
        {
          id: '17',
          name: 'Assignation en justice.pdf',
          type: DocumentType.COURT_DOCUMENT,
          url: '#',
          uploadedAt: new Date('2024-02-01'),
          uploadedBy: 'Pierre Durand'
        }
      ],
      history: [
        {
          id: '29',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2023-10-01'),
          userId: '3',
          userName: 'Pierre Durand'
        },
        {
          id: '30',
          type: ActivityType.REMINDER_SENT,
          description: 'Relances multiples envoyées',
          date: new Date('2023-12-15'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '31',
          type: ActivityType.LEGAL_ACTION_INITIATED,
          description: 'Procédure judiciaire engagée',
          date: new Date('2024-02-01'),
          userId: '3',
          userName: 'Pierre Durand'
        }
      ]
    },
    {
      id: '11',
      caseNumber: 'REC2024-011',
      debtor: {
        firstName: 'Émilie',
        lastName: 'Fabre',
        email: 'emilie.fabre@email.com',
        phone: '+33 1 23 45 67 99',
        address: {
          street: '852 Rue Paix',
          city: 'Dijon',
          postalCode: '21000',
          country: 'France'
        },
        type: 'individual'
      },
      creditor: {
        name: 'Télécoms Avenir',
        contactPerson: 'Olivier Garnier',
        email: 'olivier@telecomsavenir.fr',
        phone: '+33 1 23 45 67 77',
        address: {
          street: '456 Zone Tech',
          city: 'Dijon',
          postalCode: '21001',
          country: 'France'
        }
      },
      amount: 680,
      amountPaid: 680,
      debtBreakdown: {
        principalAmount: 600,
        interests: [
          {
            id: '13',
            type: 'legal',
            rate: 3.15,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-02-01'),
            amount: 60,
            description: 'Intérêts légaux (3,15% par an)'
          }
        ],
        penalties: [
          {
            id: '11',
            type: 'late_payment',
            amount: 15,
            appliedDate: new Date('2024-01-15'),
            description: 'Pénalité de retard forfaitaire'
          }
        ],
        fees: [
          {
            id: '11',
            type: 'collection',
            amount: 5,
            appliedDate: new Date('2024-01-10'),
            description: 'Frais de recouvrement'
          }
        ],
        totalInterests: 60,
        totalPenalties: 15,
        totalFees: 5,
        totalAmount: 680
      },
      status: CaseStatus.COMPLETED,
      priority: Priority.LOW,
      createdAt: new Date('2024-01-01'),
      dueDate: new Date('2024-02-01'),
      assignedBailiff: '2',
      documents: [
        {
          id: '18',
          name: 'Facture télécoms.pdf',
          type: DocumentType.INVOICE,
          url: '#',
          uploadedAt: new Date('2024-01-01'),
          uploadedBy: 'Olivier Garnier'
        }
      ],
      history: [
        {
          id: '32',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2024-01-01'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '33',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Paiement complet reçu - 680€',
          date: new Date('2024-02-01'),
          userId: '11',
          userName: 'Émilie Fabre'
        }
      ]
    },
    // Dossiers pour le créancier Sophie Lambert (creditor contactPerson)
    {
      id: '12',
      caseNumber: 'REC2024-012',
      debtor: {
        firstName: 'David',
        lastName: 'Mercier',
        companyName: 'Mercier EURL',
        email: 'david@mercier-eurl.fr',
        phone: '+33 1 23 45 67 93',
        address: {
          street: '741 Zone Artisanale',
          city: 'Clermont-Ferrand',
          postalCode: '63000',
          country: 'France'
        },
        type: 'company'
      },
      creditor: {
        name: 'ABC Services',
        contactPerson: 'Sophie Lambert',
        email: 'contact@abc-services.fr',
        phone: '+33 1 23 45 67 88',
        address: {
          street: '456 Avenue des Affaires',
          city: 'Lyon',
          postalCode: '69000',
          country: 'France'
        }
      },
      amount: 7800,
      amountPaid: 2000,
      debtBreakdown: {
        principalAmount: 7000,
        interests: [
          {
            id: '14',
            type: 'contractual',
            rate: 8,
            startDate: new Date('2024-01-01'),
            amount: 650,
            description: 'Intérêts contractuels (8% par an)'
          }
        ],
        penalties: [
          {
            id: '12',
            type: 'late_payment',
            amount: 120,
            appliedDate: new Date('2024-02-01'),
            description: 'Pénalité de retard'
          }
        ],
        fees: [
          {
            id: '12',
            type: 'collection',
            amount: 30,
            appliedDate: new Date('2024-02-10'),
            description: 'Frais de recouvrement'
          }
        ],
        totalInterests: 650,
        totalPenalties: 120,
        totalFees: 30,
        totalAmount: 7800
      },
      status: CaseStatus.ACTIVE,
      priority: Priority.HIGH,
      createdAt: new Date('2024-01-01'),
      dueDate: new Date('2024-03-01'),
      assignedBailiff: '2',
      assignedLawyer: '3',
      documents: [
        {
          id: '19',
          name: 'Contrat prestation.pdf',
          type: DocumentType.CONTRACT,
          url: '#',
          uploadedAt: new Date('2024-01-01'),
          uploadedBy: 'Sophie Lambert'
        }
      ],
      history: [
        {
          id: '34',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2024-01-01'),
          userId: '4',
          userName: 'Sophie Lambert'
        },
        {
          id: '35',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Paiement partiel reçu - 2000€',
          date: new Date('2024-02-15'),
          userId: '12',
          userName: 'David Mercier'
        },
        {
          id: '36',
          type: ActivityType.REMINDER_SENT,
          description: 'Relance pour solde restant',
          date: new Date('2024-03-01'),
          userId: '2',
          userName: 'Marie Martin'
        }
      ]
    },
    {
      id: '13',
      caseNumber: 'REC2024-013',
      debtor: {
        firstName: 'Lucie',
        lastName: 'Perrin',
        email: 'lucie.perrin@email.com',
        phone: '+33 1 23 45 67 94',
        address: {
          street: '963 Avenue Liberté',
          city: 'Angers',
          postalCode: '49000',
          country: 'France'
        },
        type: 'individual'
      },
      creditor: {
        name: 'ABC Services',
        contactPerson: 'Sophie Lambert',
        email: 'contact@abc-services.fr',
        phone: '+33 1 23 45 67 88',
        address: {
          street: '456 Avenue des Affaires',
          city: 'Lyon',
          postalCode: '69000',
          country: 'France'
        }
      },
      amount: 1200,
      amountPaid: 400,
      debtBreakdown: {
        principalAmount: 1000,
        interests: [
          {
            id: '15',
            type: 'legal',
            rate: 3.15,
            startDate: new Date('2024-02-01'),
            amount: 150,
            description: 'Intérêts légaux (3,15% par an)'
          }
        ],
        penalties: [
          {
            id: '13',
            type: 'late_payment',
            amount: 35,
            appliedDate: new Date('2024-02-15'),
            description: 'Pénalité de retard forfaitaire'
          }
        ],
        fees: [
          {
            id: '13',
            type: 'collection',
            amount: 15,
            appliedDate: new Date('2024-02-10'),
            description: 'Frais de recouvrement'
          }
        ],
        totalInterests: 150,
        totalPenalties: 35,
        totalFees: 15,
        totalAmount: 1200
      },
      status: CaseStatus.NEGOTIATION,
      priority: Priority.MEDIUM,
      createdAt: new Date('2024-02-01'),
      dueDate: new Date('2024-04-01'),
      assignedBailiff: '2',
      documents: [
        {
          id: '20',
          name: 'Facture impayée.pdf',
          type: DocumentType.INVOICE,
          url: '#',
          uploadedAt: new Date('2024-02-01'),
          uploadedBy: 'Sophie Lambert'
        }
      ],
      history: [
        {
          id: '37',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2024-02-01'),
          userId: '4',
          userName: 'Sophie Lambert'
        },
        {
          id: '38',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Paiement partiel reçu - 400€',
          date: new Date('2024-02-20'),
          userId: '13',
          userName: 'Lucie Perrin'
        },
        {
          id: '39',
          type: ActivityType.STATUS_CHANGED,
          description: 'Statut modifié vers "Négociation"',
          date: new Date('2024-02-25'),
          userId: '2',
          userName: 'Marie Martin'
        }
      ]
    },
    {
      id: '14',
      caseNumber: 'REC2024-014',
      debtor: {
        firstName: 'Maxime',
        lastName: 'Roussel',
        email: 'maxime.roussel@email.com',
        phone: '+33 1 23 45 67 92',
        address: {
          street: '159 Rue Nouvelle',
          city: 'Reims',
          postalCode: '51100',
          country: 'France'
        },
        type: 'individual'
      },
      creditor: {
        name: 'ABC Services',
        contactPerson: 'Sophie Lambert',
        email: 'contact@abc-services.fr',
        phone: '+33 1 23 45 67 88',
        address: {
          street: '456 Avenue des Affaires',
          city: 'Lyon',
          postalCode: '69000',
          country: 'France'
        }
      },
      amount: 3400,
      amountPaid: 3400,
      debtBreakdown: {
        principalAmount: 3100,
        interests: [
          {
            id: '16',
            type: 'legal',
            rate: 3.15,
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-02-28'),
            amount: 250,
            description: 'Intérêts légaux (3,15% par an)'
          }
        ],
        penalties: [
          {
            id: '14',
            type: 'late_payment',
            amount: 40,
            appliedDate: new Date('2024-02-01'),
            description: 'Pénalité de retard forfaitaire'
          }
        ],
        fees: [
          {
            id: '14',
            type: 'collection',
            amount: 10,
            appliedDate: new Date('2024-01-20'),
            description: 'Frais de recouvrement'
          }
        ],
        totalInterests: 250,
        totalPenalties: 40,
        totalFees: 10,
        totalAmount: 3400
      },
      status: CaseStatus.COMPLETED,
      priority: Priority.MEDIUM,
      createdAt: new Date('2024-01-15'),
      dueDate: new Date('2024-02-28'),
      assignedBailiff: '2',
      documents: [
        {
          id: '21',
          name: 'Facture maintenance.pdf',
          type: DocumentType.INVOICE,
          url: '#',
          uploadedAt: new Date('2024-01-15'),
          uploadedBy: 'Sophie Lambert'
        },
        {
          id: '22',
          name: 'Reçu paiement final.pdf',
          type: DocumentType.PAYMENT_PROOF,
          url: '#',
          uploadedAt: new Date('2024-02-28'),
          uploadedBy: 'Maxime Roussel'
        }
      ],
      history: [
        {
          id: '40',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé',
          date: new Date('2024-01-15'),
          userId: '4',
          userName: 'Sophie Lambert'
        },
        {
          id: '41',
          type: ActivityType.REMINDER_SENT,
          description: 'Relance par email',
          date: new Date('2024-02-01'),
          userId: '2',
          userName: 'Marie Martin'
        },
        {
          id: '42',
          type: ActivityType.PAYMENT_RECEIVED,
          description: 'Paiement complet reçu - 3400€',
          date: new Date('2024-02-28'),
          userId: '14',
          userName: 'Maxime Roussel'
        }
      ]
    },
    {
      id: '15',
      caseNumber: 'REC2024-015',
      debtor: {
        firstName: 'Caroline',
        lastName: 'Vidal',
        companyName: 'Vidal & Co',
        email: 'caroline@vidal-co.fr',
        phone: '+33 1 23 45 67 91',
        address: {
          street: '753 Rue Commerce',
          city: 'Tours',
          postalCode: '37000',
          country: 'France'
        },
        type: 'company'
      },
      creditor: {
        name: 'ABC Services',
        contactPerson: 'Sophie Lambert',
        email: 'contact@abc-services.fr',
        phone: '+33 1 23 45 67 88',
        address: {
          street: '456 Avenue des Affaires',
          city: 'Lyon',
          postalCode: '69000',
          country: 'France'
        }
      },
      amount: 18500,
      amountPaid: 0,
      debtBreakdown: {
        principalAmount: 16000,
        interests: [
          {
            id: '17',
            type: 'contractual',
            rate: 14,
            startDate: new Date('2023-12-01'),
            amount: 2000,
            description: 'Intérêts contractuels (14% par an)'
          }
        ],
        penalties: [
          {
            id: '15',
            type: 'breach',
            amount: 400,
            appliedDate: new Date('2024-01-01'),
            description: 'Pénalité pour rupture de contrat'
          }
        ],
        fees: [
          {
            id: '15',
            type: 'legal',
            amount: 100,
            appliedDate: new Date('2024-01-15'),
            description: 'Frais juridiques'
          }
        ],
        totalInterests: 2000,
        totalPenalties: 400,
        totalFees: 100,
        totalAmount: 18500
      },
      status: CaseStatus.PENDING,
      priority: Priority.HIGH,
      createdAt: new Date('2023-12-01'),
      dueDate: new Date('2024-02-01'),
      documents: [
        {
          id: '23',
          name: 'Contrat commercial.pdf',
          type: DocumentType.CONTRACT,
          url: '#',
          uploadedAt: new Date('2023-12-01'),
          uploadedBy: 'Sophie Lambert'
        }
      ],
      history: [
        {
          id: '43',
          type: ActivityType.CASE_CREATED,
          description: 'Dossier créé - En attente d\'assignation',
          date: new Date('2023-12-01'),
          userId: '4',
          userName: 'Sophie Lambert'
        }
      ]
    }
  ];

  private mockPaymentProposals: PaymentProposal[] = [
    {
      id: '1',
      caseId: '1',
      proposedBy: '1',
      totalAmount: 3500,
      monthlyAmount: 500,
      duration: 7,
      startDate: new Date('2024-03-01'),
      status: 'pending',
      createdAt: new Date('2024-02-15'),
      notes: 'Proposition d\'échéancier sur 7 mois'
    }
  ];

  private mockCaseNotes: CaseNote[] = [
    {
      id: '1',
      caseId: '1',
      content: 'Contact téléphonique avec le débiteur. Situation financière difficile mais volonté de payer.',
      type: 'call',
      createdAt: new Date('2024-02-10'),
      createdBy: '2',
      createdByName: 'Marie Martin',
      isPrivate: false
    },
    {
      id: '2',
      caseId: '1',
      content: 'Envoi de la mise en demeure par courrier recommandé.',
      type: 'legal',
      createdAt: new Date('2024-02-05'),
      createdBy: '2',
      createdByName: 'Marie Martin',
      isPrivate: true
    }
  ];

  constructor() {
    this.casesSubject.next(this.mockCases);
  }

  getCases(): Observable<DebtCase[]> {
    return of(this.mockCases).pipe(delay(500));
  }

  getCaseById(id: string): Observable<DebtCase | undefined> {
    const case$ = this.mockCases.find(c => c.id === id);
    return of(case$).pipe(delay(300));
  }

  getCasesByUserId(userId: string, role: string): Observable<DebtCase[]> {
    let filteredCases: DebtCase[] = [];

    switch (role) {
      case 'debtor':
        // Filtrer par email du débiteur connecté
        const currentUser = this.getCurrentUserEmail(userId);
        if (currentUser === 'debiteur@example.com') {
          filteredCases = this.mockCases.filter(c => c.debtor.email === 'jean.dupont@email.com');
        }
        break;
      case 'bailiff':
        filteredCases = this.mockCases.filter(c => c.assignedBailiff === userId);
        break;
      case 'lawyer':
        filteredCases = this.mockCases.filter(c => c.assignedLawyer === userId);
        break;
      case 'creditor':
        // Filtrer par créancier (nom de l'entreprise ou contact person)
        const creditorUser = this.getCurrentUserInfo(userId);
        if (creditorUser) {
          filteredCases = this.mockCases.filter(c => 
            c.creditor.name === creditorUser.companyName || 
            c.creditor.contactPerson === `${creditorUser.firstName} ${creditorUser.lastName}`
          );
        }
        break;
      default:
        filteredCases = this.mockCases;
    }

    return of(filteredCases).pipe(delay(500));
  }

  updateCaseStatus(caseId: string, status: CaseStatus): Observable<DebtCase> {
    const caseIndex = this.mockCases.findIndex(c => c.id === caseId);
    if (caseIndex >= 0) {
      this.mockCases[caseIndex].status = status;
      this.mockCases[caseIndex].history.push({
        id: Date.now().toString(),
        type: ActivityType.STATUS_CHANGED,
        description: `Statut modifié vers ${status}`,
        date: new Date(),
        userId: '2',
        userName: 'Marie Martin'
      });
    }
    
    return of(this.mockCases[caseIndex]).pipe(delay(300));
  }

  createPayment(caseId: string, amount: number): Observable<DebtCase> {
    const caseIndex = this.mockCases.findIndex(c => c.id === caseId);
    if (caseIndex >= 0) {
      this.mockCases[caseIndex].amountPaid += amount;
      this.mockCases[caseIndex].history.push({
        id: Date.now().toString(),
        type: ActivityType.PAYMENT_RECEIVED,
        description: `Paiement reçu : ${amount}€`,
        date: new Date(),
        userId: '1',
        userName: 'Jean Dupont'
      });

      if (this.mockCases[caseIndex].amountPaid >= this.mockCases[caseIndex].amount) {
        this.mockCases[caseIndex].status = CaseStatus.COMPLETED;
      }
    }
    
    return of(this.mockCases[caseIndex]).pipe(delay(500));
  }

  getStatistics(): Observable<any> {
    const stats = {
      totalCases: this.mockCases.length,
      activeCases: this.mockCases.filter(c => c.status === CaseStatus.ACTIVE).length,
      completedCases: this.mockCases.filter(c => c.status === CaseStatus.COMPLETED).length,
      totalAmount: this.mockCases.reduce((sum, c) => sum + c.amount, 0),
      recoveredAmount: this.mockCases.reduce((sum, c) => sum + c.amountPaid, 0),
      pendingCases: this.mockCases.filter(c => c.status === CaseStatus.PENDING).length
    };

    return of(stats).pipe(delay(300));
  }

  getCasesWithFilter(filter: CaseFilter): Observable<DebtCase[]> {
    let filteredCases = [...this.mockCases];

    if (filter.status && filter.status.length > 0) {
      filteredCases = filteredCases.filter(c => filter.status!.includes(c.status));
    }

    if (filter.priority && filter.priority.length > 0) {
      filteredCases = filteredCases.filter(c => filter.priority!.includes(c.priority));
    }

    if (filter.assignedTo) {
      filteredCases = filteredCases.filter(c => 
        c.assignedBailiff === filter.assignedTo || c.assignedLawyer === filter.assignedTo
      );
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filteredCases = filteredCases.filter(c =>
        c.caseNumber.toLowerCase().includes(term) ||
        c.debtor.firstName.toLowerCase().includes(term) ||
        c.debtor.lastName.toLowerCase().includes(term) ||
        c.creditor.name.toLowerCase().includes(term)
      );
    }

    return of(filteredCases).pipe(delay(300));
  }

  createCase(caseData: Partial<DebtCase>): Observable<DebtCase> {
    const newCase: DebtCase = {
      ...caseData as DebtCase,
      id: (this.mockCases.length + 1).toString(),
      caseNumber: `REC2024-${String(this.mockCases.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      documents: [],
      history: [{
        id: Date.now().toString(),
        type: ActivityType.CASE_CREATED,
        description: 'Dossier créé',
        date: new Date(),
        userId: '2',
        userName: 'Marie Martin'
      }]
    };

    this.mockCases.push(newCase);
    this.casesSubject.next(this.mockCases);
    
    return of(newCase).pipe(delay(500));
  }

  updateCase(caseId: string, updates: Partial<DebtCase>): Observable<DebtCase> {
    const caseIndex = this.mockCases.findIndex(c => c.id === caseId);
    if (caseIndex >= 0) {
      this.mockCases[caseIndex] = { ...this.mockCases[caseIndex], ...updates };
      this.casesSubject.next(this.mockCases);
    }
    
    return of(this.mockCases[caseIndex]).pipe(delay(300));
  }

  getCaseNotes(caseId: string): Observable<CaseNote[]> {
    const notes = this.mockCaseNotes.filter(n => n.caseId === caseId);
    return of(notes).pipe(delay(300));
  }

  addCaseNote(note: Omit<CaseNote, 'id' | 'createdAt'>): Observable<CaseNote> {
    const newNote: CaseNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    this.mockCaseNotes.push(newNote);
    return of(newNote).pipe(delay(300));
  }

  getPaymentProposals(caseId: string): Observable<PaymentProposal[]> {
    const proposals = this.mockPaymentProposals.filter(p => p.caseId === caseId);
    return of(proposals).pipe(delay(300));
  }

  createPaymentProposal(proposal: Omit<PaymentProposal, 'id' | 'createdAt'>): Observable<PaymentProposal> {
    const newProposal: PaymentProposal = {
      ...proposal,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    this.mockPaymentProposals.push(newProposal);
    return of(newProposal).pipe(delay(500));
  }

  approvePaymentProposal(proposalId: string): Observable<PaymentProposal> {
    const proposal = this.mockPaymentProposals.find(p => p.id === proposalId);
    if (proposal) {
      proposal.status = 'approved';
    }
    return of(proposal!).pipe(delay(300));
  }

  generateReport(filters: CaseFilter): Observable<any> {
    // Simulation de génération de rapport
    const reportData = {
      generatedAt: new Date(),
      totalCases: this.mockCases.length,
      filters: filters,
      summary: {
        totalAmount: this.mockCases.reduce((sum, c) => sum + c.amount, 0),
        recoveredAmount: this.mockCases.reduce((sum, c) => sum + c.amountPaid, 0),
        successRate: 75
      }
    };
    
    return of(reportData).pipe(delay(1000));
  }

  // Nouvelles méthodes pour la gestion avancée des documents
  uploadDocument(caseId: string, document: Omit<CaseDocument, 'id' | 'uploadedAt'>): Observable<CaseDocument> {
    const newDocument: CaseDocument = {
      ...document,
      id: Date.now().toString(),
      uploadedAt: new Date()
    };
    
    const caseIndex = this.mockCases.findIndex(c => c.id === caseId);
    if (caseIndex >= 0) {
      this.mockCases[caseIndex].documents.push(newDocument);
      this.casesSubject.next(this.mockCases);
    }
    
    return of(newDocument).pipe(delay(500));
  }

  deleteDocument(caseId: string, documentId: string): Observable<boolean> {
    const caseIndex = this.mockCases.findIndex(c => c.id === caseId);
    if (caseIndex >= 0) {
      this.mockCases[caseIndex].documents = this.mockCases[caseIndex].documents.filter(d => d.id !== documentId);
      this.casesSubject.next(this.mockCases);
    }
    
    return of(true).pipe(delay(300));
  }

  // Méthodes pour les statistiques avancées
  getAdvancedStatistics(userId: string, role: string): Observable<any> {
    let userCases: DebtCase[] = [];
    
    switch (role) {
      case 'bailiff':
        userCases = this.mockCases.filter(c => c.assignedBailiff === userId);
        break;
      case 'lawyer':
        userCases = this.mockCases.filter(c => c.assignedLawyer === userId);
        break;
      default:
        userCases = this.mockCases;
    }

    const stats = {
      totalCases: userCases.length,
      activeCases: userCases.filter(c => c.status === CaseStatus.ACTIVE).length,
      completedCases: userCases.filter(c => c.status === CaseStatus.COMPLETED).length,
      legalActionCases: userCases.filter(c => c.status === CaseStatus.LEGAL_ACTION).length,
      totalAmount: userCases.reduce((sum, c) => sum + c.amount, 0),
      recoveredAmount: userCases.reduce((sum, c) => sum + c.amountPaid, 0),
      averageRecoveryTime: 45, // jours
      successRate: userCases.length > 0 ? Math.round((userCases.filter(c => c.status === CaseStatus.COMPLETED).length / userCases.length) * 100) : 0,
      monthlyTrend: [
        { month: 'Jan', cases: 12, recovered: 45000 },
        { month: 'Fév', cases: 15, recovered: 52000 },
        { month: 'Mar', cases: 18, recovered: 61000 }
      ]
    };

    return of(stats).pipe(delay(500));
  }

  // Méthodes utilitaires pour récupérer les informations utilisateur
  private getCurrentUserEmail(userId: string): string {
    const userEmails: { [key: string]: string } = {
      '1': 'debiteur@example.com',
      '2': 'huissier@example.com',
      '3': 'avocat@example.com',
      '4': 'creancier@example.com'
    };
    return userEmails[userId] || '';
  }

  private getCurrentUserInfo(userId: string): any {
    const userInfos: { [key: string]: any } = {
      '4': {
        firstName: 'Sophie',
        lastName: 'Lambert',
        companyName: 'ABC Services'
      }
    };
    return userInfos[userId] || null;
  }
}