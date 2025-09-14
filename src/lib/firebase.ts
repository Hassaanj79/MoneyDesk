// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "nextn-65825.firebaseapp.com",
  projectId: "nextn-65825",
  storageBucket: "nextn-65825.appspot.com",
  messagingSenderId: "1069553184333",
  appId: "1:1069553184333:web:0b7d34e97669d2a6a68f04",
  measurementId: "G-L9CSL22J5W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
