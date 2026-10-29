export interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  mustChangePassword?: boolean;
  employee?: {
    id?: string;
    fullName?: string;
    department?: string;
    position?: string;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
