
const PASS_TEXT = "DHAN";
const SALT_HEX = "498960e491150a0fc0f21822a147fd62";
const IV_HEX = "320ef7705d1030f0a1a55b3dcf676cb8";
const KEY_SIZE = 4;
const ITERATIONS = 1000;

function hexToArrayBuffer(hexString) {
    return new Uint8Array(hexString.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))).buffer;
}

function atobPolyfill(input) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = String(input).replace(/=+$/, '');
    if (str.length % 4 === 1) {
        throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    let output = '';
    for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
    }
    return output;
}

function base64ToArrayBuffer(base64) {
    var binary_string = atobPolyfill(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

async function generateKey(salt, password, keySize, iterations) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = hexToArrayBuffer(salt);

    const importedKey = await crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltBuffer,
            iterations: iterations,
            hash: "SHA-1"
        },
        importedKey,
        keySize * 32
    );

    return derivedBits.slice(0, 16);
}

async function decryptAesCbc256(cipheredText, key, iv) {
    const ivBuffer = hexToArrayBuffer(iv);
    const cipherBuffer = base64ToArrayBuffer(cipheredText);

    const importedKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-CBC" },
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv: ivBuffer },
        importedKey,
        cipherBuffer
    );

    return new TextDecoder().decode(decrypted);
}

export async function decryptDataDhan(data) {
    try {
        const key = await generateKey(SALT_HEX, PASS_TEXT, KEY_SIZE, ITERATIONS);
        const decryptedData = await decryptAesCbc256(data, key, IV_HEX);
        return decryptedData
    } catch (error) {
        console.error("Decryption failed:", error);
    }
}