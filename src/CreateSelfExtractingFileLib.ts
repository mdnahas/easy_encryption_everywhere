export function bufferToUint8Array(buffer : Buffer) : Uint8Array {
    const len = buffer.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = buffer[i];
    }

    return bytes;
}


// Node.js and browser have different environments and
// different ways of converting between strings and binary data.
export function base64ToUint8Array(base64 : string) : Uint8Array{
    if (typeof Buffer !== 'undefined') {
        // Node.js environment
        return bufferToUint8Array(Buffer.from(base64, 'base64'));
    } else if (typeof atob !== 'undefined') {
        // Browser environment
        let binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
    
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
    
        return bytes;
    } else {
        throw new Error('No suitable base64 decoding method found');
    }
}



/* Compiled version of this function AND ALL HELPER FUNCTIONS
   should be in SelfExtractingTemplate.html  */
export async function decryptString(crypto, password: string, base64EncodedSalt: string, base64EncodedIv: string, base64EncodedEncryptedFile: string) : Promise<Uint8Array>{

    let salt : Uint8Array = base64ToUint8Array(base64EncodedSalt)

    // Derive a key from the password
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    const aesKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt.buffer,
            iterations: 100000,
            hash: 'SHA-256'
        },
        key,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // Decrypt the file
    const iv  : Uint8Array = base64ToUint8Array(base64EncodedIv)
    const encryptedFile  : Uint8Array = base64ToUint8Array(base64EncodedEncryptedFile)
    const decryptedFile : ArrayBuffer = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv.buffer
        },
        aesKey,
        encryptedFile
    );

    return new Uint8Array(decryptedFile);
}


export async function encryptBuffer(crypto, fileUint8Array : Uint8Array, password: string) : Promise<[string, string, string]> {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Derive a key from the password
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    const aesKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        key,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // Encrypt the file
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedFile = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        aesKey,
        fileUint8Array.buffer
    );

    const base64EncodedSalt = btoa(String.fromCharCode.apply(null, new Uint8Array(salt)));
    const base64EncodedIv = btoa(String.fromCharCode.apply(null, new Uint8Array(iv)));
    const base64EncodedEncryptedFile = btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedFile)));

    return [ base64EncodedSalt, base64EncodedIv, base64EncodedEncryptedFile, ];
}


