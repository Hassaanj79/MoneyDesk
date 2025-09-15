// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

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

if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    try {
        console.log("Connecting to Firebase Emulators");
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
    } catch (e) {
        console.error("Error connecting to emulators:", e);
    }
}
