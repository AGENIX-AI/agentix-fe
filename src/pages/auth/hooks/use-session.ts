import { } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

interface SessionHook {
  user: {
    id: string;
    email: string;
    phone?: string;
    role?: string;
  } | null;
  loaded: boolean;
  error: Error | null;
}

export function useSession(): SessionHook {
  const { user } = useAuth();
  
  // We can consider the session loaded immediately since AuthContext handles the loading
  return { 
    user,  
    loaded: true,
    error: null 
  };
}
