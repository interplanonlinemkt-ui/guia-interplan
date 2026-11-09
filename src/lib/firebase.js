import { initializeApp } from 'firebase/app';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** true quando o .env com as chaves do Firebase foi preenchido */
export const firebaseAtivo = Boolean(config.apiKey && config.projectId);
export const temStorage = Boolean(config.storageBucket);

export const app = firebaseAtivo ? initializeApp(config) : null;
