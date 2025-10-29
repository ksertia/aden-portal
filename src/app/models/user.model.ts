// L'énumération StrapiRole reste la même, en tant qu'énumération.
export enum StrapiRole {
  DEBTOR = 'debtor',
  BAILIFF = 'bailiff',
  LAWYER = 'lawyer',
  CREDITOR = 'creditor',
  CEDANT = 'cedant',
  ADMINISTRATEUR='Administrateur',
  RECOVERY_PARTNER = 'partner'
}

// Interface pour les informations liées au rôle
export interface Role {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Interface pour l'adresse de l'utilisateur
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Interface pour l'utilisateur
export interface User {
allUser: any;
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  password:string;
  role: Role;  // Le rôle est un objet qui contient toutes les informations du rôle
  statut: string;
  avatar?: string;
  phone?: string;
  companyName?: string;
  licenseNumber?: string;
  address?: Address;
  firstLogin?: boolean;  // Ajouté pour gestion du premier login
  businessId?: string;   // Ajouté pour liaison avec profil business
  prenom: string;
  nom: string;
  telephone?: string;
  emailProfessionnel: string;
  contactPrincipal: string;
  secteurActivite: string;
  raisonSociale: string;
  chambreDepartementale: string;
  nomCabinet: string;
  typePartenaire: string;
  debiteurNodeId?: string;
  nodeId: string;
}

export interface Debiteurs {
  id?: string;
  creditorName: string;
  username: string;
  email: string;
  phone: string;
  status: string;
}


// Interface pour la demande de connexion
export interface LoginRequest {
  email: string;
  password: string;
}

// Interface pour la réponse de connexion, contenant l'utilisateur et le token JWT
export interface LoginResponse {
  user: User;
  token: string;
}

// Fonction pour mapper un rôle de Strapi en une valeur de l'énumération StrapiRole
export const mapStrapiRoleToEnum = (role: Role): StrapiRole | null => {
  switch (role.name) {
    case 'debtor':
      return StrapiRole.DEBTOR;
    case 'bailiff':
      return StrapiRole.BAILIFF;
    case 'lawyer':
      return StrapiRole.LAWYER;
    case 'creditor':
      return StrapiRole.CREDITOR;
    case 'cedant':
      return StrapiRole.CEDANT;
    case 'Administrateur':
      return StrapiRole.ADMINISTRATEUR;
    case 'recovery_partner':
      return StrapiRole.RECOVERY_PARTNER;
    default:
      return null;  // Si le rôle ne correspond à aucun, retournez null ou gérez autrement
  }
};
