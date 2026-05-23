import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ข้อมูลนี้สรุปมาจาก google-services.json ของคุณครับ
const firebaseConfig = {
  apiKey: "AIzaSyCyVDYPIFfWak5LLXcHCwrVqFwQAcDMsmU",
  authDomain: "workoutplanner-19c3e.firebaseapp.com",
  projectId: "workoutplanner-19c3e",
  storageBucket: "workoutplanner-19c3e.firebasestorage.app",
  messagingSenderId: "1065923158847",
  appId: "1:1065923158847:web:2285f2fc4d8ec5f97ea98a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);