// Conexión con Firebase.
// Los valores vienen del archivo .env (no se sube a git).
// Para crearlo, copia .env.example como .env y llénalo con los datos de
// Configuración del proyecto > Tus apps > Web en la consola de Firebase.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Base de datos Firestore. ignoreUndefinedProperties evita errores si algún campo viene vacío (undefined).
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
