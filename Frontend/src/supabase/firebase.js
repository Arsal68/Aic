import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKF5Xq_HnS4y144Mg1QsCqKQW8XlM5Am8",
  authDomain: "competition-d5e9e.firebaseapp.com",
  projectId: "competition-d5e9e",
  storageBucket: "competition-d5e9e.appspot.com", // fixed here
  messagingSenderId: "272342750471",
  appId: "1:272342750471:web:b47b96dcd16a912ffaa1a2",
  measurementId: "G-JLSJEFWTGS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
