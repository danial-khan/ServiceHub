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

// Save private key (gitignored)
const keysDir = path.join(__dirname, '..', '.keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}
fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);

// Save public key to .keys (for reference)
fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);

// Format public key for XML (one-line, no headers)
const publicKeyBase64 = publicKey
  .replace('-----BEGIN PUBLIC KEY-----', '')
  .replace('-----END PUBLIC KEY-----', '')
  .replace(/\n/g, '');

// Write to Android strings.xml
const androidDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'values');
if (!fs.existsSync(androidDir)) {
  fs.mkdirSync(androidDir, { recursive: true });
}

const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="RepackPublicKey">${publicKeyBase64}</string>
</resources>
`;

fs.writeFileSync(path.join(androidDir, 'strings.xml'), stringsXml);

// Write to iOS Info.plist additions file
const iosDir = path.join(__dirname, '..', 'ios');
if (!fs.existsSync(iosDir)) {
  fs.mkdirSync(iosDir, { recursive: true });
}

const infoPlistAddition = `
<!-- Add this to your Info.plist: -->
<key>RepackPublicKey</key>
<string>${publicKeyBase64}</string>
`;

fs.writeFileSync(path.join(iosDir, 'RepackPublicKey.txt'), infoPlistAddition);

console.log('✅ Code signing keys generated and configured:');
console.log('   Private key: .keys/private.pem (gitignored)');
console.log('   Public key reference: .keys/public.pem');
console.log('   Android: android/app/src/main/res/values/strings.xml');
console.log('   iOS: ios/RepackPublicKey.txt (add to Info.plist manually)');
console.log('\n⚠️  The public key has been written to native configs and will be committed.');
console.log('   Only the private key (.keys/private.pem) remains gitignored.');
