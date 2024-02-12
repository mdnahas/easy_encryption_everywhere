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
