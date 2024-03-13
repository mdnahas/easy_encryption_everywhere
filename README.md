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

## Encryption parameters

I've got a Masters of Computer Science and knew a bunch of the basics of encryption when I started.  But encryption is tricky.  To avoid problems, I used public examples and kept the code as simple as possible.

For encryption, I used AES-GCM with 256-bit keys and a 96-bit initialization vector.  It is well-known and widely used.  And used by the US government to encrypt Top Secret files.

For the password, the only option in Web Cryptography API was PBKDF2.  The example code used SHA-256, so I assumed that was the most widely available algorithm.  I saw recommendations to use SHA-512 over SHA-256, but, as far as I could tell, those recommendations were for directly using the algorithm for hashing and not as part of PBKDF2.  I found that OWASP was still recommending PBKDF2-HMAC-SHA256 in 2023 with 600,000 iterations.  So, I went with that.

The lengths of salt and initialization vectors were based on what I found recommended.

I didn't trust users (including myself!) to generate their own passwords.  I added a function to generate 20-character random passwords.  
