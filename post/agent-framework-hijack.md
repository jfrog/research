---
excerpt: "The JFrog Security Research team analyzed the supply chain hijack of Microsoft's agent-framework package on PyPI. Compromised versions 1.26.1 and 1.26.2 use Python .pth startup hooks to harvest Azure identities, CI/CD tokens, and AI developer secrets on every Python launch. If you installed either version, assume your environment is compromised."
title: "Microsoft's agent-framework Hijacked on PyPI via Silent .pth Startup Hook"
date: "November 18, 2026"
description: "Shavit Satou, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/agent-framework-hijack/image1.png
type: realTimePost
minutes: '5'
---

The JFrog Security Research team analyzed a supply chain attack targeting Microsoft's `agent-framework` package on PyPI, which receives roughly 40,000 weekly downloads. Rather than compromising Microsoft's build pipeline, the attacker repacked the clean wheel locally and published versions `1.26.1` and `1.26.2` with a `.pth` startup hook that runs a background credential stealer every time Python starts, even when your code never imports `agent_framework`. If you installed either version on a workstation, CI/CD runner, or container image, you must assume your environment and accessible cloud credentials are compromised.

![][image1]

Both unauthorized wheel-only releases went live on November 17, 2026. Version `1.26.1` landed on PyPI at `20:35 UTC`, and PyPI quarantined it 31 minutes later at `21:06 UTC`. The attacker uploaded `1.26.2` two minutes after that at `21:08 UTC`, and PyPI removed both releases by `21:16 UTC`. Automated dependency bots such as Renovate were already opening upgrade pull requests in downstream repositories within six minutes of `1.26.1` landing on PyPI.

## Technical analysis

### Why the meta-package needed a .pth hook

`agent-framework` is the top-level meta-package recommended in Microsoft's quick-install instructions. It does not contain the core SDK code. Instead, `agent-framework-core` provides the `agent_framework` namespace that developers import, while the `agent-framework` wheel installs a small stub module named `agent_framework_meta` that only exposes `__version__` and pins `Requires-Dist: agent-framework-core[all]==1.26.0`.

Because applications run `import agent_framework` and never import `agent_framework_meta`, hiding malicious code inside `agent_framework_meta/__init__.py` alone would never execute in normal workloads.

In `1.26.1`, the attacker left the `agent-framework-core[all]==1.26.0` dependency pin untouched so the framework keeps working without errors. They appended a silent `_telemetry._start()` call to `agent_framework_meta/__init__.py` and added a 28-byte `agent_framework_meta.pth` file to the root of `site-packages` containing `import agent_framework_meta`:

![Malicious _telemetry._start() hook appended to agent_framework_meta/__init__.py][image2]

During CPython initialization, `site.py` scans `site-packages` for `.pth` files and passes any line starting with `import` to `exec()` before `sitecustomize` or user scripts run. Installing the wheel does not execute code on its own, but the next Python command in that environment triggers the stealer, including `python`, `pytest`, IDE language servers, container entrypoints, and `pip`.

ZIP headers confirm the `1.26.1` wheel came from a local script rather than Microsoft's Azure DevOps and ESRP release pipeline. Although the `WHEEL` file still claims `Generator: flit 4.2.0`, Info-ZIP `zip 3.0` headers show the attacker repacked the archive at `20:26:19 UTC` on November 17, nine minutes before upload, under Unix `uid=1000` on a host with a `UTC+8` clock.

That scripted build let the operator push `1.26.2` two minutes after PyPI quarantined `1.26.1`. Quarantining a single version on PyPI does not revoke the compromised publishing credential or prevent the attacker from pushing newer versions. In `1.26.2`, the attacker restored the clean `__init__.py` file and moved the startup hook to `af_runtime_diag.pth` and `af_runtime_diag.py`.

### Detached execution and repeat triggers

When `_telemetry._start()` runs, it checks whether `_AF_TEL` is set in `os.environ`. If unset, it sets `_AF_TEL="1"` so child processes in the same process tree do not trigger a fork loop. On Linux and macOS, it calls `os.fork()`, detaches into a new session via `os.setsid()`, runs the collector, and exits the child with `os._exit(0)` while the parent process continues immediately. On Windows, where `os.fork()` is unavailable, it starts a daemon thread.

Our sandbox runs confirmed `_telemetry.py` writes zero lockfiles or markers to disk. Every independent Python launch without `_AF_TEL=1` runs the collector and exfiltrates secrets again.

### Targeting Azure, CI/CD, and AI developer secrets

On startup, `_collect()` records the hostname, username, working directory, and `sys.argv[:20]`, then sweeps `os.environ` for 31 case-insensitive substrings covering Azure, AWS, GitHub, OpenAI, Microsoft Foundry, Hugging Face, Cosmos DB, and package registry credentials. Because `KEY`, `TOKEN`, and `SECRET` match broadly, the script also captures third-party LLM keys such as `ANTHROPIC_API_KEY` and `GEMINI_API_KEY` alongside GitHub Actions `ACTIONS_ID_TOKEN_REQUEST_*` variables. Version `1.26.2` expanded this scope to GitHub Actions OIDC tokens and `/home/runner` paths.

Next, the collector evaluates 35 glob patterns, reading up to 60 files under 256 KiB, raised to 80 files in `1.26.2`:

![Filesystem credential globs targeting Azure, Hugging Face, Foundry, and Azure DevOps agents][image3]

The file search targets four credential groups:

- `~/.azure/*.json` token caches, Hugging Face tokens, and Microsoft Foundry configs.  
- Package, Git, and container configs in `pip.conf`, `.npmrc`, `.netrc`, `.git-credentials`, and `.docker/config.json`.  
- Containerized application configs matching `/app/.env`, `/app/*.json`, `/workspace/.env`, and `/workspace/*.json`.  
- Self-hosted Azure DevOps agent `.credentials` stores, including `/mnt/azure_nvme_temp/_work` runner paths.

On Linux, `_collect()` also reads the first 300 `/proc/[0-9]*/environ` entries to pull secrets from other running processes. It then queries Azure App Service `IDENTITY_ENDPOINT` or `MSI_ENDPOINT` variables, or falls back to the Azure VM Instance Metadata Service at `169[.]254[.]169[.]254`, requesting live OAuth2 tokens across 12 token audiences including Azure Resource Manager, Azure AI Foundry, Key Vault, Storage, Microsoft Graph, and Azure DevOps:

![Azure App Service Managed Identity and VM IMDS token harvesting loop][image4]

### Plaintext webhook.site exfiltration and operator blunders

Rather than operating custom infrastructure, `_telemetry.py` Base64-decodes `_ENC` to `hxxps[:]//webhook[.]site/d381fd80-ec62-42ad-8f5c-d1b15103c9bb`. It serializes the harvested data to JSON, compresses it with `zlib`, Base64-encodes the result with no encryption, and sends an HTTPS `POST` to `?t=telemetry` with `User-Agent: af-runtime-diagnostics/1`, changed to `runtime-diagnostics/1` in `1.26.2`:

![Base64 webhook.site URL and unencrypted zlib exfiltration in _telemetry.py][image5]

The script discards the response body. We found no second-stage loader, no persistence outside `site-packages`, and no worm propagation.

Closer inspection of the code and drop endpoint revealed four operational mistakes:

- **Rate-limited `webhook[.]site` dropbox.** When we checked the URL, it returned `HTTP 429` with `Error: Request limit exceeded. Sign up to unlock more requests.` Early victims before the cap hit still delivered unencrypted secret bundles over `HTTP 200`, and free `webhook[.]site` inboxes without subscription controls can expose captured requests to anyone holding the UUID.  
- **Broken Azure DevOps OIDC request.** The script posts to `SYSTEM_OIDCREQUESTURI?api-version=7.1` without the required `serviceConnectionId` parameter, so real Azure DevOps endpoints reject it with `HTTP 400`. `SYSTEM_ACCESSTOKEN` itself still leaks through `os.environ` when mapped into a pipeline step.  
- **104-second IMDS delay and Windows thread drop.** On non-Azure Linux hosts that drop packets to `169[.]254[.]169[.]254`, 13 sequential eight-second timeouts stall the detached child for about 104 seconds before exfiltration starts, though the parent command does not wait. On Windows, short CLI commands exit before the daemon thread finishes those timeouts.  
- **Linux-centric file globs.** Thirty-three of the 35 globs are absolute Linux paths that miss `/Users/*` on macOS for `.npmrc`, `.git-credentials`, and Hugging Face tokens. macOS hosts still leak `os.environ` and plaintext `~/.azure/*.json` token caches.

## Remediation guidance

If your environment installed `agent-framework` `1.26.1` or `1.26.2`, treat every secret reachable from that host, container, or runner as compromised and take these steps immediately.

### Step 1: Neutralize the .pth hook and remove the package

Do not run bare `pip uninstall` in an infected environment first. Because `pip` is a Python entrypoint, launching it loads `site.py`, processes the `.pth` hook, and runs the stealer one more time before uninstalling. Export `_AF_TEL=1` first to block both `1.26.1` and `1.26.2`, and run the cleanup using the affected environment's Python binary, such as `.venv/bin/python`:

```sh
export _AF_TEL=1
PY_BIN=".venv/bin/python"  # or python3 for active/system environments
"$PY_BIN" -c '
import pathlib, shutil, site
dirs = set(site.getsitepackages() + [site.getusersitepackages()])
files = ("agent_framework_meta.pth", "agent_framework_meta/_telemetry.py", "af_runtime_diag.pth", "af_runtime_diag.py")
for d in dirs:
    base = pathlib.Path(d)
    for f in files:
        (base / f).unlink(missing_ok=True)
    shutil.rmtree(base / "agent_framework_meta" / "__pycache__", ignore_errors=True)
    for pyc in (base / "__pycache__").glob("af_runtime_diag.*.pyc"):
        pyc.unlink(missing_ok=True)
'
"$PY_BIN" -m pip uninstall -y agent-framework
"$PY_BIN" -m pip cache remove agent_framework
"$PY_BIN" -m pip install --no-cache-dir "agent-framework==1.26.0"
```

If you manage environments with `uv`, `uv` is a compiled Rust binary that does not execute `.pth` hooks during package removal. Run `uv pip uninstall agent-framework && uv cache clean agent-framework` directly, then pin `agent-framework==1.26.0`.

### Step 2: Rotate secrets and audit cloud identities

Rotate every static credential accessible to the affected user, container, or co-located Linux processes:

- Cloud, LLM, and registry keys in environment variables or `.env` files, including Azure, OpenAI, Microsoft Foundry, Anthropic, Hugging Face, AWS, GitHub, npm, NuGet, PyPI, and Docker credentials.  
- Azure DevOps `SYSTEM_ACCESSTOKEN` secrets, service connections, and self-hosted agent `.credentials` stores; wipe and re-register affected self-hosted runners.  
- User sessions in Entra ID if `~/.azure/*.json` token caches existed on disk, since rotating passwords or client secrets alone does not revoke cached refresh tokens.  
- For Azure Managed Identities and federated OIDC workflows, issued access tokens have no static secret to rotate and remain valid until expiry, up to 24 hours. Recycle affected compute instances, review Entra ID Managed Identity sign-in logs across the targeted Azure services, and narrow or remove role assignments if you detect unauthorized replay.

### Step 3: Purge caches, lockfiles, and container images

Removal from PyPI does not clean downstream artifacts cached during the exposure window:

- Block `webhook[.]site` where not required for testing, check DNS logs from build hosts for queries to `webhook[.]site`, and inspect TLS-decrypted proxy logs for `POST` requests to `/d381fd80-ec62-42ad-8f5c-d1b15103c9bb?t=telemetry`, where `HTTP 200` confirms completed exfiltration prior to rate-limiting.  
- Search internal package mirrors and artifact proxies such as JFrog Artifactory remote caches for the malicious wheel SHA-256 digests below and evict them.  
- Audit lockfiles, Renovate or Dependabot pull requests opened on November 17, and Docker images built during that window; any container image with `1.26.1` or `1.26.2` baked into `site-packages` runs the stealer on every container start. Bytecode `.pyc` files under `__pycache__` do not indicate whether the payload ran, because `pip install` compiles bytecode during installation while `PYTHONDONTWRITEBYTECODE=1` suppresses it at runtime.

## Known malicious packages

| Package Name | Malicious Versions | Xray ID |
| :---- | :---- | :---- |
| `agent-framework` | 1.26.1, 1.26.2 | XRAY-1167986 |

## Conclusions

We have not attributed this attack to a known threat group. Both compromised wheels were repacked locally outside Microsoft's normal release pipeline rather than built through upstream CI. Unlike many other supply chain attacks, `agent-framework` `1.26.1` and `1.26.2` carry no payload encryption, no actor markers, no systemd persistence, and no worm propagation. The operator also made several mistakes, including pointing an unthrottled startup hook at a rate-limited `webhook[.]site` inbox, shipping a broken Azure DevOps OIDC request, and hardcoding Linux file paths.

Even with those flaws, one `.pth` line paired with an untouched dependency pin gave the attacker code execution on every Python launch without breaking a single application import. [JFrog Curation](https://jfrog.com/curation/) and JFrog Xray detect and block both compromised versions before they enter build pipelines.

## Indicators of compromise

### Files and packages


| Artifact | Version | SHA-256 |
| :---- | :---- | :---- |
| `agent_framework-1.26.1-py3-none-any.whl` | 1.26.1 | `d27fa34414e6201d5e03e559ef634f020057554d7b3f4898dd5d7cd3e989e110` |
| `agent_framework_meta/_telemetry.py` | 1.26.1 | `39fa329f2a93f734b0bb8f5adb203ea3331d1ae479832a5015a54cb17aabd663` |
| `agent_framework_meta/__init__.py` | 1.26.1 | `c275ccbe520ef3c0f02dc6a35389e427f9f1b4e0b12e140cd7bf7179ce143f02` |
| `agent_framework_meta.pth` | 1.26.1 | `21f28e8517a10ffe431f8d68f5875c85eca4001ae6d118322b0a41873998eb5e` |
| `agent_framework-1.26.2-py3-none-any.whl` | 1.26.2 | `3d20a8bc91351a9a16b6db243b848ceca0206b7a8623b02d2af553a9c9f7e0a9` |
| `af_runtime_diag.py` | 1.26.2 | `54d885b7d7161c9ed96489c66364c4bfbf635929166843bba10d97d46b5a2e1f` |
| `af_runtime_diag.pth` | 1.26.2 | `325e7e9f0ec94e41ad1a1b7a3f18a6b8b5bffece2e2b97b8d3369eb967452f93` |


### Network and host indicators

- Exfiltration URL: `hxxps[:]//webhook[.]site/d381fd80-ec62-42ad-8f5c-d1b15103c9bb?t=telemetry`  
- HTTP User-Agents: `af-runtime-diagnostics/1` in `1.26.1`, `runtime-diagnostics/1` in `1.26.2`  
- Malicious `site-packages` files: `agent_framework_meta.pth`, `agent_framework_meta/_telemetry.py`, `af_runtime_diag.pth`, `af_runtime_diag.py`  
- Runtime process environment marker: `_AF_TEL=1`

[image1]: /img/RealTimePostImage/post/agent-framework-hijack/image1.png
[image2]: /img/RealTimePostImage/post/agent-framework-hijack/image2.png
[image3]: /img/RealTimePostImage/post/agent-framework-hijack/image3.png
[image4]: /img/RealTimePostImage/post/agent-framework-hijack/image4.png
[image5]: /img/RealTimePostImage/post/agent-framework-hijack/image5.png