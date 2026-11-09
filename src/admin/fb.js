// Serviços completos do Firebase, carregados só no painel ADM.
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { app, temStorage } from '../lib/firebase';

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app && temStorage ? getStorage(app) : null;
