// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZ1mA6mrylQ-DRFegwDXua4ZAe43BtDPA",
  authDomain: "location-5b065.firebaseapp.com",
  projectId: "location-5b065",
  storageBucket: "location-5b065.firebasestorage.app",
  messagingSenderId: "797187805854",
  appId: "1:797187805854:web:38246b884cf8ce95a7e18f",
  measurementId: "G-41HN16HE1Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export { db };