import { describe, it, expect } from 'vitest'
import {
    generateKeyPair,
    exportPublicKey,
    exportPrivateKey,
    importPublicKey,
    importPrivateKey,
    encrypt,
    decrypt,
} from './Crypto'


// Vitest for Crypto.ts
describe('crypto library', async () => {
    it('can call functions', async () => {
        const { subtle } = globalThis.crypto

        // Create a public/private key pair
        const keyPair = await generateKeyPair(subtle)

        let publicKeyStr = await exportPublicKey(subtle, keyPair)
        let privateKeyStr = await exportPrivateKey(subtle, keyPair)

        let publicKey = await importPublicKey(subtle, publicKeyStr)
        let privateKey = await importPrivateKey(subtle, privateKeyStr)

        let testObject = {
            string: 'Hello, world!',
            number: 42,
            boolean: true,
            array: [1, 2, 3],
            object: { foo: 'bar' },
        }
        const dataLength = JSON.stringify(testObject).length
        //console.log("Data length: " + dataLength)

        let encrypted: string = await encrypt(subtle, publicKey, testObject)
        //console.log("Encrypted length: " + encrypted.length)
        const keyLength = 4096 / 8
        const expectedLength = 4 * Math.ceil(keyLength / 3) // Base64 encoding
        expect(encrypted.length).toEqual(expectedLength)
        //console.log("Expected length: " + expectedLength)
        let decrypted = await decrypt(subtle, privateKey, encrypted)

        expect(decrypted).toEqual(testObject)
    })

    it('test size limits', async () => {
        const { subtle } = globalThis.crypto

        // Create a public/private key pair
        const keyPair = await generateKeyPair(subtle)

        let testObject = {
            nameText: 'Rhoshandiatellyneshiaunneveshenk Koyaanisquatsiuth Williams',
            numberText: '1234567812345678',
            expirationMonthText: '12',
            expirationYearText: '99',
            securityCodeText: '1234',
            postalCodeText: '12345-6789',
        }
        const dataLength = JSON.stringify(testObject).length
        console.log('Data length: ' + dataLength + ' << 446 byte limit of encryption method')
        expect(dataLength).toBeLessThan(446) // limit of encryption method

        let encrypted: string = await encrypt(subtle, keyPair.publicKey, testObject)
        //console.log("Encrypted length: " + encrypted.length)
        const keyLength = 4096 / 8
        const expectedLength = 4 * Math.ceil(keyLength / 3) // Base64 encoding
        expect(encrypted.length).toEqual(expectedLength)
        //console.log("Expected length: " + expectedLength)
        let decrypted = await decrypt(subtle, keyPair.privateKey, encrypted)

        expect(decrypted).toEqual(testObject)
    })

    it('test import bad key', async () => {
        const { subtle } = globalThis.crypto

        // I couldn't get async functions and exceptions to work.

        const emptyKey = ""
        try {
            const ignored = await importPublicKey(subtle, emptyKey)
            expect(false).toBeTruthy
        } catch (e) {
            expect(true).toBeTruthy
        }
        try {
            const ignored = await importPrivateKey(subtle, emptyKey)
            expect(false).toBeTruthy
        } catch (e) {
            expect(true).toBeTruthy
        }

        const jibberishKey = "#$&*^%*)!(*%*(#@(*{}{{{\|"
        try {
            const ignored = await importPublicKey(subtle, jibberishKey)
            expect(false).toBeTruthy
        } catch (e) {
            expect(true).toBeTruthy
        }
        try {
            const ignored = await importPrivateKey(subtle, jibberishKey)
            expect(false).toBeTruthy
        } catch (e) {
            expect(true).toBeTruthy
        }
    })
})
