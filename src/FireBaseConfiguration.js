import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

export const firebaseConfig = {
    apiKey: "AIzaSyBGjO2Xv86ksnWA5g5zUKkNdyRhteRxNhw",
    authDomain: "utopian-eye-352216.firebaseapp.com",
    projectId: "utopian-eye-352216",
    storageBucket: "utopian-eye-352216.appspot.com",
    messagingSenderId: "692383388328",
    appId: "1:692383388328:web:372279ee83c21c2e5ce89d",
    measurementId: "G-PD1W65F1ML"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
