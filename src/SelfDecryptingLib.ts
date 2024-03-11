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
        // Node.js environment for testing.
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
export async function decryptString(crypto, subtle, password: string, base64EncodedSalt: string, base64EncodedIv: string, base64EncodedEncryptedFile: string) : Promise<Uint8Array|null>{

    let salt : Uint8Array = base64ToUint8Array(base64EncodedSalt)

    // Derive a key from the password
    const key = await subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    const aesKey = await subtle.deriveKey(
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

    try {
        const decryptedFile : ArrayBuffer = await subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv.buffer
            },
            aesKey,
            encryptedFile
        );

        return new Uint8Array(decryptedFile);
    } catch (e) {
        console.error(e);
        return null;
    }
}

