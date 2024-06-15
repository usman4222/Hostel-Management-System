// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import the correct storage function

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCL8sEBFJ6XAH2fppW2UYWbGPizgQtiu8A",
  authDomain: "coinmath-536d9.firebaseapp.com",
  projectId: "coinmath-536d9",
  storageBucket: "coinmath-536d9.appspot.com",
  messagingSenderId: "110498776243",
  appId: "1:110498776243:web:8be7b7ae727d97a1051cc6",
  measurementId: "G-BBVVS32JTC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize storage

export const auth = getAuth();
export default app;
export { db, storage };
