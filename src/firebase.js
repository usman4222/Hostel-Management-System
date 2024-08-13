import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCo0H7TiqcJOcoMyeGygj0ei0p622gdB4Y",
  authDomain: "hostel-management-system-10ad0.firebaseapp.com",
  projectId: "hostel-management-system-10ad0",
  storageBucket: "hostel-management-system-10ad0.appspot.com",
  messagingSenderId: "81672728797",
  appId: "1:81672728797:web:8f64437efe56475d2eeb34",
  measurementId: "G-EW7571LPV7"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export const auth = getAuth(app);
export default app;
export { db, storage };