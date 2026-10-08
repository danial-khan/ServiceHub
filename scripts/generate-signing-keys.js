#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

const keysDir = path.join(__dirname, '..', '.keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);

console.log('✅ Code signing keys generated:');
console.log('   Private key: .keys/private.pem (gitignored)');
console.log('   Public key: .keys/public.pem');
console.log('\n📝 Add public key to your native projects:');
console.log('   Android: android/app/src/main/assets/public.pem');
console.log('   iOS: ios/public.pem (add to Xcode project)');
