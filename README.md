# Easy Encryption Everywhere

Encrypt and decrypt files in a browser, as easy as upload and download a file.

## The Goal

I needed to send important information to a client, but didn't know what encryption programs they had on their machine.  I found out that most browsers since 2015 have high-level encryption in them: Web Cryptography API.  To access that encryption, I needed to send my client an HTML file that contained the encrypted file and  made it easy for them to decrypt using their browser.

It wasn't hard to take this a step further: Make an HTML file that does the encrypting too!  That's what this repo does: makes an HTML file that encrypts files into HTML files, which can decrypt themselves.  

