const fs = require("fs");
const path = require("path");

// Load environment variables from .env file
require("dotenv").config();

const getEnvWithFallback = (key, fallback = "") => {
const value = process.env[key];
if (!value && fallback === undefined) {
console.warn(`Warning: Environment variable ${key} is not set`);
}
return value || fallback;
};

module.exports = ({ config }) => {
const iosPlistPath = path.resolve(**dirname, "GoogleService-Info.plist");
const androidJsonPath = path.resolve(**dirname, "google-services.json");

const hasIosPlist = fs.existsSync(iosPlistPath);
const hasAndroidJson = fs.existsSync(androidJsonPath);

return {
...config,
scheme: "bytebank",
expo: {
...config.expo,
extra: {
EXPO_PUBLIC_FIREBASE_API_KEY: getEnvWithFallback(
"EXPO_PUBLIC_FIREBASE_API_KEY"
),
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: getEnvWithFallback(
"EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"
),
EXPO_PUBLIC_FIREBASE_PROJECT_ID: getEnvWithFallback(
"EXPO_PUBLIC_FIREBASE_PROJECT_ID"
),
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: getEnvWithFallback(
"EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"
),
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: getEnvWithFallback(
"EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
),
EXPO_PUBLIC_FIREBASE_APP_ID: getEnvWithFallback(
"EXPO_PUBLIC_FIREBASE_APP_ID"
),
EXPO_PUBLIC_USE_MOCK: getEnvWithFallback(
"EXPO_PUBLIC_USE_MOCK",
"false"
),
EXPO_PUBLIC_BRAND: getEnvWithFallback("EXPO_PUBLIC_BRAND", "bytebank"),
EXPO_PUBLIC_THEME_MODE: getEnvWithFallback(
"EXPO_PUBLIC_THEME_MODE",
"light"
),
},
},
ios: {
...config.ios,
...(hasIosPlist
? { googleServicesFile: "./GoogleService-Info.plist" }
: {}),
},
android: {
...config.android,
...(hasAndroidJson
? { googleServicesFile: "./google-services.json" }
: {}),
},
};
};
