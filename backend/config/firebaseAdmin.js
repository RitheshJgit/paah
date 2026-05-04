import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = path.join(
  process.cwd(),
  "config",
  "serviceAccountKey.json"
);

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error("❌ serviceAccountKey.json not found in /config");
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("🔥 Firebase Admin Initialized");

export default admin;