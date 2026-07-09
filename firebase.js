import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// TODO: Replace with your actual Firebase config object
// You can find this in your Firebase Console under Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyA1KCz5UdkBMRf8rY68vGR9BqCuzc68SSM",
  authDomain: "aaq-bio-arranger-2627.firebaseapp.com",
  projectId: "aaq-bio-arranger-2627",
  storageBucket: "aaq-bio-arranger-2627.firebasestorage.app",
  messagingSenderId: "79390374495",
  appId: "1:79390374495:web:f769ea498e883b9f0db9ea"
};

let app, db, auth;

// Try to initialize Firebase, but catch errors if the config is still a placeholder
try {
  // Simple check to avoid running if placeholders aren't replaced
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Sign in anonymously to allow for secure database access without requiring user accounts
    signInAnonymously(auth).catch((error) => {
      console.error("Anonymous auth failed:", error);
    });
  } else {
    console.warn("Firebase config contains placeholders. Firebase will not initialize.");
  }
} catch (error) {
  console.warn("Firebase initialization failed.", error);
}

export async function fetchStateFromFirestore(calendarId) {
  if (!db) return null;
  try {
    const docRef = doc(db, "calendars", calendarId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().state;
    }
    return null;
  } catch (error) {
    console.error("Error fetching state:", error);
    return null;
  }
}

export async function syncStateToFirestore(calendarId, stateData) {
  if (!db) return false;
  try {
    await setDoc(doc(db, "calendars", calendarId), { 
      state: stateData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error saving state:", error);
    return false;
  }
}

export function generateCalendarId() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}
