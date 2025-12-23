const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log("--- Diagnostic Start ---");
const envPath = path.resolve(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log(".env file exists at:", envPath);
  const rawBuffer = fs.readFileSync(envPath);
  console.log("Raw File Buffer Hex (first 20 bytes):", rawBuffer.subarray(0, 20).toString('hex'));

  const config = dotenv.config();
  if (config.error) {
    console.error("Dotenv Config Error:", config.error);
  } else {
    console.log("Dotenv Parsed Keys:", Object.keys(config.parsed));
    console.log("GROQ_API_KEY value:", config.parsed.GROQ_API_KEY ? (config.parsed.GROQ_API_KEY.substring(0, 5) + "...") : "UNDEFINED");
    console.log("GROQ_API_KEY length:", config.parsed.GROQ_API_KEY ? config.parsed.GROQ_API_KEY.length : 0);
  }
} else {
  console.log(".env file NOT found!");
}
console.log("process.env.GROQ_API_KEY:", process.env.GROQ_API_KEY ? "Present" : "Missing");
console.log("--- Diagnostic End ---");
