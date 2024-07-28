import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDwR-YajTt2bRugi2QRn3sah7wgupeVgBE",
  authDomain: "coinmath-project.firebaseapp.com",
  projectId: "coinmath-project",
  storageBucket: "coinmath-project.appspot.com",
  messagingSenderId: "164440406849",
  appId: "1:164440406849:web:cf7a0e3a1a22c4b486bfc0",
  measurementId: "G-2SK78D1L2D"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export const auth = getAuth(app);
export default app;
export { db, storage };
