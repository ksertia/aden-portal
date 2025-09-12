export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  companyName?: string;
  licenseNumber?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export enum UserRole {
  DEBTOR = 'debtor',
  BAILIFF = 'bailiff',
  LAWYER = 'lawyer',
  CREDITOR = 'creditor',
  CEDANT = 'cedant'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}