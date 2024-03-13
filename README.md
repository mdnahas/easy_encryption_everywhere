# Easy Encryption Everywhere

Easy Encryption Everywhere creates password-protected files using high-level encryption and almost every receiver can decrypt them.

This is the source code for EEE.  If you want to password-protect a file, go to the working website at
https://michaeldnahas.com/EasyEncryptionEverywhere.html

## The Goal

My friend's company, [Unified Event Solutions](https://www.unifiedeventsolutions.com), needed to send important information to a client, but didn't know what encryption programs the receiver had on their machine.  I found out that most browsers since 2015 have high-level encryption in them: Web Cryptography API.  To access that encryption, I needed to send the client an HTML file that contained the encrypted file and make it easy for them to decrypt using their browser.

It wasn't hard to take this a step further: Make an HTML file that does the encrypting too!  That's what this repo does: makes an HTML file that encrypts files into HTML files, which can decrypt themselves.  

To write the encrypting HTML file was complicated.  So, I wrote another program to do that!  So, this repo contains a program that writes a program that writes a program.

## Compiling the code

The code is written in TypeScript and uses Node.js to manage packages.  Once you've installed Node.js's "npm", these are the Linux commands:

* npm install 
* tsc --watch   #compiles code from src/ to dist/
* cd dist
* cp ../src/*.html .
* node ./CreateEncryptingHTMLFile.js # executes the program that generates the html file

Then you open the new file "EasyEncryptionEverywhere.html".

## Testing 

There isn't much testing, but you can run it with:

* npm test

## Code Layout

It's best to explain this back-to-front.  Below are the files for the decrypting page. If you look at the template HTML file, it contains strings like "FILENAME" and "DECRYPTION_LIB".  

* [src/SelfDecryptingTemplate.html](https://github.com/mdnahas/easy_encryption_everywhere/blob/master/src/SelfDecryptingTemplate.html)
* [src/SelfDecryptingLib.ts](https://github.com/mdnahas/easy_encryption_everywhere/blob/master/src/SelfDecryptingLib.ts)

The next page is the encrypting page, which uses the files linked below.  The code replaces the strings "FILENAME" and "DECRYPTION_LIB" in src/SelfDecryptingTemplate.html with the actual values.  All the data (encrypted file, salt, initialization vector) are encoded in [base64](https://en.wikipedia.org/wiki/Base64) before being inserted into the decrypting template.  

* [src/EncryptingTemplate.html](https://github.com/mdnahas/easy_encryption_everywhere/blob/master/src/EncryptingTemplate.html)
* [src/EncryptingLib.ts](https://github.com/mdnahas/easy_encryption_everywhere/blob/master/src/EncryptingLib.ts)

To make this work, I need to store the decryption library (the compiled src/SelfDecryptingLib.ts) and decrypting HTML template inside the encrypting HTML file.  But how to do that?  There are 
many ways, but I chose to use what I was already using: base64.  So, I wrote a program to encode them with base64 and insert them into the encrypting HTML template.  This is the program and its library:

* [src/CreateEncryptingHTMLFile.ts](https://github.com/mdnahas/easy_encryption_everywhere/blob/master/src/CreateEncryptingHTMLFile.ts)
* [src/CreateEncryptingLib.ts](https://github.com/mdnahas/easy_encryption_everywhere/blob/master/src/CreateEncryptingLib.ts)

The only other code is the test code.  The ".spec.ts" extension indicates test code. 

* [src/EncryptDecryptLib.spec.ts](https://github.com/mdnahas/easy_encryption_everywhere/blob/master/src/EncryptDecryptLib.spec.ts)

