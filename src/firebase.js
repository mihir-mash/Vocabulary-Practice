import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Paste your exact config object here (make sure to grab your appId from your screen)
const firebaseConfig = {
  apiKey: "AIzaSyBXVhcIS1KdfjlqdSBMPpvLnBi2TWN0nI0",
  authDomain: "vocab-fam.firebaseapp.com",
  projectId: "vocab-fam",
  storageBucket: "vocab-fam.firebasestorage.app",
  messagingSenderId: "849939960107",
  appId: "1:849939960107:web:82ea28230a459de6c3b56e",
  measurementId: "G-F87FEN6ZV5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);