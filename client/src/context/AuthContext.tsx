import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type RegisterCustomerInput, type RegisterSupplierInput, type RegisterSupplierResult } from '@/services/auth';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerCustomer: (input: RegisterCustomerInput) => Promise<User>;
  registerSupplier: (input: RegisterSupplierInput) => Promise<RegisterSupplierResult>;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on first load by asking the backend who we are.
  // The auth cookies are HttpOnly, so the client cannot read them directly.
  useEffect(() => {
    let cancelled = false;

    authService
      .me()
      .then((nextUser) => {
        if (!cancelled) setUser(nextUser);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const nextUser = await authService.login(email, password);
    setUser(nextUser);
    return nextUser;
  }, []);

  const registerCustomer = useCallback(async (input: RegisterCustomerInput): Promise<User> => {
    const nextUser = await authService.registerCustomer(input);
    setUser(nextUser);
    return nextUser;
  }, []);

  const registerSupplier = useCallback(async (input: RegisterSupplierInput): Promise<RegisterSupplierResult> => {
    const result = await authService.registerSupplier(input);
    if (!result.pendingVerification) {
      setUser(result.user);
    }
    return result;
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const nextUser = await authService.me();
      setUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, registerCustomer, registerSupplier, refreshUser, logout }),
    [user, loading, login, registerCustomer, registerSupplier, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
