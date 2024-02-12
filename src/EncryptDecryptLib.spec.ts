// Vitest test for CreateSelfExtractingFile.ts
import { describe, it, expect } from 'vitest'
import { encryptBuffer } from './EncryptingLib';
import { decryptString } from './SelfDecryptingLib';

import crypto from 'crypto';

describe('encrypt and decrypt', async () => {
    it('inverses', async () => {
        const password = "password";
        const fileContents = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        let [ base64EncodedSalt, base64EncodedIv, base64EncodedEncryptedFile ] = await encryptBuffer(crypto, fileContents, password);
        const decryptedFile = await decryptString(crypto, password, base64EncodedSalt, base64EncodedIv, base64EncodedEncryptedFile);
        expect(decryptedFile).toEqual(fileContents);
    });
});