---
excerpt: New versions of the malicious npm package `js-logger-pack`, including `1.1.27`, have shifted exfiltration to Hugging Face. Earlier versions already used the platform as a malware CDN; SafeDep documented that earlier phase. What is new is that the operator now outsources stolen data storage to private Hugging Face datasets rather than hosting it on the C2 server directly.
title: js-logger-pack Operator Turns Hugging Face into a Malware CDN and Exfiltration Backend
date: "April 23, 2026"
description: "Shavit Satou, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/hf_exfil/hugging-face-exfil.png
type: realTimePost
minutes: '5'
---

New versions of the malicious npm package `js-logger-pack`, including `1.1.27`, have shifted exfiltration to Hugging Face. Earlier versions already used the platform as a malware CDN; [SafeDep documented that earlier phase](https://safedep.io/malicious-js-logger-pack-npm-stealer/). What is new is that the operator now outsources stolen data storage to private Hugging Face datasets rather than hosting it on the C2 server directly. JFrog Security researchers extracted and analyzed the identical embedded JavaScript payload from all four Node SEA binaries, documented the live C2 protocol, and mapped the distribution infrastructure to a cluster of linked public personas. If you installed this package, or any version that pulls the `MicrosoftSystem64` binaries, you must assume your environment is compromised. The malware persists on Windows, macOS, and Linux, beacons to a hard-coded controller, logs keystrokes, monitors the clipboard, and exfiltrates stolen data to private Hugging Face datasets controlled by the attacker.

![](/img/RealTimePostImage/post/hf_exfil/hugging-face-exfil.png)

## Technical analysis

### What we recovered: identical Node SEA payloads across all four platforms

The published package is a bait-and-switch. `dist/index.js` contains a plausible but benign logger implementation. The actual trigger is the `postinstall` script in `package.json`:

```json
"scripts": {
  "postinstall": "node print.cjs"
}
```

`print.cjs` backgrounds itself into a detached Node child so `npm install` terminates while the downloader keeps running. It pulls one of four filenames from `https://huggingface.co/Lordplay/system-releases/resolve/main/` based on the host platform and architecture.

What makes this current stage notable is the packaging. The four downloaded binaries are not four different malware families. They are the same cross-platform implant injected into four Node.js Single Executable Application (SEA) containers:

- `MicrosoftSystem64-win.exe` \- PE32+ x64  
- `MicrosoftSystem64-darwin-x64` \- Mach-O x64  
- `MicrosoftSystem64-darwin-arm64` \- Mach-O arm64  
- `MicrosoftSystem64-linux` \- ELF x64

We wrote an extraction helper, and pulled the embedded `NODE_SEA_BLOB` from every sample cleanly. The extracted JavaScript bundle matches the same hash for all distributions:

| Artifact | SHA-256 |
| :---- | :---- |
| SEA blob | `46b9522ba2dc757ac00a513dbd98b28babb018eae92347f2cbc3c7a5020872b5` |
| Embedded JS | `1c83019b52be6da9583d28fe934441a74eacef0cd7dbb9d71017122de6fe7cfc` |

The wrappers are stock Node v20.18.2 runtimes. The malicious logic lives entirely inside the injected JavaScript bundle. That means the Windows binary contains systemd strings, and the Linux binary contains Windows scheduled-task strings, because the same cross-platform JS ships in every container.

![][image1]

This final payload’s analysis is the core technical addition we are publishing. Prior [public reporting by SafeDep](https://safedep.io/malicious-js-logger-pack-npm-stealer/) documented the campaign family and earlier phases, but the current Hugging Face-hosted second stage had not been extracted and documented at this level of detail.

### Implant behavior on launch

The SEA entrypoint is simple. It sets the process title to `MicrosoftSystem64`, registers persistence if not already registered, connects to the controller, and starts collecting data. Baseline automatic behavior includes:

- persisting via scheduled task / Run key (Windows), LaunchAgent (macOS), or systemd user unit / XDG autostart (Linux);  
- beaconing system info to the hard-coded controller at `ws[:]//195[.]201[.]194[.]107:8010` and `http[:]//195[.]201[.]194[.]107:8010`;  
- starting clipboard monitoring and a platform-specific keylogger;  
- scheduling self-update checks against the same Hugging Face repository;  
- resuming any previously failed Hugging Face uploads from local state.

Large-scale file scanning, Telegram exfiltration, browser session clearing, and arbitrary Hugging Face dataset uploads are operator-triggered tasks, not automatic startup behavior.

![][image2]

### Live task protocol

The implant speaks a typed task protocol over WebSocket. The capability list is explicit in the extracted bundle:

- `ping`, `get_system_info`, `list_drives`, `list_dir`  
- `read_text_file`, `read_file`, `read_file_chunk`, `write_file`, `create_dir`, `delete_file`, `delete_dir`  
- `get_folder_size`, `get_multi_folder_size`, `get_multi_item_size`  
- `scan_files` \- recursive credential, wallet, browser, shell-history, and environment-variable scanning  
- `send_tdata` \- Telegram Desktop `tdata` exfiltration on Windows and macOS  
- `upload_folder_hf` \- archive arbitrary files/folders and upload them to attacker-supplied private Hugging Face datasets  
- `clear_sessions` \- kill browser processes and destroy session/credential stores  
- `update_agent` \- self-update or restart  
- `deploy_binary` \- download and persist an arbitrary binary from an arbitrary URL

The filesystem tasks accept absolute paths, UNC paths, `~` expansion, and drive-letter paths with no sandbox or allowlist. The operator can read or write any user-accessible file.

### Hugging Face as a live control plane

The public Hugging Face repository `Lordplay/system-releases` is not just a static dump. The package-stage downloader fetches the initial binary from it, and the implanted binary later polls `version.txt` from the same repo to check for updates. If the version increased, it downloads the replacement binary in place and restarts. There is no signature or checksum validation at any step.

The repository history also matches the extracted code. One commit message reads `v1.0.1: rebuild with upload_folder_hf support`, which is an observed task in the client, executable via commands from the C2 server.

![][image3]

### Hugging Face as an exfiltration backend

The most unusual current-stage behavior is the use of Hugging Face itself as a data-theft destination.

When the operator issues an `upload_folder_hf` task, the implant receives `hfToken`, `hfUsername`, a target `path`, and an `uploadId`. It then:

1. archives the requested file or folder into a gzip file under the system temp directory;  
2. creates or reuses a private Hugging Face dataset named from the `agentId` and the target path;  
3. uploads the archive into that dataset using the embedded `@huggingface/hub` client;  
4. notifies the Hetzner controller via `/api/validate/hf-upload-complete` once the upload finishes.

Pending uploads are tracked in `~/.pcl-state/uploads.json` and resumed on reconnect. This means the live C2 server never has to host the bulk stolen content itself. The operator can point the implant at attacker-controlled or compromised Hugging Face accounts and let Hugging Face's infrastructure handle the storage and transfer.

The implant also supports `clear_sessions`, which kills browser processes and destroys session stores to force reauthentication while the keylogger is already running. That combination makes the Hugging Face exfiltration channel especially dangerous: credentials typed into a browser after a forced logout can be captured and shipped to a private dataset within minutes.

### Platform-native helper layers

Because the bundle is cross-platform JavaScript, it reaches into native helper code at runtime:

- **Windows:** compiles C\# in-memory via PowerShell `Add-Type` to install a `SetWindowsHookEx` low-level keyboard hook, with UIAAutomation-based password-field detection.  
- **macOS:** writes a temporary Swift source file to `/tmp/.sys_<pid>.swift`, compiles it with `swiftc`, and runs the resulting binary to capture keys via `CGEvent.tapCreate` and `AXUIElement`.  
- **Linux:** attempts X11 capture via `xinput test-xi2`, then falls back to reading raw evdev data from `/dev/input/event*`.

Clipboard collection uses `OpenClipboard` on Windows, `CGEvent` on macOS, and `xclip` / `xsel` / `wl-paste` on Linux.

### Relationship to prior reporting

This campaign has already been documented publicly. OSV tracks the package family as `MAL-2026-2827`, and SafeDep published detailed analysis of earlier versions through the binary-dropper pivot.

Our analysis confirms that the current Hugging Face binaries execute an identical Node sample, documents the current C2 schema/transport logic, and maps the distribution infrastructure to a cluster of linked public identities. Relative to prior public reporting, the main additions here are the analysis of the second-stage implant, and the OSINT tracing of the Hugging Face distribution channel.

## OSINT and attribution

### The `Lordplay` identity break

The `Lordplay` Hugging Face namespace is not a one-day account created for this campaign. Public API metadata shows six older sports and computer-vision model repositories created in February 2026\. The malicious `Lordplay/system-releases` repo appeared later, on `2026-04-19T15:49:09Z`.

Older `Lordplay` repositories show a stable identity pattern: system commits as `Lim Hwang <Lordplay@users.noreply.huggingface.co>` and direct git pushes as `Lordplay <limhwang1228@gmail.com>`. The `system-releases` repository breaks that pattern. The initial creation commit is a normal Hugging Face `Lordplay` system commit. Later malware-related commits switch to `joshstevens19 <joshstevens19@hotmail.co.uk>`.

`joshstevens19@hotmail.co.uk` matches the real identity of Josh Stevens, Engineering VP at Polymarket. There is no public Hugging Face account named `joshstevens19`. The commit metadata is a git author string, not proof that Stevens pushed the repository. We assess with high confidence that the threat actor is deliberately impersonating a known engineering executive to plant false authorship and muddy attribution.

![][image4]

### The `whisdev` / `snipmaxi` / `jrodacooker.dev` cluster

A second public cluster links the campaign to the `whisdev` persona set:

- The `Lordplay` Hugging Face profile links to `whisdev`.  
- The public `whisdev` GitHub profile links directly to a Telegram user named `snipmaxi`.  
- `whisdev.org` is branded `Lordplay` and links to the same Telegram handle.  
- `jrodacooker.dev` also links to `snipmaxi`.  
- Public `whisdev` repositories include Polymarket-related utilities and trading tools, placing the persona in the Web3 and prediction-market space.

That cluster overlaps earlier campaign infrastructure. We found an earlier C2 at `api-sub[.]jrodacooker.dev` in `js-logger-pack@1.1.5`. Telemetry shows the current Hetzner controller IP `195[.]201[.]194[.]107` previously served a TLS certificate for `copilot-ai[.]whisdev[.]org`. We independently confirmed the certificate existed.

### The `bink` alias overlap

We recovered an attacker's SSH public key with the comment `bink@DESKTOP-N8JGD6T` referenced in `js-logger-pack@1.1.5`. Public raw git history for `whisdev/ptcbink` contains `Ptc Bink`, `ptc-bink`, and `ptcbink` author identities, including GitHub noreply addresses tied to the `whisdev` account ID `142078464` and the email `sakelejames@gmail.com`. The `bink` overlap is notable and worth provider-side investigation, but public data alone is not enough to name an operator.

### What we can and cannot claim

Public data alone does not prove that Josh Stevens authored the malware, or that the real `whisdev` operators knowingly ran the campaign, or that any of the linked accounts were definitely compromised. The available evidence points to deliberate impersonation of Stevens, not genuine authorship. What the data does show is:

- The `Lordplay` namespace was used with a sharply different identity than its earlier history.  
- The `joshstevens19` metadata on Hugging Face looks like spoofed or planted git authorship, as to frame Stevens for this supply chain attack.  
- The `whisdev` / `snipmaxi` / `jrodacooker.dev` cluster is a real, campaign-adjacent persona and infrastructure set.  
- The `bink` alias overlap is worth tracking, but it is not a standalone attribution.

## Remediation guidance

If you installed `js-logger-pack@1.1.27`, or any version that dropped the `MicrosoftSystem64` binaries, you must assume the machine or CI/CD runner is compromised. Take these steps immediately.

### Step 1: Containment and credential rotation

The malware can browse, read, and write arbitrary files, scan for secrets, log keystrokes, and deploy additional payloads. Any secrets on the machine are at risk.

- Rotate all secrets accessible in the environment: AWS keys, npm tokens, SSH keys, database passwords, API keys, wallet seeds, and any credentials stored in browser profiles.  
- Audit registry and source-control logs for unauthorized access or pushes.

### Step 2: Kill persistence and backdoors

**Windows:**

- Delete the scheduled task: `\MicrosoftSystem64`  
- Delete the registry fallback: `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\MicrosoftSystem64`  
- Delete `%LOCALAPPDATA%\MicrosoftSystem64.exe`  
- Delete `%LOCALAPPDATA%\MicrosoftSystem64.vbs`  
- Delete `%LOCALAPPDATA%\.registered`

**macOS:**

- Unload and delete the LaunchAgent:

```shell
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.launchkeeper.MicrosoftSystem64.plist
rm -f ~/Library/LaunchAgents/com.launchkeeper.MicrosoftSystem64.plist
```

- Delete `~/Library/Application Support/MicrosoftSystem64`  
- Delete `~/Library/Application Support/.registered`

**Linux:**

- Stop and disable the systemd user unit:

```shell
systemctl --user stop MicrosoftSystem64.service
systemctl --user disable MicrosoftSystem64.service
```

- Delete `~/.config/systemd/user/MicrosoftSystem64.service`  
- Delete `~/.config/autostart/MicrosoftSystem64.desktop`  
- Delete `~/.local/share/MicrosoftSystem64`  
- Delete `~/.local/share/.registered`

### Step 3: Cleanup of local artifacts

Remove the data directories and upload state the implant created:

**Windows:**

```shell
rmdir /s /q "%LOCALAPPDATA%\.pcl-data"
rmdir /s /q "%USERPROFILE%\.pcl-state"
```

**macOS / Linux:**

```shell
rm -rf ~/.pcl-data
rm -rf ~/.pcl-state
rm -f /tmp/.sys_*.swift
rm -f /tmp/.sys_*_bin
```

### Step 4: Package removal

Purge the package and lockfiles:

```shell
rm -rf node_modules package-lock.json
npm cache clean --force
```

Review `package.json` for any reference to `js-logger-pack` and remove it before reinstalling dependencies.

### Step 5: Long-term prevention

- Run `npm config set ignore-scripts true` to prevent `postinstall` hooks from executing automatically.  
- Review `package.json` changes in dependency updates, even for patch releases.  
- Implement automated dependency scanning and approval workflows with [JFrog Curation](https://jfrog.com/curation/) to ensure only vetted packages enter your supply chain.

## Known malicious packages

| Package Name | Malicious Versions | Xray ID |
| :---- | :---- | :---- |
| `js-logger-pack` (npm) | 1.1.0 up to 1.1.27 | XRAY-965126 |
| `Lordplay/system-releases` (Hugging Face) | 1.1.27 | XRAY-968550 |

## Conclusions

`js-logger-pack@1.1.27` is a thin but effective supply-chain dropper, creatively abusing Hugging Face as a CDN and an exfiltration backend. The npm package itself does little more than fetch a platform binary from a public Hugging Face repository, yet the resulting implant is a full operator foothold with cross-platform persistence, live keylogging, arbitrary file access, and secondary payload deployment.

Our research adds three things to the public record. First, we analyzed the binaries hosted on Hugging Face, and documented the C2 protocol. Second, we identified that the operator is actively using Hugging Face private datasets as a live exfiltration backend, outsourcing stolen data storage to Hugging Face infrastructure rather than hosting it on the C2 server directly. Third, we traced the distribution infrastructure to a cluster of linked public personas and mapped the sharp identity break inside the `Lordplay` namespace, the impersonation of Polymarket VP Josh Stevens, and the campaign-adjacent `whisdev` / `snipmaxi` / `jrodacooker.dev` cluster.

Because the entire chain relies on unverified downloads and plaintext controller traffic, the safest remediation is to treat any affected host as fully compromised, rotate all secrets, and remove persistence artifacts across Windows, macOS, and Linux.

JFrog Xray and JFrog Curation provide detection for this malicious package family.

## Indicators of Compromise (IOCs)

### Packages

- `js-logger-pack-1.1.27`

### Network

- `ws[:]//195[.]201[.]194[.]107:8010`  
- `http[:]//195[.]201[.]194[.]107:8010`  
- `https[:]//huggingface[.]co/Lordplay/system-releases/resolve/main/MicrosoftSystem64-win.exe`  
- `https[:]//huggingface[.]co/Lordplay/system-releases/resolve/main/MicrosoftSystem64-darwin-x64`  
- `https[:]//huggingface[.]co/Lordplay/system-releases/resolve/main/MicrosoftSystem64-darwin-arm64`  
- `https[:]//huggingface[.]co/Lordplay/system-releases/resolve/main/MicrosoftSystem64-linux`  
- `https[:]//huggingface[.]co/Lordplay/system-releases/resolve/main/version.txt`

### Files

### 

| Name | SHA-256 |
| :---- | :---- |
| `MicrosoftSystem64-win.exe` | `f2c754a7f7b56e0e2a6dd429f06c42a1860c52c37b25d0a8e91c67d1239fa577` |
| `MicrosoftSystem64-darwin-x64` | `457a3323fe0cfa82d6e102074c6f07a399f55c7e0ce2d3b40643d9cfde0cf220` |
| `MicrosoftSystem64-darwin-arm64` | `2fec04f2985510654d9656d57f6817de1ca0d6ae49e7085b1e33abb38f89cc55` |
| `MicrosoftSystem64-linux` | `b505f1d1ca3dca8cb7e2b2dd99991b5a929ec9387f3de31ad36549823af07dfd` |
| `print.cjs` | `33401580619ae79bf3f87aab16208f169a44a038f18671b1def7836fb2682c9a` (as of `js-logger-pack@1.1.27`) |

### 

### Persistence artifacts

- Windows scheduled task: `\MicrosoftSystem64`  
- Windows Run key: `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\MicrosoftSystem64`  
- macOS LaunchAgent: `com.launchkeeper.MicrosoftSystem64`  
- Linux systemd user unit: `MicrosoftSystem64.service`  
- Linux XDG autostart: `~/.config/autostart/MicrosoftSystem64.desktop`

### Process and filesystem indicators

- Process title: `MicrosoftSystem64`  
- `%LOCALAPPDATA%\MicrosoftSystem64.exe`  
- `%LOCALAPPDATA%\MicrosoftSystem64.vbs`  
- `%LOCALAPPDATA%\.registered`  
- `%LOCALAPPDATA%\.pcl-data\offline-queue.jsonl`  
- `%USERPROFILE%\.pcl-state\uploads.json`  
- `~/Library/Application Support/MicrosoftSystem64`  
- `~/Library/Application Support/.registered`  
- `~/Library/Application Support/data/MicrosoftSystem64.log`  
- `~/Library/Application Support/data/MicrosoftSystem64_err.log`  
- `~/.local/share/MicrosoftSystem64`  
- `~/.local/share/.registered`  
- `~/.pcl-data/offline-queue.jsonl`  
- `~/.pcl-state/uploads.json`  
- `/tmp/.sys_<pid>.swift`  
- `/tmp/.sys_<pid>_bin`

[image1]: /img/RealTimePostImage/post/hf_exfil/image1.png

[image2]: /img/RealTimePostImage/post/hf_exfil/image2.png

[image3]: /img/RealTimePostImage/post/hf_exfil/image3.png

[image4]: /img/RealTimePostImage/post/hf_exfil/image4.png