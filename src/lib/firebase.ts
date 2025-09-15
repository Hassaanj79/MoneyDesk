
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5iF4n-xI1-g6p3aWfS_x5J8Q9y7Rz-wE",
  authDomain: "moneydesk-8f431.firebaseapp.com",
  projectId: "moneydesk-8f431",
  storageBucket: "moneydesk-8f431.appspot.com",
  messagingSenderId: "1095204439126",
  appId: "1:1095204439126:web:158e92f4f205a25e16b940"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
