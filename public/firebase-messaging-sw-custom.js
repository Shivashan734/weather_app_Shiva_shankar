// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC99fFzS1zqGg9MOzXV_7M6Ny6zV8_i8wQ",
  authDomain: "weatherappfcm-7b5f5.firebaseapp.com",
  projectId: "weatherappfcm-7b5f5",
  storageBucket: "weatherappfcm-7b5f5.appspot.com",
  messagingSenderId: "335316728226",
  appId: "1:335316728226:web:cb8889f4b515e9702f1afb",
  measurementId: "G-WNQGLERRTZ"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
