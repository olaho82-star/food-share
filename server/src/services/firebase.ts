import admin from 'firebase-admin';

let db: admin.database.Database;

export function initFirebase() {
  if (admin.apps.length > 0) return;

admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL ||
      `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.europe-west1.firebasedatabase.app`,
  });
}

export function getDb(): admin.database.Database {
  if (!db) {
    initFirebase();
    db = admin.database();
  }
  return db;
}
