'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured, isQaModeEnabled } from './config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  isQaModeEnabled: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithQAMock: (account?: { uid: string; email: string; displayName: string }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  isQaModeEnabled: false,
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
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error:
          'Credenciais do Firebase não detectadas. Configure as variáveis NEXT_PUBLIC_FIREBASE_* no seu arquivo .env ou no painel de Environment Variables da Vercel (consulte .env.example).',
      };
    }

    try {
      const provider = googleProvider || new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'auth/configuration-not-found') {
        return {
          success: false,
          error:
            'O provedor de Login Google ou o serviço Firebase Authentication ainda não foram ativados no Firebase Console (projeto teste-dc3ae). Acesse o Console > Authentication > Sign-in method e ative o "Google" (selecionando um e-mail de suporte). Enquanto isso, você pode entrar utilizando a Conta de QA para testar todas as funcionalidades!',
        };
      }
      if (code === 'auth/operation-not-allowed') {
        return {
          success: false,
          error:
            'O provedor Google ainda não foi ativado no Firebase Console do projeto teste-dc3ae. Acesse Authentication > Sign-in method > Google e ative a chave. Enquanto isso, você pode entrar utilizando a Conta de QA!',
        };
      }
      if (code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          error: 'A janela de login do Google foi fechada antes de concluir a autenticação.',
        };
      }
      if (code === 'auth/popup-blocked') {
        return {
          success: false,
          error: 'O pop-up de login foi bloqueado pelo seu navegador. Por favor, permita pop-ups para este site.',
        };
      }
      if (code === 'auth/unauthorized-domain') {
        return {
          success: false,
          error:
            'Este domínio (ex: localhost ou Vercel) não está autorizado no Firebase Authentication. Acesse Authentication > Settings > Authorized domains no Firebase Console e adicione este domínio.',
        };
      }
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
        isQaModeEnabled,
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
