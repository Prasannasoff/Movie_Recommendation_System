// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyDKnYhQIaZHRtxTtTxenxMqzToXMnuWgz4",
  authDomain: "movie-recommendation0000.firebaseapp.com",
  projectId: "movie-recommendation0000",
  storageBucket: "movie-recommendation0000.appspot.com",
  messagingSenderId: "64372534177",
  appId: "1:64372534177:web:740e0f8d102963b91039e0",
  measurementId: "G-H6NLT5J1CJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 