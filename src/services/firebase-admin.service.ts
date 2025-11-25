import admin from "firebase-admin";
import env from "../utils/env";

const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountJson) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set");
}

const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountJson, "base64").toString("utf-8")
);

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin Initialized Successfully");
  } catch (error) {
    console.error("Firebase Admin Initialization Failed:", error);
  }
}

const messaging = admin.messaging();

export { messaging };
