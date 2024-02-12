// A library for working with the Crypto Web API (a.k.a. "SubtleCrypto")

// Test if the browser supports the Crypto API
export function getSubtleCryptoInBrowser() {
    if (typeof window === 'undefined') {
        throw new Error('window is undefined')
    }
    if (typeof window.crypto === 'undefined') {
        throw new Error('window.crypto is undefined')
    }
    if (typeof window.crypto.subtle === 'undefined') {
        if (typeof window.crypto.webkitSubtle !== 'undefined') {
            // Older Safari versions uses 'webkitSubtle' instead of 'subtle'
            return window.crypto.webkitSubtle
        }
        throw new Error('window.crypto.subtle is undefined')
    }
    return window.crypto.subtle
}

// Using RSA-OAEP, which I believe is supported by more browsers.

// Key length: 4096 bits
// RSA-OAEP can encrypt up to keyLength/8 - 2*HashDigestSize - 2 bytes.
// The SHA-256 digest size is 32 bytes.
// So, for a 4096-bit key, the maximum plaintext size is 4096/8 - 2*32 - 2 = 446 bytes.
//
// JSON formatting should use about 170 bytes.
// That leaves 276 bytes for the actual data.
// I could probably get by with 2048-bit key, but 4096-bit gives plenty of room.
// (If the data was larger, we could encrypt the data with a symmetric key, 
// and encrypt the symmetric key with the public key.)
//
// (NOTE: The encrypted text is Base64 encoded, but that is applied AFTER encryption,
// so it doesn't reduce the amount of data that can be encrypted.)

// This is the amount of random padding to include in the message.
// It is set to 0 because RSA-OAEP already includes randomized padding.
const BYTES_OF_PADDING = 0

// Generate a public/private key pair
export async function generateKeyPair(subtle: SubtleCrypto) {
    return await subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
    )
}

// Export public key to string
export async function exportPublicKey(subtle: SubtleCrypto, keyPair: CryptoKeyPair) {
    // 'jwk' is JSON Web Key format
    const publicKey = await subtle.exportKey('jwk', keyPair.publicKey)
    return JSON.stringify(publicKey)
}

// Export private key to string
export async function exportPrivateKey(subtle: SubtleCrypto, keyPair: CryptoKeyPair) {
    // 'jwk' is JSON Web Key format
    const privateKey = await subtle.exportKey('jwk', keyPair.privateKey)
    return JSON.stringify(privateKey)
}

// Import public key from string
export async function importPublicKey(subtle: SubtleCrypto, s: string) {
    const json = JSON.parse(s)
    return await subtle.importKey(
        'jwk',
        json,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        true,
        ['encrypt']
    )
}

// Import private key from string
export async function importPrivateKey(subtle: SubtleCrypto, s: string) {
    const json = JSON.parse(s)
    return await subtle.importKey(
        'jwk',
        json,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        true,
        ['decrypt']
    )
}

// Encrypt a object with a public key
//   * The object is first converted to a JSON string.
//   * Randomized padding is added to the string to prevent known-plaintext attacks.
//   * The string is encrypted with the public key.
//   * The result is converted to a Base64 string.
export async function encrypt(subtle: SubtleCrypto, publicKey: CryptoKey, obj: object) {
    const plaintext = new TextEncoder().encode(JSON.stringify(obj))
    const padding = new Uint8Array(BYTES_OF_PADDING)
    const paddedPlaintext = new Uint8Array(padding.length + plaintext.length)
    paddedPlaintext.set(padding)
    paddedPlaintext.set(plaintext, padding.length)

    return await subtle.encrypt(
        {
            name: 'RSA-OAEP'
        },
        publicKey,
        paddedPlaintext
    ).then(ciphertext => {
        const uint8Array = new Uint8Array(ciphertext);
        const numberArray : number[] = Array.from(uint8Array);
        const base64 = btoa(String.fromCharCode.apply(null, numberArray))
        return base64
    })
}


// Decrypt a Base64 string into an object with a private key
//  * The Base64 string is converted to an ArrayBuffer.
//  * The ArrayBuffer is decrypted with the private key.
//  * The padding is removed from the resulting string.
//  * The JSON string is converted to an object.
export async function decrypt(subtle: SubtleCrypto, privateKey: CryptoKey, base64: string) {
    const ciphertext = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const paddedPlaintext = await subtle.decrypt(
        {
            name: 'RSA-OAEP',
        },
        privateKey,
        ciphertext
    )
    const plaintext = paddedPlaintext.slice(BYTES_OF_PADDING)
    const object = JSON.parse(new TextDecoder().decode(plaintext))
    return object
}

export async function sha256OfString(str : string) {
    // Encode the string as a Uint8Array
    const encoder = new TextEncoder()
    const data = encoder.encode(str)

    // Hash the data using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    // Convert the buffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    return hashHex
}
