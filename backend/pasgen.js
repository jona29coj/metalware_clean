// pasgen.js
const bcrypt = require("bcrypt");

// Number of salt rounds
const saltRounds = 10;

// Take the string from command line arguments
const input = process.argv[2];

if (!input) {
  console.error("❌ Please provide a string to hash. Example: node pasgen.js mypassword");
  process.exit(1);
}

// Hash the string
bcrypt.hash(input, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error generating hash:", err);
    process.exit(1);
  }
  console.log("✅ Bcrypt hash:", hash);
});
