// firebaseAdmin.ts
import admin from "firebase-admin";
import * as path from 'path';

// Set the path to the firebase-admin.json file
const serviceAccountPath = path.resolve(__dirname, './firebase-admin.json');

// Load the service account credentials
// const serviceAccount = require(serviceAccountPath);

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set');
}

const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountJson, 'base64').toString('utf-8')
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