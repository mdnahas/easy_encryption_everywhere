

export function stringToBase64(s: string) : string {
    if (typeof Buffer !== 'undefined') {
        // Node.js environment for testing.
        return Buffer.from(s).toString('base64');
    } else {
        // Browser environment
        return btoa(s);
    }
}

 


