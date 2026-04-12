import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBIaV7RlFXQTMbLilUKRyHRRs4ja0a8tvY",
  authDomain: "loksetu-da334.firebaseapp.com",
  projectId: "loksetu-da334",
  storageBucket: "loksetu-da334.firebasestorage.app",
  messagingSenderId: "25223231215",
  appId: "1:25223231215:web:13cd96bfecc1467c004d1a"
};

const app = initializeApp(firebaseConfig);

// ✅ Add this line
export const auth = getAuth(app);

export default app;















