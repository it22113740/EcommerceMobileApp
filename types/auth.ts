export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    avatar?: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }