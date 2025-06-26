import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getFirebaseConfig } from "../confiq/firebase.config.ts";
import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";

interface UseFirebaseReturn {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useFirebase = (): UseFirebaseReturn => {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const config = getFirebaseConfig();
        const firebaseApp = initializeApp(config);
        const firebaseAuth = getAuth(firebaseApp);
        const firestore = getFirestore(firebaseApp);

        setApp(firebaseApp);
        setAuth(firebaseAuth);
        setDb(firestore);

        const unsubscribe = onAuthStateChanged(
          firebaseAuth,
          async (currentUser) => {
            if (currentUser) {
              setUser(currentUser);
              setLoading(false);
            } else {
              try {
                await signInAnonymously(firebaseAuth);
              } catch (authError: any) {
                setError(`Authentication failed: ${authError.message}`);
                setLoading(false);
              }
            }
          },
        );

        return () => unsubscribe();
      } catch (err: any) {
        setError(`Firebase initialization failed: ${err.message}`);
        setLoading(false);
      }
    };

    initializeFirebase();
  }, []);

  return { app, auth, db, user, loading, error };
};
