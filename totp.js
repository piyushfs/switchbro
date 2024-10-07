// Base32 character set
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Convert base32 to array of bytes
function base32ToBytes(base32) {
    let bytes = [];
    let currentByte = 0;
    let bitsRemaining = 0;

    for (let char of base32.toUpperCase()) {
        let val = BASE32_CHARS.indexOf(char);
        if (val === -1) continue;  // Skip non-base32 characters

        currentByte = (currentByte << 5) | val;
        bitsRemaining += 5;

        if (bitsRemaining >= 8) {
            bitsRemaining -= 8;
            bytes.push((currentByte >> bitsRemaining) & 0xFF);
        }
    }

    return new Uint8Array(bytes);
}

// Left-pad a string with zeros
function leftPad(str, len = 6) {
    return str.length >= len ? str : '0'.repeat(len - str.length) + str;
}

// Generate HMAC-SHA1
async function hmacSha1(key, message) {
    const encoder = new TextEncoder();
    const keyBuffer = key instanceof Uint8Array ? key : encoder.encode(key);
    const messageBuffer = message instanceof Uint8Array ? message : encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        'raw', keyBuffer, { name: 'HMAC', hash: 'SHA-1' },
        false, ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
    return new Uint8Array(signature);
}

// Generate TOTP
export async function generateTOTP(secret, digits = 6, period = 30) {
    // Convert secret to bytes
    const secretBytes = base32ToBytes(secret);

    // Get current time step
    const timeStep = Math.floor(Date.now() / 1000 / period);

    // Create buffer for time
    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setBigUint64(0, BigInt(timeStep), false);

    // Generate HMAC
    const hmac = await hmacSha1(secretBytes, new Uint8Array(timeBuffer));

    // Get offset
    const offset = hmac[hmac.length - 1] & 0xf;

    // Generate OTP
    const binary = ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    const otp = binary % Math.pow(10, digits);

    return leftPad(otp.toString(), digits);
}