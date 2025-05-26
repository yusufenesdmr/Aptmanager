import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBDJW7mOOnCuxvLfwDdTwxgx4z1Btg3Kts",
  authDomain: "apartman-6cec5.firebaseapp.com",
  projectId: "apartman-6cec5",
  storageBucket: "apartman-6cec5.firebasestorage.app",
  messagingSenderId: "970065610547",
  appId: "1:970065610547:web:8184ff3c00ed5a3865e046",
  measurementId: "G-27LBC18KNM"
};

// Firebase uygulamasını başlat (eğer zaten başlatılmamışsa)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Auth servisini al ve dışa aktar
export const auth = getAuth(app);
export const db = getFirestore(app); 