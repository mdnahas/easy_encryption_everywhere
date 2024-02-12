// This program helps users securely distribute a file.
// Given a file and a password, it generates an HTML file.  
// The intent is that users can send the HTML file via
// email or place them on a website and transmit the password
// separately using a more secure channel.

// The file is encoded as an HTML file so we can 
// use the Web Crypto API to decrypt the file.
// As far as I can tell, this is the only high-security
// encryption available widely on people's computers!

// (NOTE: The other alternative is Excel's Office Open
// XML format. Excel added AES-256 in 2016.  The files
// are  readable by LibreOffice and Numbers.  Google 
// Sheets added beta support for it in 2023.  My opinion
// is that browsers are more commonly available and, 
// being free and a security risk, are more likely to be 
// up-to-date)

// Operation:
// This program takes a filename on the command line
// and a password.  It outputs an HTML file.
// The HTML file contains the file encrypted 
// with AES-256.  The encryption key is derived 
// from the password using PBKDF2.  
// When the HTML file is viewed in a browser,
// there is a textbox for the password and a submit button.
// When the user enters the password and clicks the button,
// the browser behaves like they are downloading the original file.

// Implemenation notes:
// There is another file, SelfDecryptingTemplate.html, 
// that contains most of the HTML and decryption code.  
// This file reads in that file and replaces the 
// placeholder text with the encrypted file. 
import { readFile, writeFile } from 'fs/promises';
import { bufferToUint8Array, encryptBuffer } from './CreateSelfExtractingFileLib.js';
import crypto from 'crypto';


async function main(filename: string, password : string) {
    // Read the file
    const fileBuffer : Buffer = await readFile(filename); // default encoding is 'binary'
    const fileUint8Array = bufferToUint8Array(fileBuffer);

    let [ base64EncodedSalt, base64EncodedIv, base64EncodedEncryptedFile ] = await encryptBuffer(crypto, fileUint8Array, password);

    let filenameWithoutDir = ""
    const lastSlashIndex = filename.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
        filenameWithoutDir = filename.substring(lastSlashIndex+1);
    } else {
        filenameWithoutDir = filename;
    }

    const decryptionJavascriptBuffer = await readFile('CreateSelfExtractingFileLib.js');
    let decryptionJavascript = decryptionJavascriptBuffer.toString();
    // remove export declations
    decryptionJavascript = decryptionJavascript.replace(/export /g, '');

    // Create the output file
    const htmlTemplate = await readFile('SelfDecryptingTemplate.html');

    const htmlFile = htmlTemplate.toString()
        .replace(/<!--FILENAME-->/g, filenameWithoutDir)
        .replace(/<!--ENCRYPTED_FILE-->/g, base64EncodedEncryptedFile)
        .replace(/<!--INITIALIZATION_VECTOR-->/g, base64EncodedIv)
        .replace(/<!--SALT-->/g, base64EncodedSalt)
        .replace(/\/\/<!--DECRYPTION_LIB-->/g, decryptionJavascript);

    // Write the output file
    const outputFilename = filename + '.ENCRYPTED.html';
    await writeFile(outputFilename, htmlFile);
    console.log(`Wrote ${outputFilename}`);

}


// Rest of the functions used in main()...
if (process.argv.length != 4) {
    console.log("Usage: node CreateSelfExtractingFile.js <filename> <password>");
    process.exit(1);
}
else {
    /*await*/ main(process.argv[2]!, process.argv[3]!).catch(console.error);
}
