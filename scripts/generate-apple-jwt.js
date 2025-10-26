#!/usr/bin/env node

/**
 * Generate Apple Sign In JWT (Client Secret)
 *
 * This script generates a JWT token required for Apple Sign In authentication.
 * The token is used to authenticate your service with Apple's servers.
 *
 * Usage:
 *   node scripts/generate-apple-jwt.js
 *
 * The generated JWT is valid for 6 months (maximum allowed by Apple).
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Apple Sign In Configuration
const CONFIG = {
  teamId: 'MQY423BU9T',
  clientId: 'com.lumbus.app.signin', // This is your Service ID
  keyId: 'BSJA7B55F5',
  // Path to your .p8 private key file
  privateKeyPath: path.join(__dirname, 'AuthKey_BSJA7B55F5.p8'),
};

// Alternative: Use private key directly (uncomment if you don't have a separate .p8 file)
const PRIVATE_KEY_CONTENT = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgYNbn3BTxjQAVxPpq
FYIc3RIi+E51kgkCG/WKwBqzuJOgCgYIKoZIzj0DAQehRANCAAQh4K8Wds+yyICW
AbemDXGJySgNMQ5bscUTGRq0KHf1Mr70ZeWF5V2OImCJwdYO4OfBsXRputKEUFDY
wR6bE/Bq
-----END PRIVATE KEY-----`;

/**
 * Base64 URL encoding (RFC 4648)
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate JWT for Apple Sign In
 */
function generateAppleJWT() {
  try {
    // Read private key
    let privateKey;
    if (fs.existsSync(CONFIG.privateKeyPath)) {
      console.log('📄 Reading private key from file:', CONFIG.privateKeyPath);
      privateKey = fs.readFileSync(CONFIG.privateKeyPath, 'utf8');
    } else {
      console.log('📄 Using embedded private key');
      privateKey = PRIVATE_KEY_CONTENT;
    }

    // JWT Header
    const header = {
      alg: 'ES256',
      kid: CONFIG.keyId,
      typ: 'JWT'
    };

    // JWT Claims (Payload)
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = now + (86400 * 180); // 180 days (6 months - Apple's maximum)

    const payload = {
      iss: CONFIG.teamId,
      iat: now,
      exp: expirationTime,
      aud: 'https://appleid.apple.com',
      sub: CONFIG.clientId
    };

    console.log('\n📋 JWT Configuration:');
    console.log('   Team ID:', CONFIG.teamId);
    console.log('   Client ID (Service ID):', CONFIG.clientId);
    console.log('   Key ID:', CONFIG.keyId);
    console.log('   Issued At:', new Date(now * 1000).toISOString());
    console.log('   Expires At:', new Date(expirationTime * 1000).toISOString());
    console.log('   Valid for:', Math.floor((expirationTime - now) / 86400), 'days');

    // Encode header and payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    // Create signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const sign = crypto.createSign('SHA256');
    sign.update(signatureInput);
    sign.end();

    const signature = sign.sign(privateKey);
    const encodedSignature = signature
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Combine to create JWT
    const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

    console.log('\n✅ JWT Generated Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔑 YOUR APPLE SIGN IN CLIENT SECRET (JWT):\n');
    console.log(jwt);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 NEXT STEPS:\n');
    console.log('1. Copy the JWT token above');
    console.log('2. Go to Supabase Dashboard → Authentication → Providers → Apple');
    console.log('3. Enable Apple Sign In');
    console.log('4. Configure with these values:');
    console.log('   - Client ID (Services ID): com.lumbus.app.signin');
    console.log('   - Secret Key (Client Secret): [Paste the JWT above]');
    console.log('   - Team ID: MQY423BU9T');
    console.log('   - Key ID: BSJA7B55F5');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - This JWT expires in 6 months');
    console.log('   - You will need to regenerate it before:', new Date(expirationTime * 1000).toISOString());
    console.log('   - Save this JWT securely (treat it like a password)\n');

    // Save to file for convenience
    const outputPath = path.join(__dirname, 'apple-client-secret.txt');
    fs.writeFileSync(outputPath, jwt, 'utf8');
    console.log('💾 JWT also saved to:', outputPath);
    console.log('   (You can delete this file after copying the token)\n');

    return jwt;

  } catch (error) {
    console.error('\n❌ Error generating JWT:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure your private key is in the correct format');
    console.error('2. Verify that all configuration values are correct');
    console.error('3. Check that you have the required Node.js crypto module');
    process.exit(1);
  }
}

// Run the generator
if (require.main === module) {
  console.log('\n🍎 Apple Sign In JWT Generator\n');
  generateAppleJWT();
}

module.exports = { generateAppleJWT };
