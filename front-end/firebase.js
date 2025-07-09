// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const appId = import.meta.env.VITE_APP_ID;
export const initialAuthToken = 
  import.meta.env.VITE_INITIAL_AUTH_TOKEN && import.meta.env.VITE_INITIAL_AUTH_TOKEN !== 'null'
    ? import.meta.env.VITE_INITIAL_AUTH_TOKEN
    : null;


setLogLevel('debug'); // Solo en desarrollo
