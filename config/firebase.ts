import { initializeApp } from 'firebase/app';
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

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Auth servisini al ve dışa aktar
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 