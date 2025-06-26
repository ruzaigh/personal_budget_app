import type { FirebaseOptions } from "firebase/app";

export const getFirebaseConfig = (): FirebaseOptions => {
  const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  };

  // Validate required fields
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];
  const missingFields = requiredFields.filter(
    (field) => !config[field as keyof typeof config],
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing Firebase configuration environment variables: ${missingFields.join(", ")}`,
    );
  }

  return config as FirebaseOptions;
};
