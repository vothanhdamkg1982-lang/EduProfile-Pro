// firebase-init.js - Khởi tạo Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZrlUaKNYhOPE_8yFiZzXhSw0uqR3tQfs",
  authDomain: "ho-so-nang-luc-so.firebaseapp.com",
  projectId: "ho-so-nang-luc-so",
  storageBucket: "ho-so-nang-luc-so.firebasestorage.app",
  messagingSenderId: "455775597999",
  appId: "1:455775597999:web:e820c95217b953994cab5a",
  measurementId: "G-MH8F3JCV1M"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged, collection, doc, setDoc, getDoc, getDocs, deleteDoc };