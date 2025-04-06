import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyBDJW7mOOnCuxvLfwDdTwxgx4z1Btg3Kts",
  authDomain: "apartman-6cec5.firebaseapp.com",
  projectId: "apartman-6cec5",
  storageBucket: "apartman-6cec5.appspot.com",
  messagingSenderId: "970065610547",
  appId: "1:970065610547:web:06b4b392204a847365e046",
  measurementId: "G-27LBC18KNM"
};

// Firebase uygulamasını başlat
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase başlatıldı');
  } else {
    app = getApp();
    console.log('Mevcut Firebase uygulaması kullanılıyor');
  }
} catch (error) {
  console.error('Firebase başlatma hatası:', error);
  throw error;
}

// Auth ve Firestore servislerini al
const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);

// Servisleri dışa aktar
export { auth, firestore as db }; 