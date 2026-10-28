export interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  mustChangePassword?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
