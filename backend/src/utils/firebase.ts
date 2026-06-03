import * as admin from 'firebase-admin';
import { config } from './config';

if (!admin.apps.length) {
  if (config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
  } else {
    console.warn("Firebase Admin credentials missing. Firebase authentication will fail.");
  }
}

export const firebaseAdmin = admin;
