export interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  mustChangePassword?: boolean;
  employeeId?: string;
  employee?: {
    id?: string;
    fullName?: string;
    department?: string;
    position?: string;
    phone?: string;
    jobTitle?: string;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
