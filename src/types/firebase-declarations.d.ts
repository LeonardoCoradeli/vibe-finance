declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, any>;
  }
  export function initializeApp(options: Record<string, any>, name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(name?: string): FirebaseApp;
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }
  export interface Auth {
    currentUser: User | null;
  }
  export class GoogleAuthProvider {
    setCustomParameters(customOAuthParameters: Record<string, string>): void;
  }
  export function getAuth(app?: any): Auth;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: (user: User | null) => void): () => void;
  export function signInWithPopup(auth: Auth, provider: any): Promise<{ user: User }>;
  export function signOut(auth: Auth): Promise<void>;
}

declare module 'firebase/firestore' {
  export interface Firestore {}
  export interface DocumentReference {}
  export interface DocumentSnapshot {
    exists(): boolean;
    data(): Record<string, any> | undefined;
  }
  export function getFirestore(app?: any): Firestore;
  export function doc(firestore: Firestore, ...pathSegments: string[]): DocumentReference;
  export function setDoc(reference: DocumentReference, data: Record<string, any>, options?: { merge?: boolean }): Promise<void>;
  export function getDoc(reference: DocumentReference): Promise<DocumentSnapshot>;
}
