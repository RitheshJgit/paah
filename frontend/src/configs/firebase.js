import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKkmlT9GqT_t6ylQPpkAAhGzizJwcx9rQ",
  authDomain: "paah-725a4.firebaseapp.com",
  projectId: "paah-725a4",
  storageBucket: "paah-725a4.firebasestorage.app",
  messagingSenderId: "440955162131",
  appId: "1:440955162131:web:e3bf06e189e8cfe6be79e6",
  measurementId: "G-6M9CYZ1S4K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);