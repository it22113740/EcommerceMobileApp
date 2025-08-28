export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }