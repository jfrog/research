---
excerpt: "JFrog Security Research identified a new Shai-Hulud/Hades npm wave affecting 20 packages in the Leo/RStreams ecosystem."
title: "Shai-Hulud Continues: Hades Payload Hits Leo/RStreams npm Packages"
date: "June 25, 2026"
description: "Yair Benamou, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/shai-hulud-alright-lets-see-if-this-works.png
type: realTimePost
minutes: '8'
---

JFrog Security Research identified a new Shai-Hulud/Hades npm wave affecting 20 packages in the Leo/RStreams ecosystem. The malicious packages belong to a legitimate package family used for AWS-native event streaming, Lambda-based event handlers, and serverless data pipelines.

Our scanners detected the malicious versions shortly after publication. The payload is not a major functional rewrite of the previous Hades wave we covered in [Shai-Hulud - Miasma: The Spreading Blight Hits Red Hat npm Packages](https://research.jfrog.com/post/shai-hulud-miasma-redhat-cloud-services/). Instead, this wave looks like another turn of the same worm: same broad credential theft and propagation machinery, but with fresh package targets, new campaign text, and a small operator-seeding addition.

![](/img/RealTimePostImage/post/shai-hulud-alright-lets-see-if-this-works.png)

## What Is Leo/RStreams?

Leo, now commonly referred to as RStreams, is an AWS-native event streaming and messaging platform. It provides a light abstraction over AWS services such as Kinesis, Firehose, S3, Lambda, and DynamoDB. Developers use the Leo/RStreams Node SDK to push, pull, transform, and offload data through event queues.

This makes the affected package set especially sensitive. These libraries tend to show up close to cloud infrastructure, event pipelines, and CI/CD systems, exactly the places where npm installation can run with access to AWS credentials, GitHub tokens, npm publishing credentials, and application secrets.

Across the affected package set, npm reported approximately **~127K downloads in the last month** at the time of analysis. The full affected package list appears in the IOC section.

## Delivery Through binding.gyp

This wave uses the same evasive `binding.gyp` execution technique we described in previous Shai-Hulud reporting.

Instead of relying only on an obvious `preinstall` or `install` script in `package.json`, the malicious package can place execution inside `binding.gyp`. When npm sees a package with `binding.gyp` and no explicit install script, it falls back to running `node-gyp rebuild`. During that process, `node-gyp` expands shell commands embedded in `<!(...)` expressions.

Attackers can abuse this behavior to execute the payload during package installation while avoiding simple scanners that only inspect npm lifecycle scripts.

```json
{
  "targets": [
    {
      "target_name": "Setup",
      "type": "none",
      "sources": ["<!(node index.js > /dev/null 2>&1 && echo stub.c)"]
    }
  ]
}
```

## Payload Family

The payload belongs to the same Shai-Hulud lineage described in our previous Miasma and Hades analyses. It retains the familiar behavior:

- Broad credential collection from files, environment variables, shell history, GitHub CLI tokens, cloud credentials, package-manager tokens, and CI/CD environments.
- GitHub dead-drop exfiltration by creating repositories under a usable GitHub token and committing encrypted result files under `results/`.
- npm, PyPI, RubyGems, JFrog/Artifactory, GitHub Actions, and AI-tool persistence logic.
- `gh-token-monitor` dead-man switch behavior.
- GitHub Actions secret-dump workflow logic using `VARIABLE_STORE` and `format-results.txt`.
- SSH lateral movement using `ai_setup.sh` and `ai_init.js`.


## What Changed In This Wave?

The analyzed payload no longer uses the public campaign marker from Miasma or Hades. Earlier waves used markers such as:

```text
Miasma - The Spreading Blight
Hades - The End for the Damned
```

This sample instead uses:

```text
Alright Lets See If This Works
```

GitHub search already showed hundreds of public repositories using this new description string during our investigation.

![](/img/RealTimePostImage/post/shai-hulud-alright-repos-count.png)

At the time of the screenshot, GitHub returned **414 repository results** for the new marker. This is useful for hunting because it is visible at the repository metadata layer, without needing to recover payload contents from every infected package.

The token relay marker also changed. Earlier Miasma/Hades samples used threat strings such as:

```text
IfYouInvalidateThisTokenItWillNukeTheComputerOfTheOwner
```

The current sample uses:

```text
RevokeAndItGoesKaboom
```


## Seed PAT Path

One small addition in this sample is a gated `SEED_PAT` path.

The code does not use `SEED_PAT` unconditionally. It first checks whether the GitHub Actions `GITHUB_REPOSITORY` environment value contains `Seeder`. Only in that case does it read `SEED_PAT` and add that token as a GitHub sender.

![](/img/RealTimePostImage/post/seed-pat-code.png)

The payload also includes the decoded strings:

```text
Seeder
SEED_PAT
```

This looks more like an operator or testing bootstrap path than a normal victim-discovery mechanism. In other words, a controlled workflow can provide a GitHub PAT through `SEED_PAT`, but ordinary victim environments are unlikely to have this variable unless the attacker arranged it.

## Exfiltration And GitHub Dead Drop

As in previous Shai-Hulud waves, the payload can package stolen data into encrypted envelopes and exfiltrate through GitHub. If a usable token is available, it can create a repository under the token owner and write result files under:

```text
results/results-<timestamp>-<counter>.json
```

The payload still contains Anthropic camouflage:

```text
api.anthropic.com
v1/api
```

As in the previous Miasma analysis, this appears to be use of a legitimate-looking API host/path as camouflage rather than evidence of a compromised Anthropic service.

## The Risks

The Leo/RStreams package set is tied to cloud-native and serverless workloads. A compromise here can expose developer workstations, CI/CD systems, AWS-backed applications, GitHub repositories, package publishing credentials, and downstream package consumers.

The notable story is not that the payload is radically new. It is that Shai-Hulud continues to move across legitimate package ecosystems while changing just enough indicators to make stale detections less effective.

## Detection And Remediation

JFrog Curation customers using an immaturity policy were fully protected from this attack, as all of the hijacked packages were flagged in less than 24 hours. Curation has an automatic compliance version selection (CVS) mechanism to ensure developer and CI/CD seamless fallback to compliant, non-malicious versions.

Recommended actions:

- Identify projects, lockfiles, CI logs, caches, and container images that installed the affected package versions.
- Remove affected versions and reinstall verified clean versions.
- Regenerate lockfiles from trusted metadata.
- Isolate affected machines and CI runners before revoking GitHub tokens.
- Remove `gh-token-monitor`, updater persistence, AI-tool hooks, and suspicious workflow files before credential rotation.
- Audit GitHub accounts for unexpected public repositories, `results/` files, suspicious workflow changes, and commit markers such as `RevokeAndItGoesKaboom`.
- Audit npm accounts for unexpected package releases or patch-version bumps.
- Rotate GitHub, npm, cloud, CI/CD, SSH, Docker, Vault, and package-registry credentials after persistence removal is verified.

## Conclusion

This wave shows that Shai-Hulud remains active and continues to reuse the same proven payload family across new trusted package ecosystems. The Leo/RStreams compromise does not introduce a fundamentally new malware architecture, but it does update campaign markers, token handling, and includes a gated `SEED_PAT` path that appears useful for operator-controlled testing or bootstrapping.

For defenders, the lesson is straightforward: do not rely only on old campaign names such as Miasma or Hades. Hunt for behavior, not just branding.

These malicious packages are detected by JFrog Xray and JFrog Curation.

## IOCs

### Package IOCs

| Package | Type | Xray ID | Affected version | Last-month downloads |
| :-- | :-- | :-- | :-- | ---: |
| `leo-auth` | npm | XRAY-1009715 | `4.0.6` | 1,577 |
| `leo-aws` | npm | XRAY-1009716 | `2.0.4` | 5,160 |
| `leo-cache` | npm | XRAY-1009726 | `1.0.2` | 1,049 |
| `leo-cdk-lib` | npm | XRAY-1009721 | `0.0.2` | 17 |
| `leo-cli` | npm | XRAY-1009724 | `3.0.3` | 321 |
| `leo-config` | npm | XRAY-1009720 | `1.1.1` | 4,967 |
| `leo-connector-elasticsearch` | npm | XRAY-1009713 | `2.0.6` | 2,014 |
| `leo-connector-mongo` | npm | XRAY-1009714 | `3.0.8` | 1,352 |
| `leo-connector-mysql` | npm | XRAY-1009729 | `3.0.3` | 164 |
| `leo-connector-oracle` | npm | XRAY-1009718 | `2.0.1` | 72 |
| `leo-connector-redshift` | npm | XRAY-1009725 | `3.0.6` | 184 |
| `leo-cron` | npm | XRAY-1009723 | `2.0.2` | 238 |
| `leo-logger` | npm | XRAY-1009727 | `1.0.8` | 11,655 |
| `leo-sdk` | npm | XRAY-1009717 | `6.0.19` | 5,530 |
| `leo-streams` | npm | XRAY-1009728 | `2.0.1` | 3,761 |
| `rstreams-metrics` | npm | XRAY-1009731 | `2.0.2` | 1,861 |
| `rstreams-shard-util` | npm | XRAY-1009732 | `1.0.1` | 31 |
| `serverless-convention` | npm | XRAY-1009719 | `2.0.4` | 2,398 |
| `serverless-leo` | npm | XRAY-1009730 | `3.0.14` | 3,625 |
| `solo-nav` | npm | XRAY-1009722 | `1.0.1` | 7 |
| `prism-silq` | npm | XRAY-1009778 | `1.0.1` | 256 |
| `hexo-shoka-swiper` | npm | XRAY-1010076 | `1.0.1` | 376 |
| `hexo-deployer-wrangler` | npm | XRAY-1009793 | `1.0.1` | 100 |
| `@immobiliarelabs/backstage-plugin-gitlab-backend` | npm | XRAY-1011692 | `3.0.3` | 40,816 |
| `@immobiliarelabs/backstage-plugin-gitlab-backend` | npm | XRAY-1011692 | `4.0.2` | — |
| `@immobiliarelabs/backstage-plugin-gitlab-backend` | npm | XRAY-1011692 | `5.2.1` | — |
| `@immobiliarelabs/backstage-plugin-gitlab-backend` | npm | XRAY-1011692 | `6.13.1` | — |
| `@immobiliarelabs/backstage-plugin-gitlab-backend` | npm | XRAY-1011692 | `7.0.2` | — |
| `@immobiliarelabs/backstage-plugin-gitlab` | npm | XRAY-1011689 | `1.0.1` | 35,969 |
| `@immobiliarelabs/backstage-plugin-gitlab` | npm | XRAY-1011689 | `2.1.2` | — |
| `@immobiliarelabs/backstage-plugin-gitlab` | npm | XRAY-1011689 | `3.0.3` | — |
| `@immobiliarelabs/backstage-plugin-gitlab` | npm | XRAY-1011689 | `4.0.2` | — |
| `@immobiliarelabs/backstage-plugin-gitlab` | npm | XRAY-1011689 | `5.2.1` | — |
| `@immobiliarelabs/backstage-plugin-gitlab` | npm | XRAY-1011689 | `6.13.1` | — |
| `@immobiliarelabs/backstage-plugin-gitlab` | npm | XRAY-1011689 | `7.0.2` | — |
| `@immobiliarelabs/backstage-plugin-ldap-auth-backend` | npm | XRAY-1011690 | `1.1.3` | 2,212 |
| `@immobiliarelabs/backstage-plugin-ldap-auth-backend` | npm | XRAY-1011690 | `2.0.5` | — |
| `@immobiliarelabs/backstage-plugin-ldap-auth-backend` | npm | XRAY-1011690 | `3.0.2` | — |
| `@immobiliarelabs/backstage-plugin-ldap-auth-backend` | npm | XRAY-1011690 | `4.3.2` | — |
| `@immobiliarelabs/backstage-plugin-ldap-auth-backend` | npm | XRAY-1011690 | `5.2.1` | — |
| `@immobiliarelabs/backstage-plugin-ldap-auth` | npm | XRAY-1011691 | `1.1.4` | 1,699 |
| `@immobiliarelabs/backstage-plugin-ldap-auth` | npm | XRAY-1011691 | `2.0.5` | — |
| `@immobiliarelabs/backstage-plugin-ldap-auth` | npm | XRAY-1011691 | `3.0.2` | — |
| `@immobiliarelabs/backstage-plugin-ldap-auth` | npm | XRAY-1011691 | `4.3.2` | — |
| `@immobiliarelabs/backstage-plugin-ldap-auth` | npm | XRAY-1011691 | `5.2.1` | — |

Together, these packages accounted for approximately **~127K npm downloads in the last month** at the time of analysis.

### Decoded campaign and token markers

```text
Alright Lets See If This Works
RevokeAndItGoesKaboom
TheBeautifulSandsOfTime
thebeautifulmarchoftime
Seeder
SEED_PAT
```

### Public keys embedded in the current payload

These keys are present after decrypting embedded payload blobs in the current sample:

```text
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAut0YWEh9/gZIsSoF6feF
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAwtmpAkLxoe3q3BxHOLPE
```

### Network and service indicators

```text
hxxps[:]//api[.]anthropic[.]com/v1/api
hxxps[:]//api[.]github[.]com
hxxps[:]//api[.]github[.]com/search/commits?q=firedalazer
hxxps[:]//github[.]com/oven-sh/bun/releases/download/bun-v1.3.13/
hxxps[:]//github[.]com/oven-sh/bun/releases/download/bun-v1.3.14/
```

### Host and persistence indicators

```text
/tmp/p*.js
/tmp/b-*/bun
/tmp/b-*/b.zip
<tmp>/.bun_ran
~/.config/gh-token-monitor/
~/.config/gh-token-monitor/token
~/.config/gh-token-monitor/handler
~/.local/bin/gh-token-monitor.sh
~/.config/systemd/user/gh-token-monitor.service
~/Library/LaunchAgents/com.user.gh-token-monitor.plist
~/.local/share/updater/update.py
~/.local/share/updater/
update-monitor.service
~/.config/index.js
ai_setup.sh
ai_init.js
```

### Repository and workflow indicators

```text
results/results-*.json
Alright Lets See If This Works
RevokeAndItGoesKaboom
Run Copilot
VARIABLE_STORE
format-results
format-results.txt
OIDC_PACKAGES
WORKFLOW_ID
REPO_ID_SUFFIX
.cursor/rules/setup.mdc
.gemini/settings.json
.cursorrules
.windsurfrules
.github/copilot-instructions.md
mcp.json
.aider.conf.yml
```