import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } catch {
    console.warn("Firebase Admin SDK initialization failed — auth routes will be unavailable");
    admin.initializeApp();
  }
}

export default admin;
export const auth = admin.auth();
