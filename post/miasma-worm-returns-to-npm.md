---
excerpt: "AsyncAPI npm packages previously compromised during Shai-Hulud: The Second Coming were hijacked again, this time to deliver Miasma v3. The malicious releases use valid npm provenance, execute when loaded, and install a persistent cross-platform backdoor."
title: "Miasma Worm Returns to npm"
date: "July 14, 2026"
description: "Guy Korolevski, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/miasma-worm-returns-to-npm/banner.png
type: realTimePost
minutes: '11'
---

![](/img/RealTimePostImage/post/miasma-worm-returns-to-npm/banner.png)

Four AsyncAPI npm packages previously hijacked in the [Shai-Hulud: The Second Coming](https://research.jfrog.com/post/shai-hulud-the-second-coming/) campaign were compromised again: `@asyncapi/generator`, `@asyncapi/generator-helpers`, `@asyncapi/generator-components`, and `@asyncapi/specs`. This time, the malicious versions deliver **Miasma v3**, a new variant of the [Miasma worm](https://research.jfrog.com/post/shai-hulud-miasma-redhat-cloud-services/) that JFrog Security Research recently found in hijacked Red Hat npm packages.

Unlike the previous Miasma wave, these packages **do not execute malware during installation**. The malicious code runs when an application or build process loads the poisoned library. It then downloads a second payload from IPFS via HTTP and starts a persistent Node.js backdoor capable of receiving arbitrary shell commands.

Once we de-obfuscated, decoded and decrypted the payload, the fully readable, configurable payload was revealed.

Organizations that used these versions should not treat their presence in a lockfile as proof of execution. Exposure depends on whether the affected code was loaded. However, any developer machine, CI runner, documentation pipeline, or build system that loaded one of the packages should be considered potentially compromised and investigated immediately.

![](/img/RealTimePostImage/post/miasma-worm-returns-to-npm/image1.png)

## What users need to know

The malicious package versions contain the same obfuscated downloader. When triggered, it creates a hidden Node.js process, downloads `sync.js` from an IPFS gateway, stores it in a plausible-looking `NodeJS` directory inside the user's profile, and launches it in the background.

The downloaded payload identifies itself as `Miasma v3`. Its active configuration enables persistence, command-and-control communication, arbitrary shell execution, and remote payload replacement. Although the codebase also contains credential theft, package propagation, AI-tool poisoning, and metamorphic mutation modules, **those capabilities are disabled** in this deployment's baked configuration. This distinction is important: the sample comes from the Miasma worm family, but the observed configuration uses it primarily as a persistent **remote access trojan** (RAT) rather than a self-spreading npm worm.

The active shell channel still gives the attacker access to data and credentials available to the compromised user. On a developer workstation or CI runner, that can include source code, npm and GitHub credentials, cloud identities, signing material, and deployment secrets.

## The same AsyncAPI packages, a different Miasma attack

The four package names also appeared in the November 2025 Shai-Hulud campaign, with different compromised versions:

| Package | Previous Shai-Hulud versions | Current Miasma v3 version |
| :---- | :---- | :---- |
| `@asyncapi/generator` | `2.8.5`, `2.8.6` | `3.3.1` |
| `@asyncapi/generator-components` | `0.3.2`, `0.3.3` | `0.7.1` |
| `@asyncapi/generator-helpers` | `0.2.1`, `0.2.2` | `1.1.1` |
| `@asyncapi/specs` | `6.8.2`, `6.8.3`, `6.9.1`, `6.10.1` | `6.11.2`, `6.11.2-alpha.1` |

This recurrence does not mean the original malicious releases remained active, in fact malicious versions from the previous Shai-Hulud are removed from npm. The current incident uses new versions, a different delivery chain, different infrastructure, and a substantially changed payload.

The June 2026 Miasma wave used install-time hooks in hijacked `@redhat-cloud-services` packages. It installed or invoked Bun, collected credentials, propagated through package registries and GitHub, and used attacker-created GitHub repositories as a dead drop. The AsyncAPI deployment instead uses Node.js throughout, triggers when a poisoned module is loaded, installs a persistent `sync.js` payload, and communicates through attacker-controlled HTTP infrastructure with several decentralized fallback mechanisms.

## A trusted workflow published malicious code

The malicious packages were published through AsyncAPI's legitimate GitHub Actions release workflow using npm's OIDC trusted-publisher integration. The resulting npm packages carry valid provenance attestations.

The attack began with an unauthorized commit pushed directly to the repository's `next` branch. Following that, the project's `release-with-changesets.yml` workflow started. The packages were subsequently published through legitimate AsyncAPI release infrastructure. Their provenance records point to legitimate project repositories and workflows rather than an attacker-controlled npm publisher.

This is the limitation of package provenance; if an attacker can modify a release-triggering branch, the project's real CI/CD pipeline can produce correctly signed, fully traceable malicious packages.

The injected commit also carried the following identity metadata: `"Your Name" <you@example.com>`, an unsigned commit associated with GitHub's invalid-email placeholder. More importantly, the branch accepted a direct push that reached an unattended publishing workflow. Release branches need enforced review, strict branch protection, and narrowly scoped workflow permissions even when publishing no longer relies on long-lived npm tokens.

![](/img/RealTimePostImage/post/miasma-worm-returns-to-npm/image2.png)

## The malware waits for the package to load

None of the affected package manifests contains a malicious `preinstall`, `install`, or `postinstall` script. Installing an affected version does not necessarily execute this sample. Instead, the attacker inserted code at module scope into legitimate source files (different in each package):

- `apps/generator/lib/templates/config/validator.js`  
- `helpers/src/utils.js`  
- `components/src/utils.js/ErrorHandling.js`

The same approximately 7.7 KB obfuscated block was injected into each location. In two copies, roughly 881 leading spaces push the malicious code far to the right on a single line, making it easy to miss during a conventional side-by-side review

![](/img/RealTimePostImage/post/miasma-worm-returns-to-npm/image3.png)

When CommonJS loads one of these poisoned modules, Node.js evaluates the injected code immediately. The attacker does not need to wait for the legitimate validation or error-handling function to be called. The deobfuscated launcher starts a detached child process:  
![](/img/RealTimePostImage/post/miasma-worm-returns-to-npm/image4.png)  
Detaching the process and ignoring its output allow the legitimate application or CI job to continue without waiting for the malware. On Windows, `windowsHide` also suppresses a console window.

This load-time trigger changes incident scoping. A package found only in a cache or lockfile may never have run. Conversely, the malware can execute well after installation, when a developer invokes the generator or a build pipeline imports an affected component.

## From an AsyncAPI module to Miasma v3

### Stage 1: an obfuscated launcher

The injected block uses a string array, array rotation, encoded strings, and numeric indexes typical of obfuscator.io output. Static deobfuscation recovered a nested `node -e` program without running package code.

Obfuscation is not the only concealment mechanism. The code was placed in files where network access and process spawning have no legitimate purpose, then padded with whitespace to make the change less visible in a diff. In `@asyncapi/generator-components`, the published package contains a Babel-compiled form of the same payload.

### Stage 2: an IPFS downloader

The embedded program selects a user-writable directory based on the operating system, downloads `sync.js` from a public IPFS gateway, and launches it as another detached Node.js process:

![](/img/RealTimePostImage/post/miasma-worm-returns-to-npm/image5.png)

The `NodeJS` directory name and generic `sync.js` filename help the payload resemble ordinary runtime data. The complete download URL is `hxxps[:]//ipfs[.]io/ipfs/QmQobZSp1wRPrpSEQ56qnyq7ecZh5Bg5k1fnjt4SUwwHb9`.

`ipfs.io` is a legitimate shared service. Defenders should detect or block the exact CID rather than treating the entire gateway as malicious.

### Stage 3: decrypting the Miasma payload

The recovered `sync.js` file is an 8.25 MB encrypted wrapper. Our Analysis reproduced its decryption pipeline without evaluating the payload. The loader derives an AES key with HKDF-SHA256, decrypts the embedded source with AES-256-GCM, reverses a printable-ASCII ROT transformation, and would normally evaluate the resulting JavaScript in memory. You can see [here](https://gist.github.com/frogvit/1f90c0eff694cd2a81d1111faac2f448) the full malware configuration and decoding script.

![](/img/RealTimePostImage/post/miasma-worm-returns-to-npm/image6.png)

The authenticated plaintext is a 3.09 MB bundled Node.js application containing the marker `// mutated v3 profile=low runtime=1`.

The payload's separately encrypted baked configuration identifies the campaign as `miasma-train-p1`, targets npm, and reveals which framework capabilities are active in this deployment. The configuration below is de-fanged:

```json
{
  "c2Server": "hxxp[:]//85[.]137[.]53[.]71:8080",
  "uploadServer": "hxxp[:]//85[.]137[.]53[.]71:8081",
  "target": {
    "name": "miasma-train-p1",
    "ecosystem": "npm"
  },
  "testMode": false,
  "toggles": {
    "propagate": false,
    "recon": false,
    "persist": true,
    "poisonAI": false,
    "deadman": false,
    "evasion": false,
    "metamorphic": false
  }
}
```

Once the payload was decrypted, it was a readable source code, revealing the full capabilities.

## A RAT-first Miasma configuration

The payload starts by creating `~/.config/.miasma/run/node.lock`, generating a per-victim secp256k1 identity, validating a baked spawn-certificate chain, deriving an encrypted command channel, and attempting operating-system persistence. It then starts a jittered beacon loop and periodically checks decentralized sources for updated infrastructure or payloads.

The primary command server is `85[.]137[.]53[.]71` on port `8080`. Port `8081` is configured for data uploads, while port `8091` is listed for C2 proxy management. The payload also contains Nostr relays, BitTorrent DHT bootstrap nodes, IPFS, libp2p, mDNS, and an Ethereum contract as resilient discovery or update channels.

The live command handler supports:

- `ShellExec` for arbitrary shell commands with captured output  
- `UpdatePayload` for downloading and launching replacement payloads from IPFS  
- `UpdateBeaconInterval` for changing callback timing  
- `FileList`, `FileGet`, and `FilePut` inside a sandboxed virtual backend

The arbitrary shell command path is active and is not restricted by the disabled credential-harvesting or propagation settings. Commands may run for up to 120 seconds, and the only baked command blacklist entry is `killall`. The operator can therefore perform reconnaissance, collect files, access credentials, or deploy new tooling even though the automatic modules for those actions are disabled.

The framework contains extensive implementations for stealing cloud, CI, browser, SSH, Git, npm, container, database, and password-manager credentials. It also contains npm, PyPI, Cargo, repository, and AI-tool poisoning modules. In this exact build, `recon`, every `propagate.*` option, `poisonAI`, `deadman`, `evasion`, and `metamorphic` are set to `false`. These dormant modules describe the broader Miasma platform, not behavior that should be attributed to this deployment without additional evidence.

## Cross-platform persistence

The effective `persist` toggle is enabled. Miasma attempts a different user-level persistence method on each supported platform.

On Linux, it writes and enables `~/.config/systemd/user/miasma-monitor.service`. On Windows, it creates the `miasma-monitor` value under `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`. On macOS, it appends a block marked `### Node Auto-Update Script ###` to the first available `.zshrc`, `.bashrc`, or `.bash_profile`.

Some implementations may be unreliable. The Linux service uses shell syntax directly in `ExecStart`, and the macOS command does not quote the `Application Support` path. These errors can prevent relaunch after logout or reboot, but they do not stop the initial payload or its active C2 session.

Each victim's private node identity is stored in a platform-specific path chosen to resemble legitimate cache data:

- Linux: `~/.cache/mesa_shader_cache/gl_cache.bin`  
- macOS: `~/Library/Application Support/com.apple.spotlight/index-v2.cache`  
- Windows: `%USERPROFILE%\AppData\Roaming\Microsoft\CryptnetUrlCache\Content\msrt.dat`

The command channel uses ECDH, HKDF-SHA256, and AES-GCM to derive a unique encryption key for each victim. HTTP requests can also carry the `X-Miasma-Spawn-Chain` header, providing defenders with a high-signal protocol indicator.

## How Miasma v3 differs from the Red Hat wave

The prior Miasma campaign hijacked a large set of `@redhat-cloud-services` package versions and executed during npm installation. It used Bun, temporary payloads under `/tmp`, broad credential theft, package propagation, AI-tool hooks, and GitHub dead-drop repositories described as `Miasma: The Spreading Blight`.

The AsyncAPI wave is narrower and quieter. It compromises four packages, executes only after a poisoned module is loaded, uses a persistent Node.js payload, and communicates primarily with dedicated HTTP infrastructure. It does not create Shai-Hulud-style GitHub secret-dump repositories, and its automatic propagation and credential theft are disabled.

Defenders should not rely only on indicators from the previous wave. The most relevant indicators now are the IPFS CID, the `NodeJS/sync.js` paths, `85[.]137[.]53[.]71`, `miasma-monitor`, `.miasma` artifacts, and `X-Miasma-Spawn-Chain`.

## Remediation

- Identify projects, lockfiles, package caches, build logs, container images, and CI runs containing any of the affected packages  
- Determine whether the affected modules were loaded. Hunt for a Node.js parent process spawning a detached `node -e` child, access to the exact IPFS CID, and execution of `sync.js` from a user-profile `NodeJS` directory.  
- Isolate developer machines and CI runners where execution is confirmed or cannot be ruled out. Preserve process, filesystem, network, shell, CI, GitHub audit, and package-manager evidence before cleanup.  
- Remove the affected releases and reinstall a verified clean version. Regenerate lockfiles from trusted metadata.  
- Block `85[.]137[.]53[.]71` on ports `8080`, `8081`, and `8091`, and block the exact IPFS CID `QmQobZSp1wRPrpSEQ56qnyq7ecZh5Bg5k1fnjt4SUwwHb9`.  
- Remove `sync.js`, the `.miasma` lock directory, camouflaged node identity files, and `miasma-monitor` persistence artifacts. Inspect shell startup files for the `### Node Auto-Update Script ###` marker.  
- Rotate npm, GitHub, cloud, SSH, signing, deployment, and CI credentials accessible to confirmed-executed environments from a clean system.  
- Rebuild affected runners and workstations from known-clean images if stage-three execution is confirmed or forensic scoping is incomplete.  
- Review protection on every release-triggering branch, required approvals, workflow permissions, GitHub credentials, and npm trusted-publisher configuration.  
- Review downstream artifacts generated or published by affected build environments during the exposure window.

## Conclusions

The AsyncAPI incident shows how a legitimate release pipeline can become the delivery mechanism for malicious packages. Valid npm provenance accurately traced these releases to the project's workflow, but it could not distinguish an authorized commit from an attacker's direct push to the release branch.

Miasma v3 also demonstrates a shift in operating posture. Its codebase retains the credential theft and propagation capabilities of the broader worm family, but this deployment activates a persistent, encrypted remote shell and payload updater instead. That configuration is enough to give an operator effective user-level control over developer machines and CI runners while producing fewer immediate signs than an install-time, self-propagating worm.

These malicious package versions are detected by JFrog Xray and JFrog Curation.

## IOCs

### Affected npm packages

| Package | Versions | Xray ID |
| :---- | :---- | :---- |
| `@asyncapi/generator` | `3.3.1` | XRAY-898490 |
| `@asyncapi/generator-helpers` | `1.1.1` | XRAY-898443 |
| `@asyncapi/generator-components` | `0.7.1` | XRAY-898159 |
| `@asyncapi/specs` | `6.11.2, 6.11.2-alpha.1` | XRAY-898014 |

### Network and protocol indicators

- `hxxps[:]//ipfs[.]io/ipfs/QmQobZSp1wRPrpSEQ56qnyq7ecZh5Bg5k1fnjt4SUwwHb9`  
- Primary C2: `hxxp[:]//85[.]137[.]53[.]71:8080`  
- Upload server: `hxxp[:]//85[.]137[.]53[.]71:8081`  
- C2 proxy management: `hxxp[:]//85[.]137[.]53[.]71:8091`  
- Campaign identifier: `miasma-train-p1`  
- HTTP header: `X-Miasma-Spawn-Chain`  
- mDNS service: `_miasma._tcp`  
- Ethereum contract: `0x12c37A86a0Ed0beBe5d1d6a43E42f07860eAc710`

### Host and persistence indicators

- Linux payload: `~/.local/share/NodeJS/sync.js`  
- macOS payload: `~/Library/Application Support/NodeJS/sync.js`  
- Windows payload: `%LOCALAPPDATA%\NodeJS\sync.js`  
- Singleton lock: `~/.config/.miasma/run/node.lock`  
- Linux identity: `~/.cache/mesa_shader_cache/gl_cache.bin`  
- macOS identity: `~/Library/Application Support/com.apple.spotlight/index-v2.cache`  
- Windows identity: `%USERPROFILE%\AppData\Roaming\Microsoft\CryptnetUrlCache\Content\msrt.dat`  
- Linux persistence: `~/.config/systemd/user/miasma-monitor.service`  
- macOS persistence marker: `### Node Auto-Update Script ###`  
- Windows persistence: `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\miasma-monitor`
