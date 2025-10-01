// Test script for password hashing
// Run with: node test-password-hash.js

const bcrypt = require('bcryptjs');

const password = 'Mayank2003';
const saltRounds = 12;

console.log('Password:', password);
console.log('Salt Rounds:', saltRounds);

// Generate hash
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  console.log('Generated Hash:', hash);
  
  // Verify the hash
  bcrypt.compare(password, hash, (err, result) => {
    if (err) {
      console.error('Error verifying hash:', err);
      return;
    }
    
    console.log('Verification Result:', result ? 'PASS' : 'FAIL');
  });
});
