// Vitest test for CreateSelfExtractingFile.ts
import { describe, it, expect } from 'vitest'
import { base64ToString, encryptBuffer } from './EncryptingLib';
import { base64ToUint8Array, decryptString } from './SelfDecryptingLib';

import crypto from 'crypto';
import { stringToBase64 } from './CreateEncryptingLib';

describe('encrypt and decrypt', async () => {
    it('inverses', async () => {
        const password = "password";
        const fileContents = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        let [ base64EncodedSalt, base64EncodedIv, base64EncodedEncryptedFile ] = await encryptBuffer(crypto, crypto.subtle, fileContents, password);
        const decryptedFile = await decryptString(crypto, crypto.subtle, password, base64EncodedSalt, base64EncodedIv, base64EncodedEncryptedFile);
        expect(decryptedFile).toEqual(fileContents);
    });
});

describe('base64ToString and stringToBase64', async () => {
    it('inverses', async () => {
        let s = ""
        expect(base64ToString(stringToBase64(s))).toEqual(s);
        expect(stringToBase64(s)).toEqual(s);  // base64 of empty string is an empty string
        s = "smith"
        expect(base64ToString(stringToBase64(s))).toEqual(s);
        expect(stringToBase64(s)).not.toEqual(s);
    });
});

describe('base64ToInt8Array', async () => {
    it('basics', async () => {
        let s = ""
        let result = base64ToUint8Array(s);
        expect(result).toEqual(new Uint8Array());

        s = "ABC";
        result = base64ToUint8Array(stringToBase64(s));
        expect(result).toEqual(new Uint8Array([65, 66, 67]));
    });
});



