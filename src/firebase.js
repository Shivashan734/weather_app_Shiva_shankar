// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC99fFzS1zqGg9MOzXV_7M6Ny6zV8_i8wQ",
  authDomain: "weatherappfcm-7b5f5.firebaseapp.com",
  projectId: "weatherappfcm-7b5f5",
  storageBucket: "weatherappfcm-7b5f5.appspot.com",
  messagingSenderId: "335316728226",
  appId: "1:335316728226:web:cb8889f4b515e9702f1afb",
  measurementId: "G-WNQGLERRTZ"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
