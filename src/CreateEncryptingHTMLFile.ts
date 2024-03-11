
import { readFile, writeFile } from 'fs/promises';
import { stringToBase64 } from './CreateEncryptingLib.js';


async function main() {

    const selfDecryptingLibSourceBuffer = await readFile('SelfDecryptingLib.js');
    const selfDecryptingLibSource = selfDecryptingLibSourceBuffer.toString();
    const base64selfDecryptingLibSource = stringToBase64(selfDecryptingLibSource);

    // Create the output file
    const selfDecryptingTemplateBuffer = await readFile('SelfDecryptingTemplate.html');
    const selfDecryptingTemplate = selfDecryptingTemplateBuffer.toString()
    const base64selfDecryptingTemplate = stringToBase64(selfDecryptingTemplate);

    const encryptingLibSourceBuffer = await readFile('EncryptingLib.js');
    let encryptingLibSource = encryptingLibSourceBuffer.toString();

    const encryptingTemplateBuffer = await readFile('EncryptingTemplate.html');
    let encryptingTemplate = encryptingTemplateBuffer.toString();

    // Remove export declations from encryption library
    encryptingLibSource = encryptingLibSource.replace(/export function/g, 'function');

    // Write library and encrypted file into the template
    const htmlFile = encryptingTemplate
            .replace(/<!--DECRYPT_LIB_BASE64-->/g, base64selfDecryptingLibSource)
            .replace(/<!--DECRYPT_TEMPLATE_BASE64-->/g, base64selfDecryptingTemplate)
            .replace(/\/\/<!--ENCRYPTION_LIB-->/g, encryptingLibSource);
    
    // Write the output file
    const outputFilename = 'EasyEncryptionEverywhere.html';
    await writeFile(outputFilename, htmlFile);
    console.log(`Wrote ${outputFilename}`);

}

// Rest of the functions used in main()...
if (process.argv.length != 2) {
    console.log("Usage: node CreateEncryptingHTMLFile.js");
    process.exit(1);
}
else {
    /*await*/ main().catch(console.error);
}