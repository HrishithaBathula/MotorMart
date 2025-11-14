

// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//import { getStorage} from 'firebase/storage'

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

console.log("🔥 firebaseConfig.js is loading...");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
 authDomain: "car-marketplace-9b8aa.firebaseapp.com",
  projectId: "car-marketplace-9b8aa",
  storageBucket: "car-marketplace-9b8aa.firebasestorage.app",
 //storageBucket: "car-marketplace-9b8aa.appspot.com",
  messagingSenderId: "54439791673",
  appId: "1:54439791673:web:25dc7657db71da62af91e8",
  measurementId: "G-LXNRJCQHJ3"
};
/*
const app = initializeApp(firebaseConfig);
console.log("✅ Firebase Initialized:", app.name);
export const storage=getStorage(app);
*/
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

console.log("✅ Firebase App Initialized:", app.name);

// ✅ Use this instance
const storage = getStorage(app);

export { storage, app };