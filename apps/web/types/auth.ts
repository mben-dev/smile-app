export interface User {
  id: number;
  email: string;
  fullName: string | null;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface LoginResponse {
  type: string;
  token: string;
  expiresAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
