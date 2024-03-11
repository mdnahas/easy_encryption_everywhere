export async function encryptBuffer(crypto, subtle, fileUint8Array : Uint8Array, password: string) : Promise<[string, string, string]> {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));

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
            salt: salt,
            iterations: 600000,
            hash: 'SHA-256'
        },
        key,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // Encrypt the file
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedFile = await subtle.encrypt(
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


export function base64ToString(s : string) : string {
    if (typeof Buffer !== 'undefined') {
        // Node.js environment for testing.
        return Buffer.from(s, 'base64').toString('utf-8');
    } else {
        // Browser environment
        return atob(s);
    }
}  


export async function generateEncryptedHmtlFile(crypto,
                                                subtle,
                                                fileUint8Array : Uint8Array, 
                                                password : string,
                                                filenameWithoutDir : string,
                                                base64selfDecryptingLibSource : string,
                                                base64selfDecryptingTemplate: string
                                                ) : Promise<string> {

    

    let [ base64EncodedSalt, base64EncodedIv, base64EncodedEncryptedFile ] = await encryptBuffer(crypto, subtle, fileUint8Array, password);


    // Remove export declations from decryption library
    let selfDecryptingLibSource = base64ToString(base64selfDecryptingLibSource);
    selfDecryptingLibSource = selfDecryptingLibSource.replace(/export /g, '');

    // Write library and encrypted file into the template
    let selfDecryptingTemplate = base64ToString(base64selfDecryptingTemplate);
    const htmlFile = selfDecryptingTemplate
        .replace(/<!--FILENAME-->/g, filenameWithoutDir)
        .replace(/<!--ENCRYPTED_FILE-->/g, base64EncodedEncryptedFile)
        .replace(/<!--INITIALIZATION_VECTOR-->/g, base64EncodedIv)
        .replace(/<!--SALT-->/g, base64EncodedSalt)
        .replace(/\/\/<!--DECRYPTION_LIB-->/g, selfDecryptingLibSource);

    return htmlFile;
}

export function generateRandomPassword(crypto) : string{
    const LENGTH = 24

    // No 0,O,1,l,I
    // About 60 values
    const charset = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let randArray = new Uint8Array(LENGTH*4);  // 4 is a huge safety factor.
    crypto.getRandomValues(randArray);

    let retVal = "";
    let randIndex = 0;
    while (retVal.length < LENGTH) {
        let rand = randArray[randIndex] % 64
        randIndex++;

        if (rand < charset.length) { 
            retVal += charset.charAt(rand);
            if (retVal.length % 5 == 4 && retVal.length != LENGTH) {
                retVal += "-";
            }
        }
    }

    return retVal;
}
