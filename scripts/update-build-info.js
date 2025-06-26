#!/usr/bin/env node

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env.local");

// Function to format date with time
function getFormattedDate() {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, "0");

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return `${year}.${month}.${day}.${hours}.${minutes}.${seconds}`;
}

// Read current env file or initialize default values
let envConfig = {};
try {
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envConfig = dotenv.parse(envFile);
  }
} catch (error) {
  console.error("Error reading .env file:", error);
}

// Get current version or set default
let currentVersion = envConfig.VITE_APP_VERSION || "000";

// Remove any non-numeric characters and convert to number
let versionNumber = parseInt(currentVersion.replace(/\D/g, "")) || 0;

// Increment the version
versionNumber += 1;

// Ensure we have a 3-digit version with leading zeros
const newVersion = String(versionNumber).padStart(3, "0");

// Update env config
envConfig.VITE_APP_VERSION = newVersion;
envConfig.VITE_APP_LAST_BUILD_DATE = getFormattedDate();

// Generate env content
const envContent = Object.entries(envConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n");

// Write back to .env file
fs.writeFileSync(envPath, envContent);

console.log(`Version updated to ${newVersion}`);
console.log(`Build date set to ${envConfig.VITE_APP_LAST_BUILD_DATE}`);
