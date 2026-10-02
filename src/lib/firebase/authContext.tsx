'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithQAMock: (account?: { uid: string; email: string; displayName: string }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  signInWithGoogle: async () => ({ success: false, error: 'Firebase não configurado' }),
  signInWithQAMock: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se havia uma sessão ativa de QA salva no navegador, restaura-a
    if (typeof window !== 'undefined') {
      try {
        const storedQa = window.sessionStorage.getItem('qa_active_session');
        if (storedQa) {
          setUser(JSON.parse(storedQa));
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Erro ao restaurar sessão QA:', e);
      }
    }

    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      return {
        success: false,
        error: 'Para sincronizar com a sua conta Google real, configure suas credenciais do Firebase no arquivo .env.local (veja o modelo em .env.example). Alternativamente, você pode testar com a Conta de QA!',
      };
    }

    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Falha ao autenticar com o Google.',
      };
    }
  };

  const signInWithQAMock = (account = { uid: 'qa-tester-001', email: 'qa.tester@financas.app', displayName: 'QA Tester' }) => {
    const qaUser = {
      uid: account.uid,
      email: account.email,
      displayName: account.displayName,
      photoURL: null,
    } as any;

    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem('qa_active_session', JSON.stringify(qaUser));
      } catch (e) {
        console.warn('Erro ao salvar sessão QA:', e);
      }
    }

    setUser(qaUser);
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem('qa_active_session');
      } catch (e) {
        console.warn('Erro ao limpar sessão QA:', e);
      }
    }

    if (auth && isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch {}
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        signInWithGoogle,
        signInWithQAMock,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
