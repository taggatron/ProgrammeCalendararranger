import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// TODO: Replace with your actual Firebase config object
// You can find this in your Firebase Console under Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
