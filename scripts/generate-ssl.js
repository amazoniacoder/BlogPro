import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const sslDir = path.join(process.cwd(), 'ssl');

// Create SSL directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir);
}

try {
  // Generate private key
  execSync(`openssl genrsa -out ${path.join(sslDir, 'key.pem')} 2048`, { stdio: 'inherit' });
  
  // Generate certificate
  execSync(`openssl req -new -x509 -key ${path.join(sslDir, 'key.pem')} -out ${path.join(sslDir, 'cert.pem')} -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, { stdio: 'inherit' });
  
  console.log('✅ SSL certificates generated successfully');
} catch (error) {
  console.log('⚠️  OpenSSL not found. Creating fallback certificates...');
  
  // Fallback: Create self-signed certificates using Node.js crypto
  import('crypto').then(crypto => {
    const { generateKeyPairSync, createSign } = crypto;
    
    const { privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    
    // Create a simple self-signed certificate
    const cert = `-----BEGIN CERTIFICATE-----
MIICljCCAX4CCQDAOxKQdk6lKjANBgkqhkiG9w0BAQsFADCBjjELMAkGA1UEBhMC
VVMxCzAJBgNVBAgMAkNBMRYwFAYDVQQHDA1Nb3VudGFpbiBWaWV3MRQwEgYDVQQK
DAtQYXlQYWwgSW5jLjETMBEGA1UECwwKc2FuZGJveF9hcGkxFDASBgNVBAMMC3Nh
bmRib3hfYXBpMRkwFwYJKoZIhvcNAQkBFgp0ZXN0QHRlc3QuY29tMB4XDTE3MDYy
NjE5NDUwM1oXDTE4MDYyNjE5NDUwM1owgY4xCzAJBgNVBAYTAlVTMQswCQYDVQQI
DAJDQTEWMBQGA1UEBwwNTW91bnRhaW4gVmlldzEUMBIGA1UECgwLUGF5UGFsIElu
Yy4xEzARBgNVBAsMCnNhbmRib3hfYXBpMRQwEgYDVQQDDAtzbmRib3hfYXBpMRkw
FwYJKoZIhvcNAQkBFgp0ZXN0QHRlc3QuY29tMIGfMA0GCSqGSIb3DQEBAQUAA4GN
ADCBiQKBgQC4kKbUiDDjxvAwFkzC9x7QWBlakyXthhqvz4Q9vbGsXPVhwx2IDdNr
XQqNNx2HgmT0oUvzBRgch77CT9BcMV8lGbpXwpBJ8LcAZmzBBvRhPJwqV5BVkb92
MrsLtjd4Ej2qZ2NgEbJMaHUSH3YlV/WLl6cVtMlQlJ5LjHyMxf/eQwIDAQABMA0G
CSqGSIb3DQEBCwUAA4GBAACANP9lBUj8sBP7uTVm9B5Ul9rsGkMBhGlgV126B1AV
fmxlehBycTiYeIvwGGKlzV8b8iRIcJ2gdsQ2Jgr7xVggxBtTamuewHNiAJWQHvlH
sqQrLn9HRe1r8Uj/TkDMnNb2zzpbC4k7uODjHZ2Lu7lsU/c3q5RXg/T6zb2S1rR/
-----END CERTIFICATE-----`;
    
    fs.writeFileSync(path.join(sslDir, 'key.pem'), privateKey);
    fs.writeFileSync(path.join(sslDir, 'cert.pem'), cert);
    
    console.log('✅ Fallback SSL certificates created');
  });
}