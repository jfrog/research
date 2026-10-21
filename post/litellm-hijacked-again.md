---
excerpt: "LiteLLM has been hijacked again: malicious `litellm` 1.107.0 wheels contain an interpreter-startup credential stealer and an hourly remote-code loader absent from the source distribution."
title: "LiteLLM Hijacked Again: Malicious 1.107.0 Wheels Steal Credentials and Load Remote Code"
date: "October 21, 2026"
description: "Guy Korolevski, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/litellm-hijacked-again/pypi-litellm.png
type: realTimePost
minutes: '12'
---

The JFrog Security Research team identified malicious code in `litellm` 1.107.0, a widely used Python interface and proxy for large language model providers. The payload wheels are a functional copy of the legitimate project with three additional files that execute at Python startup, steal a broad set of credentials and secrets, and provide an hourly remote-code execution channel. The payload can run even when an application never imports `litellm`.

This is the second documented hijacking of LiteLLM in 2026. The new compromise is especially instructive because the published source distribution does not contain the three payload files found in the wheel. Reviewers who inspect only source code, a Git tag, or an sdist can therefore miss malicious behavior delivered in a platform-specific binary artifact.

The open source community is actively following the new incident in [LiteLLM issue #47826](https://github.com/BerriAI/litellm/issues/47826).

All seven PyPI wheels for `litellm` 1.107.0 contain the payload, across macOS, Linux, musl Linux, and Windows targets. The source tarball lacks `cook.pth`, `cook.py`, and `sitecustomize.py`, while its `pyproject.toml` contains an added `data = "cook"` setting that is absent from the corresponding Git tag. Our local copy of the source distribution likewise contains this setting but not the three malicious payload files.

The payload entries share ZIP timestamps and metadata with legitimate wheel files, indicating that they were included during normal wheel construction rather than appended through manual ZIP repacking. This narrows the likely point of injection, but it does not reveal who altered the build tree, how that alteration occurred, or how the artifacts were published. The exact build or publishing compromise remains unknown.

![](/img/RealTimePostImage/post/litellm-hijacked-again/pypi-litellm.png)

## LiteLLM was already hijacked

In March 2026, JFrog Security Research [documented LiteLLM's first compromise](https://research.jfrog.com/post/litellm-compromised-teampcp/). Its pipeline ran a malicious, unpinned Trivy 0.69.4 release, exposing CI/CD and publishing credentials.

The stolen credentials were used to publish backdoored `litellm` versions 1.82.7 and 1.82.8, which harvested credentials, spread across Kubernetes nodes, and installed a persistent backdoor. JFrog tracks those releases under XRAY-955589.

The new 1.107.0 compromise uses different payloads and infrastructure. No evidence currently links it to TeamPCP or the earlier access path, so the incidents should be treated as separate campaigns.

## The source archive and built wheel tell different stories

Its `RECORD` manifest includes three files under `litellm-1.107.0.data/purelib/`:

```text
litellm-1.107.0.data/purelib/cook.pth
litellm-1.107.0.data/purelib/cook.py
litellm-1.107.0.data/purelib/sitecustomize.py
```

Python wheel installers place files from this `purelib` directory into the environment's `site-packages` root. The corresponding 1.107.0 sdist contains none of these payload files. A comparison of the legitimate library tree found no other injected code: aside from expected wheel-specific artifacts such as the compiled Rust bridge and packaging differences, the rest of the wheel appears consistent with the legitimate release.

This is wheel-level or build-artifact-level injection. The observable evidence is consistent with injection during or after wheel construction, while the matching metadata favors inclusion during the ordinary build process over later manual repacking. It does not prove that a particular CI system, maintainer machine, PyPI account, or publishing credential was compromised.

The distinction matters operationally. Source review can show that the main `litellm` code is legitimate while still missing executable files added to a built artifact. Package consumers and security tools must verify the exact wheel they install, including its `RECORD` contents and startup hooks, rather than treating an sdist or repository tag as a complete representation of every published artifact.

At the time of writing, a read-only retrieval of `domain.txt`, the dead-drop file used by the remote loader, returned HTTP 200 with an empty plain-text body of exactly zero bytes and no redirect. No domain was present or contacted. This made the loader dormant at observation time, but changing the file can re-arm it. This time-sensitive result does not neutralize the wheel: the local `cook.py` credential stealer executes independently of `domain.txt` and remains active.

## Python startup hooks trigger the compromise

The malicious wheel uses two Python startup mechanisms. The first file, `cook.pth`, contains only:

```python
import cook
```

Python's `site` module processes `.pth` files during normal interpreter initialization and executes lines beginning with `import`. As a result, `cook.py` runs during normal Python startup in the affected environment, regardless of whether the application imports `litellm`.

The second mechanism is `sitecustomize.py`. After processing site paths, Python automatically attempts to import a module named `sitecustomize`. The injected module uses this behavior to start a detached loader. Together, these hooks turn normal Python invocations in the environment, including administrative use of `pip`, into potential retriggers.

The `sitecustomize.py` daemon path cannot complete on Windows because the code relies on `os.fork()`. It fails silently there, but `cook.pth` still imports `cook.py`, so Windows installations remain exposed to the credential stealer.

## `cook.py` launches the `privcollect` credential stealer

The two-line `cook.py` file contains a Base64-encoded, zlib-compressed Python program passed directly to `exec()`. Static decoding, without executing the sample, produces approximately 61 KB of plain Python source. The decoded program identifies itself as `privcollect`.

The heavily shortened wrapper below preserves only a prefix of the malicious encoded data:

```python
import zlib as _3659944d, base64 as _35100b45
exec(_3659944d.decompress(_35100b45.b64decode('eNrdfWt327qu4Pf+Ck/X...')))
```

The `cook.py` copy starts the collector in a daemon thread and uses `/tmp/.pc_once_72129118c59f5636c0bb` as a run-once marker. The marker is created only after successful exfiltration, so its absence does not establish that a host is clean. The payload also sets `PRIVCOLLECT_ACTIVE=1` to limit duplicate execution within inherited process environments.

### What the stealer collects

The collector is designed for developer workstations, CI/CD workers, cloud workloads, containers, and LiteLLM proxy deployments. It targets:

- SSH files, GPG private keys, TLS private keys, shell histories, database client histories, and key files such as `.pem`, `.key`, `.p12`, and `.pfx`
- Chromium-family passwords, cookies, web data, and history, plus Firefox login databases, key databases, and browsing history
- AWS, Azure, and Google Cloud credentials; Kubernetes configurations and service-account tokens; Docker and Swarm secrets; GitHub CLI, `rclone`, and `.netrc` credentials
- CI/CD and infrastructure-as-code secrets from GitLab Runner, Jenkins, Vault, Terraform, and Packer
- Package manager and source-control credentials from `.git-credentials`, `.npmrc`, `.pypirc`, pip, Yarn, Maven, Gradle, Composer, RubyGems, and Cargo
- AI development credentials and configurations for Cursor, Claude, Codex, Gemini, GitHub Copilot, Hugging Face, Kiro, Windsurf, Zed, Continue, aider, goose, opencode, Qwen, Cline, Roo, and Cody
- Environment variables from the current process and every readable `/proc/<pid>/environ` file on Linux
- Cloud instance credentials from AWS IMDS and ECS task metadata, Google Cloud metadata, and Azure IMDS
- LiteLLM proxy data reached through `DATABASE_URL`, including `LiteLLM_CredentialsTable` and `LiteLLM_ProxyModelTable`

The statically decoded source declares its main collection modules directly:

![](/img/RealTimePostImage/post/litellm-hijacked-again/credential-modules.png)

On Linux, the environment-variable collector also reads other processes' environments:

![](/img/RealTimePostImage/post/litellm-hijacked-again/process-environment.png)

The LiteLLM-specific database module is particularly damaging. It starts a child Python process, connects through Prisma, and attempts to dump stored LLM provider credentials from `LiteLLM_CredentialsTable` along with proxy model configuration from `LiteLLM_ProxyModelTable`. A compromised proxy host can therefore expose credentials for many upstream AI providers at once.

The shortened decoded query logic confirms both table targets:

![](/img/RealTimePostImage/post/litellm-hijacked-again/database-collection.png)

The cloud module also attempts to validate stolen AWS credentials through `GetCallerIdentity`. Defenders should account for both local theft and subsequent use of exported cloud credentials outside the affected environment.

## Encrypted exfiltration to a LiteLLM look-alike domain

The stealer serializes collected data as JSON and encrypts it with a randomly generated AES-256-CBC key. It then wraps that key using an embedded RSA-4096 public key with OAEP-SHA256 and packages the encrypted material into a tar.gz archive.

The decoded excerpt below is shortened, and its destination is defanged for publication:

![](/img/RealTimePostImage/post/litellm-hijacked-again/c2-exfiltration.png)

The archive is sent over plaintext HTTP to `hxxp[:]//www[.]litellm[.]dev/healthcheck`. The request includes the static token `XWiA8gZNa7NcX2XRoAEb` in the `X-Token` header and an `X-SHA256` header. Although the transport is unencrypted, the application-layer envelope prevents defenders from recovering stolen content from a network capture without the attacker's RSA private key.

The domain `www[.]litellm[.]dev` is distinct from LiteLLM's legitimate `litellm[.]ai` domain. It must also not be confused with the previous incident's `models[.]litellm[.]cloud` exfiltration domain.

## `sitecustomize.py` creates an hourly remote-code loader

The injected `sitecustomize.py` module opens `/tmp/remote_code_loader.lock` and attempts to acquire a non-blocking exclusive `flock`. If no existing instance holds the lock, it calls `os.fork()`. The parent returns so Python startup can continue, while the child calls `os.setsid()`, redirects standard streams to `/dev/null`, changes its working directory to `/`, and enters an infinite hourly loop.

Each cycle retrieves a prospective C2 domain from:

`hxxps[:]//raw[.]githubusercontent[.]com/letters9813/pythonclient-test/main/domain.txt`

If the first valid domain resolves, the loader synchronously runs a second embedded copy of `privcollect`. It then fetches `hxxp[:]//{domain}/codepy` over plaintext HTTP and executes the response with `compile()` and `exec()`. There is no integrity check or authentication for the downloaded Python code, giving whoever controls the resolved server arbitrary code execution under the affected user's privileges.

The shortened local `sitecustomize.py` excerpt shows that an empty dead drop exits early, while a populated one enables remote execution. The constructed URL is defanged:

![](/img/RealTimePostImage/post/litellm-hijacked-again/remote-code-loader.png)

The embedded stealer differs from the `cook.py` copy in two important settings. It sets `PC_ONCE_PATH` to an empty string and `PC_ASYNC` to `False`. Consequently, it performs full collection and exfiltration synchronously on every successful hourly C2 cycle, while the `cook.py` copy is designed to complete once per host after successful exfiltration.

The zero-byte `domain.txt` observation at the time of writing affects only this conditional hourly path. It does not prevent `cook.py` from collecting and sending local secrets whenever Python processes the malicious `.pth` file, and the loader can be re-armed by changing the dead-drop content.

## Remediation

- Avoid every `litellm` 1.107.0 wheel. All seven platform wheels are affected. Pin `litellm==1.106.2` only after removing the startup hooks or from a newly built clean environment.
- Isolate any host or container where the affected wheel was installed or Python was started in its environment. Treat reachable credentials and data as compromised.
- Do not begin remediation by running `pip` inside an affected environment. Starting Python can execute `cook.pth` and `sitecustomize.py` again. First remove `cook.pth`, `cook.py`, `sitecustomize.py`, their matching compiled files under `__pycache__`, `/tmp/.pc_once_72129118c59f5636c0bb`, and `/tmp/remote_code_loader.lock` using tools that do not invoke the affected interpreter.
- Inspect for and terminate detached Python processes associated with `sitecustomize.py`, especially a process holding `/tmp/remote_code_loader.lock`, using `setsid`, or running with `/` as its working directory. Also investigate `/tmp/.pc_sq_*` and `/tmp/.pc_e_*` artifacts.
- Block and investigate access to `www[.]litellm[.]dev`, `raw[.]githubusercontent[.]com/letters9813/pythonclient-test/main/domain.txt`, and any domain returned by that dead drop. Preserve relevant proxy, DNS, endpoint, and cloud audit logs.
- Rotate all credentials accessible to the affected host, including browser passwords, SSH and GPG keys, TLS private keys, package publishing tokens, source-control tokens, cloud and Kubernetes credentials, AI development tokens, `DATABASE_URL`, LiteLLM master and virtual keys, and every provider credential stored in `LiteLLM_CredentialsTable`.
- Investigate any retrieval or execution of `/codepy`. Because this stage can execute arbitrary Python, its effects cannot be bounded by the behavior of the embedded stealer.
- Perform a forensic rebuild of affected virtual environments, hosts, containers, and images from verified artifacts. Rebuilding is safer than attempting to prove that every startup artifact, downloaded stage, and exposed secret was removed.

## Conclusions

The malicious `litellm` 1.107.0 demonstrates a critical gap between source provenance and artifact integrity. The source distribution lacks the executable payload files, while the wheel installs them directly into `site-packages` and activates them before normal application code runs. The sdist's altered build setting and the matching artifact metadata are important investigative leads, but they do not establish the exact root cause.

This second LiteLLM hijacking should not be conflated with the earlier TeamPCP incident. Both target the trust placed in a popular AI package and both steal broad developer and cloud credentials, but the current artifact uses different startup files, persistence behavior, and network infrastructure. Incident responders should scope each campaign using its own indicators.

JFrog Xray and JFrog Curation detect the malicious `litellm` 1.107.0 using XRAY-955589.

## Indicators of Compromise

- `litellm` 1.107.0 malicious (PyPI) - XRAY-955589
- Exfiltration URL: `hxxp[:]//www[.]litellm[.]dev/healthcheck`
- Exfiltration domain: `www[.]litellm[.]dev`
- C2 dead-drop URL: `hxxps[:]//raw[.]githubusercontent[.]com/letters9813/pythonclient-test/main/domain.txt`
- Conditional remote payload URL: `hxxp[:]//{domain}/codepy`
- Dead-drop repository: `letters9813/pythonclient-test`
- Exfiltration token: `X-Token: XWiA8gZNa7NcX2XRoAEb`
- Single-instance lock: `/tmp/remote_code_loader.lock`
- Run-once marker: `/tmp/.pc_once_72129118c59f5636c0bb`
- Temporary paths: `/tmp/.pc_sq_*` and `/tmp/.pc_e_*`
- LiteLLM database targets: `LiteLLM_CredentialsTable` and `LiteLLM_ProxyModelTable`
- Community tracking: [open LiteLLM security issue #47826](https://github.com/BerriAI/litellm/issues/47826)
