---
excerpt: The JFrog security research team identified a new version of the Shai-Hulud supply-chain malware spreading through compromised npm packages, starting with keyv and cacheable. The worm harvests credentials, publishes itself to every writable npm package, and plants execution hooks in GitHub repositories. If you installed a compromised version, assume your environment is affected.
title: "Major Shai Hulud campaign strikes npm again, affecting keyv and 400+ packages"
date: "August 4, 2026"
description: "Shavit Satou, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/hulud_august.png
type: realTimePost
minutes: '8'
---

The JFrog security research team identified a new version of the Shai-Hulud supply-chain malware affecting 400+ packages across 1700+ versions. The compromise started with the `keyv` and `cacheable` npm packages. Both are widely used caching libraries, and `keyv` is a transitive dependency of many popular tools. If you installed a compromised version, assume your environment is affected. This is an ongoing investigation. We will update this post as we confirm more affected packages and victim scope.

Important note: on npm 12 or newer, `preinstall` lifecycle hooks *do not* run by default, so the malware does not execute during install.

<div align="center">

![](/img/RealTimePostImage/post/hulud_august.png)

</div>

## Technical analysis

We analyzed a 710 KB JavaScript payload from the infected `keyv@6.0.0` package. It is a newer variant of Shai-Hulud, and is obfuscated differently compared to previous versions of the campaign. They proudly identify it as Shai-Hulud via the GitHub repository description `Shai-Hulud: Here We Go Again`. It has four connected objectives:

1. Collect local, CI, cloud, Kubernetes, and Vault secrets.  
2. Exfiltrate encrypted results through a dynamic HTTPS endpoint or attacker-created public GitHub repositories.  
3. Use stolen npm credentials to publish infected patch releases of every writable package.  
4. Use GitHub credentials and GitHub Actions to infect repositories and steal more credentials.

The analyzed sample's SHA-256 is `9fc2570b7cef51c1b8df116d144d11ff4096357be7d2c4c6367cfc2509cf1bcc`.

### npm infection path

An infected package runs `node setup.mjs` during `preinstall`. The loader is a small Node.js bootstrap that works on Linux, macOS, and Windows. It uses an installed `bun` executable when available. Otherwise it downloads Bun 1.3.13 from the official release on GitHub, extracts it, and runs the real payload, `math_init.js`. They remove the temporary Bun copy right afterwards.

<div align="center">

![][image1]

</div>

The worming logic is what makes this campaign dangerous, similarly to previous Shai-Hulud-style campaigns. When the collector finds an npm token, it validates the token before exfiltration even completes. The token must map to an npm token object with `bypass_2fa === true` and package write permission. For every package writable with that token, the worm:

1. Downloads the current `latest` tarball.  
2. Copies the running sample to `package/math_init.js`.  
3. Writes the loader to `package/setup.mjs`.  
4. Replaces the package's complete `scripts` object and sets `scripts.preinstall` to `node setup.mjs`.  
5. Increments the patch version.  
6. Repackages and publishes with a direct authenticated `PUT` to the npm registry.

<div align="center">

![][image2]

</div>

### Repository execution hooks

The worm also commits five files to GitHub branches it can reach:

```
.vscode/tasks.json
.vscode/setup.mjs
.claude/math_init.js
.claude/settings.json
.claude/setup.mjs
```

The configuration is mutually reinforcing. `.vscode/tasks.json` defines an `Environment Setup` task that runs `node .claude/setup.mjs` when a folder opens. `.claude/settings.json` defines a `SessionStart` hook that runs `node .vscode/setup.mjs`. Both setup files contain the Bun bootstrap, and `.claude/math_init.js` is the worm. Opening an infected repository in VS Code, or starting a Claude session in it, is enough to execute the payload.

Commits are pushed through GitHub's GraphQL `createCommitOnBranch` mutation to up to 50 branches per repository, skipping `dependabot/*` and `copilot/*`. The commit message is `chore: update config` with a forged `Co-authored-by: claude <claude@users.noreply.github.com>` trailer (even though it was not committed by Claude). Protected branches fail at commit time, but one writable branch is enough.

<div align="center">

![][image3]

</div>

### GitHub Actions secret harvesting

For a stolen `ghp_` or `gho_` token with `workflow` scope, the worm runs a more targeted operation:

1. Enumerates up to 100 repositories pushed since September 2025 where the token has push permission.  
2. Checks whether each repository or its organization has Actions secrets.  
3. Creates the branch `dependabot/github_actions/format/setup-formatter` from the default branch.  
4. Adds `.github/workflows/codeql_analysis.yml` with commit message `Add CodeQL Analysis`, committed as `github-advanced-security[bot]`.  
5. Waits for the workflow to complete, downloads the `format-results` artifact, and reads `format-results.txt`.  
6. Deletes the workflow run and the temporary branch.

The injected workflow is named `Run Copilot` and does one thing: assign `${{ toJSON(secrets) }}` to an environment variable, write it to `format-results.txt`, and upload the file as an artifact. The repository's full secrets context leaves GitHub through a legitimate-looking artifact download. Recovered npm and GitHub tokens feed back into the collector, which makes the whole loop recursive.

The workflow pins `actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` and `actions/upload-artifact@bbbca2ddaa5d8feaa63e36b76fdaad77386f024f`, which look routine in a run log.

### Credential collection

The filesystem collector reads hundreds of configured paths across Linux, macOS, and Windows: package manager tokens (`npm`, Yarn, PyPI, Verdaccio), cloud configuration (AWS, Azure, GCP, Alibaba, Tencent, Hetzner), Kubernetes and Helm config, `.env` files, shell histories, SSH private keys, VPN profiles, browser credential stores, instant messengers, crypto wallet material, AI tool credentials (OpenAI, Anthropic, Claude, Cursor, Codex, Gemini, and others), `/etc/shadow`, and `/proc/self/environ`.

The collector does not stop at files:

- It runs `gh auth token` to pull a GitHub token from the CLI.  
- On Linux GitHub Actions runners, it uses `sudo python3` to read the `Runner.Worker` process memory through `/proc/<pid>/mem` and extracts secret-store objects marked `isSecret:true`.  
- It resolves AWS credentials from environment, profiles, web-identity tokens, ECS metadata, and IMDSv2, then enumerates Secrets Manager and SSM Parameter Store (with `WithDecryption: true`) across 17 regions.  
- It reads all accessible Kubernetes Secrets from the in-cluster service account or kubeconfig, and enumerates HashiCorp Vault KV mounts.

<div align="center">

![][image4]

</div>

<div align="center">

![][image5]

</div>

<div align="center">

![][image6]

</div>

### Command and control

The C2 endpoint is not hardcoded in the sample. The malware calls the Ethereum mainnet contract `0xE1f2395ee43e45A1556EC6438a88c31B83493103` through public RPC providers, using `eth_call` with selector `0x53ed5143`. The response decodes to a list of C2 domains, contacted over HTTPS on path `/router`. If the contract fails, the malware searches GitHub commit messages for the marker `thebeautifulmarchoftime` and verifies a signed payload in a second marker, `thebeautifulsnadsoftime`  (the misspelling is in the code), against an embedded RSA-4096 public key. Both markers make good hunting artifacts.

<div align="center">

![][image7]

</div>

<div align="center">

![][image8]

</div>

Exfiltrated results are serialized to JSON, gzipped, encrypted with a random AES-256-GCM key, and wrapped with an embedded RSA public key. A successful C2 response can contain a `code` field, which the malware passes to `eval`. That is full remote code execution inside the compromised process.

<div align="center">

![][image9]

</div>

If direct C2 is unavailable, the sample falls back to GitHub. Using a stolen PAT, it creates a public repository named from Dune vocabulary (`sardaukar`, `fremen`, `atreides`, `sandworm`, `melange`, and so on) with the description `Shai-Hulud: Here We Go Again`, and commits encrypted results under `results/`. If the victim account has no organizations, the worm also publishes the victim's own PAT, double-base64 encoded, in a commit message reading `IfYouBlockThisAPIKeyItWillCrashTheLiveProductionServersOfAllThirdPartyClients:<encoded-token>`. Other infected hosts search public commit messages for that marker and reuse tokens that still work. This gives the campaign a decentralized fallback channel built on GitHub search.

### Targeted trusted-publishing attack

The sample has one special-cased path. Inside a GitHub Actions run where `GITHUB_WORKFLOW_REF` contains `release-drafter.yml` and `GITHUB_REPOSITORY` contains `/opensearch-js`, it requests an Actions OIDC token with audience `npm:registry.npmjs.org`, adds a malicious `optionalDependencies` entry pointing at a fixed attacker commit to `@opensearch-project/opensearch`, exchanges the OIDC token for a publish token, and publishes. It also creates a Sigstore bundle through Fulcio and Rekor, so the malicious tarball gets valid provenance from the trusted workflow context. In that repository, other workflows exit before the general collection path runs. None of this is accidental.

<div align="center">

![][image10]

</div>

### Embedded but inactive capabilities

The encrypted payload set includes scripts with no call site in the observed execution path: a Bash Bun loader, a Python Bun loader, and a `gh-token-monitor` installer for macOS LaunchAgents and Linux user systemd. The monitor stores a GitHub token and a handler, polls the token every 60 seconds for up to 24 hours, and runs the handler when the token starts returning 4xx, presumably to act when defenders revoke it. We assess these are development or fallback capabilities. Hunt for the artifacts, but do not report them as active persistence without evidence of installation.

<div align="center">

![][image11]

</div>

### Evasion

Most strings use a custom position-dependent substitution cipher derived from PBKDF2-HMAC-SHA256. Larger payloads are gzipped and AES-256-GCM encrypted. Outside CI, the sample relaunches itself detached with `_NODE_RUNTIME_INIT=1`, holds a PID lock at `/tmp/tmp.dpkg_14527.lock`, installs empty `SIGINT`/`SIGTERM` handlers, swallows top-level exceptions, and exits zero. The code contains the string `Exiting as russian language detected!`, but its predicate always returns `false`. There is no active language exclusion.

<div align="center">

![][image12]

</div>

## Detection and Remediation guidance

JFrog Curation customers using an immaturity policy were fully protected from this attack, as all of the hijacked packages were flagged in less than 24 hours. Curation has an automatic compliance version selection (CVS) mechanism to ensure developer and CI/CD seamless fallback to compliant, non-malicious versions.

JFrog Xray users can check if any of their artifacts are affected by using the new Label Impact Search, with the label `Shai-Hulud: Cacheable and Keyv`  -

![][image13]

If you installed any package version in the table below, treat the host as compromised. CI runners and build machines are the highest-value targets and should be rebuilt, not cleaned.

### Step 1: Isolate and preserve evidence

Isolate affected systems. Preserve package tarballs, npm logs, CI logs, GitHub audit logs, and runner images before cleanup. You will need them to bound the exposure window.

### Step 2: Revoke and rotate credentials

Revoke all npm tokens available to affected users and CI jobs, starting with tokens that have `bypass_2fa` and write permission. Revoke GitHub PATs, OAuth tokens, and Actions tokens exposed to affected systems. Then rotate everything else present on the host or runner: AWS, Azure, GCP, Kubernetes, Vault, database, SSH, VPN, AI-service, and wallet credentials. Assume any secret the collector could read was read.

### Step 3: Audit GitHub activity

Search all branches, not just default branches, for the five hook files (`.vscode/tasks.json`, `.vscode/setup.mjs`, `.claude/math_init.js`, `.claude/settings.json`, `.claude/setup.mjs`). Review audit logs for the commit message `chore: update config`, the branch `dependabot/github_actions/format/setup-formatter`, workflows that created and quickly deleted `codeql_analysis.yml`, and any run that produced a `format-results` artifact. Alert on any workflow that serializes `${{ toJSON(secrets) }}`.

### Step 4: Remove malicious packages and rebuild

Disable or remove the compromised versions listed below. Clear package-manager caches and existing `node_modules` trees. Rebuild CI runners and developer environments from clean images. Publish clean package versions only after publisher credentials and trusted-publishing configuration are replaced.

### Step 5: Review npm trusted publishing

Review npm trusted publishers and GitHub OIDC configuration, especially release automation based on `release-drafter.yml`. The OpenSearch targeting shows the actor understands and abuses trusted publishing flows.

## Conclusions

This Shai-Hulud variant is a credential stealer, an npm worm, and a GitHub repository infector in one payload. Its propagation does not depend on a fixed package list. One stolen npm token with broad write access can turn every package owned by that publisher into the next wave. GitHub tokens extend the loop by exposing Actions secrets and planting execution hooks where developers are likely to trigger them.

If an affected version ran in your environment, removing the package is not enough. Revoke credentials, inspect every writable repository branch, and rebuild the host or CI runner from a clean image.

## Compromised packages (Ongoing)

The initial wave consisted of `keyv` `6.0.0`, `cacheable` `2.5.1`, and the `@cacheable/*` family. Because the worm republishes every package writable with the credentials it steals, the list below keeps growing. It is current as of this writing and will be updated. Xray IDs are being assigned and will be added.

| Package | Type | Version | Xray ID |
| :---- | :---- | :---- | :---- |
| `@adminide-stack/clock-tik-browser` | npm | `12.0.24` | XRAY-1042725 |
| `@adminide-stack/yantra-mobile` | npm | `12.0.33` | XRAY-1042684 |
| `@arv-bedrock/auth` | npm | `1.1.7`, `1.1.8` | XRAY-1042359 |
| `@arv-bedrock/auth-admin` | npm | `1.0.2`, `1.0.3` | XRAY-1042352 |
| `@arv-bedrock/auth-sso` | npm | `1.6.1`, `1.6.2` | XRAY-1042354 |
| `@arv-bedrock/auth-sso-backend` | npm | `1.7.1`, `1.7.2` | XRAY-1042299 |
| `@arv-bedrock/logger` | npm | `1.7.1`, `1.7.2` | XRAY-1042305 |
| `@cacheable/memory` | npm | `2.2.1` | XRAY-1042321 |
| `@cacheable/net` | npm | `2.1.1` | XRAY-1042290 |
| `@cacheable/node-cache` | npm | `3.1.2` | XRAY-1042338 |
| `@cacheable/utils` | npm | `2.5.1` | XRAY-1042294 |
| `@deliveroo/determinator` | npm | `0.2.1` | XRAY-1042319 |
| `@deliveroo/reevent` | npm | `1.0.1` | XRAY-1042350 |
| `@hubsync/web-sdk-react` | npm | `6.3.7`, `6.3.8`, `6.3.9`, `6.3.10`, `6.3.11`, `6.3.12`, `6.3.13`, `6.3.14`, `6.3.15`, `6.3.16`, `6.3.17`, `6.3.18`, `6.3.19`, `6.3.20`, `6.3.21`, `6.3.22`, `6.3.23`, `6.3.24`, `6.3.25`, `6.3.26`, `6.3.27`, `6.3.28`, `6.3.29`, `6.3.30`, `6.3.31`, `6.3.32`, `6.3.33` | XRAY-1042366 |
| `@keyv/bigmap` | npm | `6.0.0` | XRAY-1042759 |
| `@keyv/cloudflare-kv` | npm | `6.0.0` | XRAY-1042719 |
| `@keyv/compress-brotli` | npm | `6.0.0` | XRAY-1042742 |
| `@keyv/compress-gzip` | npm | `6.0.0` | XRAY-1042761 |
| `@keyv/compress-lz4` | npm | `6.0.0` | XRAY-1042723 |
| `@keyv/dynamo` | npm | `6.0.0` | XRAY-1042738 |
| `@keyv/encrypt-node` | npm | `6.0.0` | XRAY-1042710 |
| `@keyv/encrypt-web` | npm | `6.0.0` | XRAY-1042758 |
| `@keyv/etcd` | npm | `6.0.0` | XRAY-1042734 |
| `@keyv/memcache` | npm | `6.0.0` | XRAY-1042731 |
| `@keyv/mongo` | npm | `6.0.0` | XRAY-1042716 |
| `@keyv/mysql` | npm | `6.0.0` | XRAY-1042703 |
| `@keyv/postgres` | npm | `6.0.0` | XRAY-1042755 |
| `@keyv/redis` | npm | `6.0.0` | XRAY-1042754 |
| `@keyv/serialize-msgpackr` | npm | `6.0.0` | XRAY-1042737 |
| `@keyv/serialize-superjson` | npm | `6.0.0` | XRAY-1042687 |
| `@keyv/sqlite` | npm | `6.0.0` | XRAY-1042760 |
| `@keyv/test-suite` | npm | `6.0.0` | XRAY-1042730 |
| `@keyv/valkey` | npm | `6.0.0` | XRAY-1042749 |
| `@nebula.js/cli` | npm | `7.1.2` | XRAY-1042706 |
| `@nebula.js/cli-build` | npm | `7.1.2` | XRAY-1042691 |
| `@nebula.js/cli-sense` | npm | `7.1.2` | XRAY-1042683 |
| `@nebula.js/cli-serve` | npm | `7.1.2` | XRAY-1042712 |
| `@nebula.js/locale` | npm | `0.6.2` | XRAY-1042764 |
| `@nebula.js/nucleus` | npm | `0.5.1` | XRAY-1042763 |
| `@nebula.js/sn-action-button` | npm | `2.3.1` | XRAY-1042697 |
| `@nebula.js/sn-animator` | npm | `2.13.1` | XRAY-1042718 |
| `@nebula.js/sn-distributionplot` | npm | `1.0.7` | XRAY-1042692 |
| `@nebula.js/sn-layout-container` | npm | `4.4.1` | XRAY-1042727 |
| `@nebula.js/sn-line-chart` | npm | `2.7.1` | XRAY-1042724 |
| `@nebula.js/sn-listbox` | npm | `0.19.3` | XRAY-1042729 |
| `@nebula.js/sn-map` | npm | `0.12.7` | XRAY-1042757 |
| `@nebula.js/sn-nav-menu` | npm | `0.14.2` | XRAY-1042345 |
| `@nebula.js/sn-org-chart` | npm | `1.7.1` | XRAY-1042728 |
| `@nebula.js/sn-shape` | npm | `1.5.1` | XRAY-1042739 |
| `@nebula.js/sn-slider` | npm | `0.20.1` | XRAY-1042708 |
| `@nebula.js/sn-tabbed-container` | npm | `2.4.1` | XRAY-1042750 |
| `@nebula.js/snapshooter` | npm | `0.6.1` | XRAY-1042721 |
| `@nebula.js/stardust` | npm | `7.1.2` | XRAY-1042744 |
| `@nebula.js/test-utils` | npm | `0.6.1` | XRAY-1042720 |
| `@nebula.js/theme` | npm | `0.6.1` | XRAY-1042753 |
| `@onereach/authorizer-helper` | npm | `0.0.11`, `0.0.12` | XRAY-1042443 |
| `@onereach/bandwidth-steps-voice-bxml` | npm | `0.1.1`, `0.1.2` | XRAY-1042466 |
| `@onereach/billing-dto` | npm | `27.2.1`, `27.2.2` | XRAY-1042349 |
| `@onereach/billing-shared` | npm | `27.2.1`, `27.2.2` | XRAY-1042554 |
| `@onereach/cb-schema-translator` | npm | `1.3.1`, `1.3.2` | XRAY-1042393 |
| `@onereach/channel-transformer` | npm | `0.0.66`, `0.0.67` | XRAY-1042675 |
| `@onereach/channel-transformers` | npm | `0.0.5`, `0.0.6` | XRAY-1042425 |
| `@onereach/ckeditor5-build-classic` | npm | `30.0.1`, `30.0.2` | XRAY-1042526 |
| `@onereach/condition-builder` | npm | `1.0.8`, `1.0.9` | XRAY-1042450 |
| `@onereach/content-builder` | npm | `0.0.18`, `0.0.19` | XRAY-1042390 |
| `@onereach/content-builder-template-compiler` | npm | `0.0.3`, `0.0.4` | XRAY-1042569 |
| `@onereach/expression-components` | npm | `9.1.1`, `9.1.2` | XRAY-1042389 |
| `@onereach/font-icons` | npm | `27.0.2`, `27.0.3` | XRAY-1042678 |
| `@onereach/get-version-data` | npm | `3.1.2`, `3.1.3` | XRAY-1042479 |
| `@onereach/idw-apps` | npm | `0.1.3`, `0.1.4` | XRAY-1042531 |
| `@onereach/idw-contracts` | npm | `0.1.2`, `0.1.3` | XRAY-1042469 |
| `@onereach/idw-init-account-resources` | npm | `1.0.1`, `1.0.2` | XRAY-1042401 |
| `@onereach/idw-sdk` | npm | `0.1.2`, `0.1.3` | XRAY-1042551 |
| `@onereach/idw-ui-components` | npm | `0.1.2`, `0.1.3` | XRAY-1042404 |
| `@onereach/lambda-invocation` | npm | `1.2.1`, `1.2.2` | XRAY-1042566 |
| `@onereach/messengers-infobip-sdk` | npm | `0.1.1`, `0.1.2` | XRAY-1042575 |
| `@onereach/or-browser` | npm | `0.0.48`, `0.0.49` | XRAY-1042651 |
| `@onereach/or-browser-next` | npm | `0.0.11`, `0.0.12` | XRAY-1042637 |
| `@onereach/or-content-builder-renderer` | npm | `0.0.2`, `0.0.3` | XRAY-1042658 |
| `@onereach/or-file-uploader-next` | npm | `0.0.8`, `0.0.9` | XRAY-1042618 |
| `@onereach/or-pro` | npm | `1.13.1`, `1.13.2` | XRAY-1042407 |
| `@onereach/or-sdk-agent-cli` | npm | `0.0.6`, `0.0.7` | XRAY-1042605 |
| `@onereach/orest-cli` | npm | `2.4.1`, `2.4.2` | XRAY-1042582 |
| `@onereach/orest-input-cli` | npm | `1.18.1`, `1.18.2` | XRAY-1042638 |
| `@onereach/orest-jest-presets` | npm | `0.0.3`, `0.0.4` | XRAY-1042405 |
| `@onereach/orest-vue-demi-vue2` | npm | `0.0.4`, `0.0.5` | XRAY-1042403 |
| `@onereach/orest-vue-demi-vue3` | npm | `0.0.4`, `0.0.5` | XRAY-1042461 |
| `@onereach/orest-vue3` | npm | `0.0.4`, `0.0.5` | XRAY-1042438 |
| `@onereach/phonenumber-interpreter` | npm | `0.0.18`, `0.0.19` | XRAY-1042679 |
| `@onereach/pnpm-audit-junit` | npm | `1.0.3`, `1.0.4` | XRAY-1042519 |
| `@onereach/postcss-scoped-selector` | npm | `1.2.1`, `1.2.2` | XRAY-1042464 |
| `@onereach/regex-helper` | npm | `0.5.16`, `0.5.17` | XRAY-1042392 |
| `@onereach/regular-expressions` | npm | `0.5.23`, `0.5.24` | XRAY-1042465 |
| `@onereach/regular-expressions-test` | npm | `0.0.4`, `0.0.5` | XRAY-1042522 |
| `@onereach/rwc-client` | npm | `6.4.7`, `6.4.8` | XRAY-1042483 |
| `@onereach/salesforce-miaw-client` | npm | `0.0.3`, `0.0.4` | XRAY-1042647 |
| `@onereach/si-a-button` | npm | `0.0.3`, `0.0.4` | XRAY-1042528 |
| `@onereach/si-alert` | npm | `0.4.11`, `0.4.12` | XRAY-1042560 |
| `@onereach/si-checkbox` | npm | `0.6.5`, `0.6.6` | XRAY-1042543 |
| `@onereach/si-checkbox-group` | npm | `0.3.5`, `0.3.6` | XRAY-1042601 |
| `@onereach/si-code` | npm | `0.6.4`, `0.6.5` | XRAY-1042600 |
| `@onereach/si-collapsible-group` | npm | `0.6.4`, `0.6.5` | XRAY-1042460 |
| `@onereach/si-copyable-text` | npm | `0.4.11`, `0.4.12` | XRAY-1042648 |
| `@onereach/si-datepicker` | npm | `0.4.5`, `0.4.6` | XRAY-1042495 |
| `@onereach/si-divider` | npm | `0.4.11`, `0.4.12` | XRAY-1042411 |
| `@onereach/si-dropdown-advanced` | npm | `0.4.5`, `0.4.6` | XRAY-1042541 |
| `@onereach/si-dropdown-simple` | npm | `0.4.5`, `0.4.6` | XRAY-1042592 |
| `@onereach/si-header` | npm | `0.4.11`, `0.4.12`, `0.4.13` | XRAY-1042630 |
| `@onereach/si-list` | npm | `0.7.4`, `0.7.5` | XRAY-1042396 |
| `@onereach/si-merge-tag-input` | npm | `0.4.5`, `0.4.6` | XRAY-1042409 |
| `@onereach/si-radio-group` | npm | `0.3.5`, `0.3.6` | XRAY-1042558 |
| `@onereach/si-root` | npm | `0.9.4`, `0.9.5` | XRAY-1042485 |
| `@onereach/si-select` | npm | `0.1.3`, `0.1.4` | XRAY-1042478 |
| `@onereach/si-step-chooser` | npm | `0.4.4`, `0.4.5` | XRAY-1042645 |
| `@onereach/si-switch` | npm | `0.4.5`, `0.4.6` | XRAY-1042431 |
| `@onereach/si-text-message` | npm | `0.4.5`, `0.4.6` | XRAY-1042584 |
| `@onereach/si-textinput` | npm | `0.5.5`, `0.5.6` | XRAY-1042422 |
| `@onereach/si-validated-timestring-input` | npm | `0.3.5`, `0.3.6` | XRAY-1042655 |
| `@onereach/slack-helpers` | npm | `1.0.3`, `1.0.4` | XRAY-1042459 |
| `@onereach/ssml-editor` | npm | `2.0.12`, `2.0.13` | XRAY-1042494 |
| `@onereach/step-components` | npm | `0.1.37`, `0.1.38` | XRAY-1042456 |
| `@onereach/step-conversation` | npm | `1.0.41`, `1.0.42` | XRAY-1042590 |
| `@onereach/step-run-snowflake-query` | npm | `0.1.1`, `0.1.2` | XRAY-1042643 |
| `@onereach/step-voice` | npm | `7.0.32`, `7.0.33` | XRAY-1042620 |
| `@onereach/styles` | npm | `27.0.2`, `27.0.3` | XRAY-1042476 |
| `@onereach/time-interpreter` | npm | `1.0.30`, `1.0.31` | XRAY-1042677 |
| `@onereach/ts-memoize` | npm | `1.0.2`, `1.0.3` | XRAY-1042591 |
| `@onereach/types-contacts-api` | npm | `9.0.8`, `9.0.9` | XRAY-1042525 |
| `@onereach/ui-components` | npm | `27.0.2`, `27.0.3` | XRAY-1042439 |
| `@onereach/ui-components-common` | npm | `27.0.2`, `27.0.3` | XRAY-1042619 |
| `@onereach/ui-components-vue2` | npm | `27.0.2`, `27.0.3` | XRAY-1042462 |
| `@onereach/v-event-calendar` | npm | `0.1.22`, `0.1.23` | XRAY-1042607 |
| `@onereach/webform` | npm | `0.3.13`, `0.3.14` | XRAY-1042394 |
| `@or-sdk/account-settings` | npm | `1.3.6`, `1.3.7` | XRAY-1042413 |
| `@or-sdk/accounts` | npm | `2.3.5`, `2.3.6` | XRAY-1042480 |
| `@or-sdk/adapters` | npm | `0.3.6`, `0.3.7` | XRAY-1042437 |
| `@or-sdk/agents` | npm | `4.21.3`, `4.21.4` | XRAY-1042474 |
| `@or-sdk/api-tokens` | npm | `1.4.2`, `1.4.3` | XRAY-1042335 |
| `@or-sdk/api-tokens-lambda` | npm | `1.4.2`, `1.4.3` | XRAY-1042509 |
| `@or-sdk/apps` | npm | `1.2.6`, `1.2.7` | XRAY-1042579 |
| `@or-sdk/auth` | npm | `0.38.1`, `0.38.2` | XRAY-1042340 |
| `@or-sdk/authorizer` | npm | `0.26.7`, `0.26.8` | XRAY-1042336 |
| `@or-sdk/base` | npm | `0.44.4`, `0.44.5` | XRAY-1042515 |
| `@or-sdk/billing` | npm | `27.2.1`, `27.2.2` | XRAY-1042573 |
| `@or-sdk/billing-internal` | npm | `27.2.1`, `27.2.2` | XRAY-1042426 |
| `@or-sdk/bot-templates` | npm | `2.2.5`, `2.2.6` | XRAY-1042623 |
| `@or-sdk/bots` | npm | `1.7.1`, `1.7.2` | XRAY-1042597 |
| `@or-sdk/card-templates` | npm | `2.2.5`, `2.2.6` | XRAY-1042445 |
| `@or-sdk/cards` | npm | `1.2.5`, `1.2.6` | XRAY-1042557 |
| `@or-sdk/ccp` | npm | `10.15.4`, `10.15.5` | XRAY-1042455 |
| `@or-sdk/chat` | npm | `0.3.1`, `0.3.2` | XRAY-1042502 |
| `@or-sdk/contacts` | npm | `4.7.5`, `4.7.6` | XRAY-1042423 |
| `@or-sdk/content-request` | npm | `0.2.6`, `0.2.7` | XRAY-1042602 |
| `@or-sdk/data-hub` | npm | `0.26.5`, `0.26.6` | XRAY-1042496 |
| `@or-sdk/data-hub-svc` | npm | `2.3.5`, `2.3.6` | XRAY-1042628 |
| `@or-sdk/deployer` | npm | `1.7.5`, `1.7.6` | XRAY-1042664 |
| `@or-sdk/deployments` | npm | `2.1.5`, `2.1.6` | XRAY-1042448 |
| `@or-sdk/discovery` | npm | `1.12.1`, `1.12.2` | XRAY-1042408 |
| `@or-sdk/druid` | npm | `1.4.7`, `1.4.8` | XRAY-1042491 |
| `@or-sdk/event-manager` | npm | `1.1.5`, `1.1.6` | XRAY-1042499 |
| `@or-sdk/files` | npm | `3.11.6`, `3.11.7` | XRAY-1042482 |
| `@or-sdk/files-sync-node` | npm | `0.1.8`, `0.1.9` | XRAY-1042513 |
| `@or-sdk/flow-templates` | npm | `2.1.5`, `2.1.6` | XRAY-1042564 |
| `@or-sdk/flows` | npm | `2.7.8`, `2.7.9` | XRAY-1042514 |
| `@or-sdk/graph` | npm | `1.10.5`, `1.10.6` | XRAY-1042671 |
| `@or-sdk/hitl` | npm | `0.41.1`, `0.41.2` | XRAY-1042556 |
| `@or-sdk/identifiers` | npm | `0.27.6`, `0.27.7` | XRAY-1042598 |
| `@or-sdk/idw` | npm | `9.0.4`, `9.0.5` | XRAY-1042574 |
| `@or-sdk/idw-public` | npm | `1.6.6`, `1.6.7` | XRAY-1042622 |
| `@or-sdk/idw-skill` | npm | `1.4.1`, `1.4.2` | XRAY-1042441 |
| `@or-sdk/invitations` | npm | `1.4.8`, `1.4.9` | XRAY-1042659 |
| `@or-sdk/key-value-storage` | npm | `0.28.6`, `0.28.7` | XRAY-1042624 |
| `@or-sdk/keys` | npm | `1.2.6`, `1.2.7` | XRAY-1042673 |
| `@or-sdk/knowledge-models` | npm | `0.25.5`, `0.25.6` | XRAY-1042532 |
| `@or-sdk/library` | npm | `0.5.6`, `0.5.7` | XRAY-1042412 |
| `@or-sdk/library-categories` | npm | `0.2.6`, `0.2.7` | XRAY-1042588 |
| `@or-sdk/library-source` | npm | `0.4.5`, `0.4.6` | XRAY-1042572 |
| `@or-sdk/library-types-v1` | npm | `9.0.1`, `9.0.2` | XRAY-1042604 |
| `@or-sdk/library-types-v2` | npm | `9.0.1`, `9.0.2` | XRAY-1042417 |
| `@or-sdk/lookup` | npm | `1.25.1`, `1.25.2` | XRAY-1042500 |
| `@or-sdk/markdowner` | npm | `0.5.1`, `0.5.2` | XRAY-1042471 |
| `@or-sdk/mcp-tools` | npm | `0.5.2`, `0.5.3` | XRAY-1042468 |
| `@or-sdk/notifications` | npm | `1.7.5`, `1.7.6` | XRAY-1042446 |
| `@or-sdk/password` | npm | `1.3.6`, `1.3.7` | XRAY-1042472 |
| `@or-sdk/payments` | npm | `3.2.5`, `3.2.6` | XRAY-1042547 |
| `@or-sdk/permissions` | npm | `2.8.1`, `2.8.2` | XRAY-1042293 |
| `@or-sdk/permissions-cli` | npm | `1.4.1`, `1.4.2` | XRAY-1042576 |
| `@or-sdk/permissions-lambda` | npm | `2.5.1`, `2.5.2` | XRAY-1042497 |
| `@or-sdk/pgsql` | npm | `1.5.1`, `1.5.2` | XRAY-1042527 |
| `@or-sdk/providers` | npm | `0.3.6`, `0.3.7` | XRAY-1042581 |
| `@or-sdk/qna` | npm | `3.4.2`, `3.4.3` | XRAY-1042501 |
| `@or-sdk/queue-manager` | npm | `1.4.6`, `1.4.7` | XRAY-1042473 |
| `@or-sdk/sdk-api` | npm | `0.29.2`, `0.29.3` | XRAY-1042400 |
| `@or-sdk/settings` | npm | `0.25.6`, `0.25.7` | XRAY-1042488 |
| `@or-sdk/sku-builder` | npm | `2.5.1`, `2.5.2` | XRAY-1042429 |
| `@or-sdk/source` | npm | `2.1.5`, `2.1.6` | XRAY-1042635 |
| `@or-sdk/source-api` | npm | `1.1.1`, `1.1.2` | XRAY-1042610 |
| `@or-sdk/step-templates` | npm | `2.2.5`, `2.2.6` | XRAY-1042430 |
| `@or-sdk/store` | npm | `2.1.5`, `2.1.6` | XRAY-1042521 |
| `@or-sdk/tables` | npm | `0.28.5`, `0.28.6` | XRAY-1042599 |
| `@or-sdk/tags` | npm | `1.1.5`, `1.1.6` | XRAY-1042504 |
| `@or-sdk/tickets` | npm | `1.9.5`, `1.9.6` | XRAY-1042492 |
| `@or-sdk/transcripts` | npm | `1.2.5`, `1.2.6` | XRAY-1042421 |
| `@or-sdk/users` | npm | `3.8.1`, `3.8.2` | XRAY-1042467 |
| `@or-sdk/view-templates` | npm | `2.2.5`, `2.2.6` | XRAY-1042440 |
| `@or-sdk/views` | npm | `3.1.5`, `3.1.6` | XRAY-1042594 |
| `@or-sdk/web-search` | npm | `0.6.1`, `0.6.2` | XRAY-1042549 |
| `@ornikar/apollo-link-timeout` | npm | `1.4.2`, `1.4.3`, `1.4.4`, `1.4.5`, `1.4.6`, `1.4.7` | XRAY-1042306 |
| `@ornikar/babel-preset-base` | npm | `6.0.3`, `6.0.4`, `6.0.5`, `6.0.6`, `6.0.7`, `6.0.8`, `6.0.9`, `6.0.10` | XRAY-1042365 |
| `@ornikar/babel-preset-kitt-universal` | npm | `8.0.3`, `8.0.4`, `8.0.5`, `8.0.6`, `8.0.7`, `8.0.8` | XRAY-1042331 |
| `@ornikar/babel-preset-react` | npm | `6.1.4`, `6.1.5`, `6.1.6`, `6.1.7`, `6.1.8`, `6.1.9`, `6.1.10` | XRAY-1042316 |
| `@ornikar/browserslist-config` | npm | `8.0.3`, `8.0.4`, `8.0.5`, `8.0.6`, `8.0.7`, `8.0.8`, `8.0.9`, `8.0.11` | XRAY-1042314 |
| `@ornikar/commitlint-config` | npm | `8.3.2`, `8.3.3`, `8.3.4`, `8.3.5`, `8.3.6`, `8.3.7`, `8.3.8` | XRAY-1042320 |
| `@ornikar/eslint-config` | npm | `24.0.1`, `24.0.2`, `24.0.3`, `24.0.4`, `24.0.5`, `24.0.6`, `24.0.7`, `24.0.8` | XRAY-1042323 |
| `@ornikar/eslint-config-babel` | npm | `24.0.1`, `24.0.2`, `24.0.3`, `24.0.4`, `24.0.5`, `24.0.6`, `24.0.7`, `24.0.8` | XRAY-1042364 |
| `@ornikar/eslint-config-babel-use` | npm | `13.2.1`, `13.2.2`, `13.2.3`, `13.2.4`, `13.2.5`, `13.2.6`, `13.2.7`, `13.2.8` | XRAY-1042341 |
| `@ornikar/eslint-config-formatjs` | npm | `24.0.1`, `24.0.2`, `24.0.3`, `24.0.4`, `24.0.5`, `24.0.6` | XRAY-1042353 |
| `@ornikar/eslint-config-node` | npm | `12.2.1`, `12.2.2`, `12.2.3`, `12.2.4`, `12.2.5`, `12.2.6` | XRAY-1042300 |
| `@ornikar/eslint-config-react` | npm | `24.0.1`, `24.0.2`, `24.0.3`, `24.0.4`, `24.0.5`, `24.0.6`, `24.0.7` | XRAY-1042363 |
| `@ornikar/eslint-config-typescript` | npm | `24.0.1`, `24.0.2`, `24.0.3`, `24.0.4`, `24.0.5`, `24.0.6` | XRAY-1042368 |
| `@ornikar/eslint-config-typescript-nestjs` | npm | `24.0.1`, `24.0.2`, `24.0.3`, `24.0.4`, `24.0.5`, `24.0.6`, `24.0.7` | XRAY-1042292 |
| `@ornikar/eslint-config-typescript-react` | npm | `24.0.1`, `24.0.2`, `24.0.3`, `24.0.4`, `24.0.5`, `24.0.6`, `24.0.7` | XRAY-1042330 |
| `@ornikar/eslint-plugin-neverthrow` | npm | `1.3.1`, `1.3.2`, `1.3.3`, `1.3.4`, `1.3.5`, `1.3.6`, `1.3.7`, `1.3.8` | XRAY-1042332 |
| `@ornikar/eslint-plugin-ornikar` | npm | `24.0.1`, `24.0.2`, `24.0.3`, `24.0.4`, `24.0.5`, `24.0.6`, `24.0.7` | XRAY-1042296 |
| `@ornikar/graphql-config` | npm | `1.1.1`, `1.1.2`, `1.1.3`, `1.1.4`, `1.1.5`, `1.1.6`, `1.1.7` | XRAY-1042304 |
| `@ornikar/intl-config` | npm | `10.0.2`, `10.0.3`, `10.0.4`, `10.0.5`, `10.0.6`, `10.0.7`, `10.0.8`, `10.0.10` | XRAY-1042291 |
| `@ornikar/jest-config` | npm | `13.0.3`, `13.0.4`, `13.0.5`, `13.0.6`, `13.0.7`, `13.0.8`, `13.0.9` | XRAY-1042322 |
| `@ornikar/jest-config-react` | npm | `18.0.2`, `18.0.3`, `18.0.4`, `18.0.5`, `18.0.6`, `18.0.7`, `18.0.8` | XRAY-1042302 |
| `@ornikar/jest-config-react-native` | npm | `17.0.2`, `17.0.3`, `17.0.4`, `17.0.5`, `17.0.6`, `17.0.7`, `17.0.8` | XRAY-1042317 |
| `@ornikar/jest-config-react-native-web` | npm | `12.0.3`, `12.0.4`, `12.0.5`, `12.0.6`, `12.0.7`, `12.0.8`, `12.0.9` | XRAY-1042361 |
| `@ornikar/kitt2` | npm | `1.0.1`, `1.0.2`, `1.0.3`, `1.0.4`, `1.0.5`, `1.0.6`, `1.0.7` | XRAY-1042333 |
| `@ornikar/lerna-config` | npm | `11.0.1`, `11.0.2`, `11.0.3`, `11.0.4`, `11.0.5`, `11.0.6`, `11.0.7` | XRAY-1042324 |
| `@ornikar/monorepo-config` | npm | `14.3.2`, `14.3.3`, `14.3.4`, `14.3.5`, `14.3.6`, `14.3.7`, `14.3.8`, `14.3.9` | XRAY-1042301 |
| `@ornikar/postcss-config` | npm | `9.1.2`, `9.1.3`, `9.1.4`, `9.1.5`, `9.1.6`, `9.1.7`, `9.1.8` | XRAY-1042328 |
| `@ornikar/prettier-config` | npm | `9.0.3`, `9.0.4`, `9.0.5`, `9.0.6`, `9.0.7`, `9.0.8`, `9.0.9`, `9.0.11` | XRAY-1042357 |
| `@ornikar/prismic-components` | npm | `0.0.2`, `0.0.3`, `0.0.4`, `0.0.5`, `0.0.6`, `0.0.7`, `0.0.8` | XRAY-1042325 |
| `@ornikar/react-modern-calendar-datepicker` | npm | `3.2.1`, `3.2.2`, `3.2.3`, `3.2.4`, `3.2.5`, `3.2.6`, `3.2.7` | XRAY-1042342 |
| `@ornikar/react-native-svg-transformer` | npm | `1.0.6`, `1.0.7`, `1.0.8`, `1.0.9`, `1.0.10`, `1.0.11`, `1.0.13` | XRAY-1042303 |
| `@ornikar/renovate-config` | npm | `9.0.2`, `9.0.3`, `9.0.4`, `9.0.5`, `9.0.6`, `9.0.7`, `9.0.8`, `9.0.9` | XRAY-1042334 |
| `@ornikar/repo-config` | npm | `15.3.3`, `15.3.4`, `15.3.5`, `15.3.6`, `15.3.7`, `15.3.8`, `15.3.9` | XRAY-1042329 |
| `@ornikar/repo-config-react` | npm | `13.0.8`, `13.0.9`, `13.0.10`, `13.0.11`, `13.0.12`, `13.0.13`, `13.0.14`, `13.0.15` | XRAY-1042310 |
| `@ornikar/repo-config-react-legacy-css` | npm | `15.1.2`, `15.1.3`, `15.1.4`, `15.1.5`, `15.1.6`, `15.1.7`, `15.1.8`, `15.1.9` | XRAY-1042339 |
| `@ornikar/rollup-config` | npm | `11.1.2`, `11.1.3`, `11.1.4`, `11.1.5`, `11.1.6`, `11.1.7`, `11.1.8`, `11.1.9` | XRAY-1042312 |
| `@ornikar/rollup-plugin-postcss` | npm | `2.0.5`, `2.0.6`, `2.0.7`, `2.0.8`, `2.0.9`, `2.0.10`, `2.0.11` | XRAY-1042347 |
| `@ornikar/slate-react-fork` | npm | `1.0.1`, `1.0.2`, `1.0.3`, `1.0.4`, `1.0.5`, `1.0.6`, `1.0.7` | XRAY-1042308 |
| `@ornikar/storybook-config` | npm | `12.1.2`, `12.1.3`, `12.1.4`, `12.1.5`, `12.1.6`, `12.1.7` | XRAY-1042356 |
| `@ornikar/stylelint-config` | npm | `14.0.3`, `14.0.4`, `14.0.5`, `14.0.6`, `14.0.7`, `14.0.8`, `14.0.9` | XRAY-1042358 |
| `@ornikar/typed-css-modules-loader` | npm | `0.8.2`, `0.8.3`, `0.8.4`, `0.8.5`, `0.8.6`, `0.8.7`, `0.8.8` | XRAY-1042343 |
| `@ornikar/webpack-config` | npm | `12.0.2`, `12.0.3`, `12.0.4`, `12.0.5`, `12.0.6`, `12.0.7`, `12.0.8` | XRAY-1042362 |
| `@picsart/ai-sdk` | npm | `3.32.2` | XRAY-1042351 |
| `@picsart/gen-ai` | npm | `2.55.11` | XRAY-1042442 |
| `@qlik/api` | npm | `2.14.2` | XRAY-1042740 |
| `@qlik/browserslist-config` | npm | `3.0.2` | XRAY-1042705 |
| `@qlik/carbon-core` | npm | `2.1.1` | XRAY-1042682 |
| `@qlik/carboncopy` | npm | `1.1.6` | XRAY-1042693 |
| `@qlik/design-tokens` | npm | `1.3.13` | XRAY-1042722 |
| `@qlik/dts-bundler` | npm | `2.0.3` | XRAY-1042698 |
| `@qlik/embed-react` | npm | `2.5.3` | XRAY-1042309 |
| `@qlik/embed-runtime` | npm | `1.6.4` | XRAY-1042743 |
| `@qlik/embed-svelte` | npm | `1.1.4` | XRAY-1042689 |
| `@qlik/embed-web-components` | npm | `1.7.3` | XRAY-1042702 |
| `@qlik/eslint-config` | npm | `2.0.20` | XRAY-1042685 |
| `@qlik/eslint-config-base` | npm | `0.1.1` | XRAY-1042688 |
| `@qlik/eslint-config-react` | npm | `0.1.1` | XRAY-1042745 |
| `@qlik/eslint-config-svelte` | npm | `0.1.1` | XRAY-1042726 |
| `@qlik/eslint-config-vue` | npm | `0.1.1` | XRAY-1042733 |
| `@qlik/nebula-table-utils` | npm | `2.6.9` | XRAY-1042699 |
| `@qlik/oxfmt-config` | npm | `0.1.6` | XRAY-1042686 |
| `@qlik/oxlint-config` | npm | `0.7.2` | XRAY-1042736 |
| `@qlik/prettier-config` | npm | `1.0.3` | XRAY-1042765 |
| `@qlik/react-native-simple-grid` | npm | `1.5.5` | XRAY-1042690 |
| `@qlik/runtime-module-loader` | npm | `1.5.1` | XRAY-1042717 |
| `@qlik/sdk` | npm | `0.28.1` | XRAY-1042741 |
| `@qlik/sprout-design-docs` | npm | `1.0.2` | XRAY-1042752 |
| `@qlik/sprout-gesture` | npm | `0.0.13` | XRAY-1042709 |
| `@qlik/sprout-icons` | npm | `0.12.3` | XRAY-1042747 |
| `@qlik/sprout-react` | npm | `6.45.3` | XRAY-1042711 |
| `@qlik/sprout-react-table` | npm | `0.16.7` | XRAY-1042715 |
| `@qlik/tsconfig` | npm | `1.0.3` | XRAY-1042756 |
| `@servicetitan/acquisition-functions` | npm | `5.22.1`, `5.22.2`, `5.22.3`, `5.22.4`, `5.22.5`, `5.22.6` | XRAY-1042626 |
| `@servicetitan/admin-layout` | npm | `2.4.3`, `2.4.4`, `2.4.5`, `2.4.6`, `2.4.7`, `2.4.8` | XRAY-1042657 |
| `@servicetitan/admin-sql-table` | npm | `1.0.14`, `1.0.15`, `1.0.16`, `1.0.17`, `1.0.18`, `1.0.19` | XRAY-1042553 |
| `@servicetitan/ajax-handlers` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042539 |
| `@servicetitan/anvil-css-utilities` | npm | `14.5.4`, `14.5.5`, `14.5.6`, `14.5.7`, `14.5.8`, `14.5.9` | XRAY-1042562 |
| `@servicetitan/anvil-fonts` | npm | `14.5.4`, `14.5.5`, `14.5.6`, `14.5.7`, `14.5.8`, `14.5.9` | XRAY-1042398 |
| `@servicetitan/anvil-icon` | npm | `0.5.1`, `0.5.2`, `0.5.3`, `0.5.4`, `0.5.5`, `0.5.6` | XRAY-1042625 |
| `@servicetitan/anvil-icons` | npm | `14.5.4`, `14.5.5`, `14.5.6`, `14.5.7`, `14.5.8`, `14.5.9` | XRAY-1042444 |
| `@servicetitan/anvil-react` | npm | `0.11.3`, `0.11.4`, `0.11.5`, `0.11.6`, `0.11.7`, `0.11.8` | XRAY-1042487 |
| `@servicetitan/anvil-themes` | npm | `14.5.4`, `14.5.5`, `14.5.6`, `14.5.7`, `14.5.8`, `14.5.9` | XRAY-1042662 |
| `@servicetitan/anvil-token` | npm | `0.4.1`, `0.4.2`, `0.4.3`, `0.4.4`, `0.4.5`, `0.4.6` | XRAY-1042512 |
| `@servicetitan/anvil2` | npm | `3.9.1`, `3.9.2`, `3.9.3`, `3.9.4`, `3.9.5`, `3.9.6` | XRAY-1042419 |
| `@servicetitan/anvil2-codemods` | npm | `0.11.2`, `0.11.3`, `0.11.4`, `0.11.5`, `0.11.6`, `0.11.7` | XRAY-1042510 |
| `@servicetitan/anvil2-ext-atlas` | npm | `4.0.2`, `4.0.3`, `4.0.4`, `4.0.5`, `4.0.6`, `4.0.7` | XRAY-1042410 |
| `@servicetitan/anvil2-ext-charts` | npm | `0.2.4`, `0.2.5`, `0.2.6`, `0.2.7`, `0.2.8`, `0.2.9` | XRAY-1042481 |
| `@servicetitan/anvil2-ext-common` | npm | `0.7.1`, `0.7.2`, `0.7.3`, `0.7.4`, `0.7.5`, `0.7.6` | XRAY-1042427 |
| `@servicetitan/anvil2-ext-mwv` | npm | `0.0.5`, `0.0.6`, `0.0.7`, `0.0.8`, `0.0.9`, `0.0.10` | XRAY-1042457 |
| `@servicetitan/anvil2-illustrations` | npm | `1.0.2`, `1.0.3`, `1.0.4`, `1.0.5`, `1.0.6`, `1.0.7` | XRAY-1042667 |
| `@servicetitan/anvil2-mcp` | npm | `0.0.9`, `0.0.10`, `0.0.11`, `0.0.12`, `0.0.13`, `0.0.14` | XRAY-1042661 |
| `@servicetitan/assist-ui` | npm | `2.1.1`, `2.1.2`, `2.1.3`, `2.1.4`, `2.1.5`, `2.1.6` | XRAY-1042615 |
| `@servicetitan/assist-utils` | npm | `1.1.2`, `1.1.3`, `1.1.4`, `1.1.5`, `1.1.6`, `1.1.7` | XRAY-1042490 |
| `@servicetitan/carto-charts-core` | npm | `0.0.2`, `0.0.3`, `0.0.4`, `0.0.5`, `0.0.6`, `0.0.7` | XRAY-1042629 |
| `@servicetitan/carto-charts-react` | npm | `0.0.2`, `0.0.3`, `0.0.4`, `0.0.5`, `0.0.6`, `0.0.7` | XRAY-1042449 |
| `@servicetitan/carto-charts-rn` | npm | `0.0.2`, `0.0.3`, `0.0.4`, `0.0.5`, `0.0.6`, `0.0.7` | XRAY-1042489 |
| `@servicetitan/carto-react-kit` | npm | `0.8.4`, `0.8.5`, `0.8.6`, `0.8.7`, `0.8.8`, `0.8.9` | XRAY-1042506 |
| `@servicetitan/carto-rn-kit` | npm | `0.0.10`, `0.0.11`, `0.0.12`, `0.0.13`, `0.0.14`, `0.0.15` | XRAY-1042583 |
| `@servicetitan/carto-tokens` | npm | `0.3.1`, `0.3.2`, `0.3.3`, `0.3.4`, `0.3.5`, `0.3.6` | XRAY-1042493 |
| `@servicetitan/component-usage` | npm | `28.5.1`, `28.5.2`, `28.5.3`, `28.5.4`, `28.5.5`, `28.5.6` | XRAY-1042395 |
| `@servicetitan/confirm` | npm | `41.3.1`, `41.3.2`, `41.3.3`, `41.3.4`, `41.3.5`, `41.3.6` | XRAY-1042516 |
| `@servicetitan/confirm-navigation` | npm | `41.3.1`, `41.3.2`, `41.3.3`, `41.3.4`, `41.3.5`, `41.3.6` | XRAY-1042399 |
| `@servicetitan/contentful` | npm | `0.0.3`, `0.0.4`, `0.0.5`, `0.0.6`, `0.0.7`, `0.0.8` | XRAY-1042520 |
| `@servicetitan/contentful-proxy` | npm | `1.1.12`, `1.1.13`, `1.1.14`, `1.1.15`, `1.1.16`, `1.1.17` | XRAY-1042484 |
| `@servicetitan/cp-api` | npm | `1.115.1`, `1.115.2`, `1.115.3`, `1.115.4`, `1.115.5`, `1.115.6` | XRAY-1042406 |
| `@servicetitan/cp-mfe` | npm | `1.115.1`, `1.115.2`, `1.115.3`, `1.115.4`, `1.115.5`, `1.115.6` | XRAY-1042653 |
| `@servicetitan/cp-mfe-dev` | npm | `1.115.1`, `1.115.2`, `1.115.3`, `1.115.4`, `1.115.5`, `1.115.6` | XRAY-1042649 |
| `@servicetitan/cp-react-hooks` | npm | `1.115.1`, `1.115.2`, `1.115.3`, `1.115.4`, `1.115.5`, `1.115.6` | XRAY-1042644 |
| `@servicetitan/cp-ui` | npm | `1.115.1`, `1.115.2`, `1.115.3`, `1.115.4`, `1.115.5`, `1.115.6` | XRAY-1042568 |
| `@servicetitan/culture` | npm | `41.3.1`, `41.3.2`, `41.3.3`, `41.3.4`, `41.3.5`, `41.3.6` | XRAY-1042589 |
| `@servicetitan/data-query` | npm | `41.3.1`, `41.3.2`, `41.3.3`, `41.3.4`, `41.3.5`, `41.3.6` | XRAY-1042567 |
| `@servicetitan/datadog-rum` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042454 |
| `@servicetitan/datetime-utils` | npm | `41.3.1`, `41.3.2`, `41.3.3`, `41.3.4`, `41.3.5`, `41.3.6` | XRAY-1042537 |
| `@servicetitan/design-system` | npm | `14.5.4`, `14.5.5`, `14.5.6`, `14.5.7`, `14.5.8`, `14.5.9` | XRAY-1042391 |
| `@servicetitan/docs-anvil-uikit-contrib` | npm | `41.3.1`, `41.3.2`, `41.3.3`, `41.3.4`, `41.3.5`, `41.3.6` | XRAY-1042614 |
| `@servicetitan/docs-uikit` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042552 |
| `@servicetitan/document-title` | npm | `2.4.1`, `2.4.2`, `2.4.3`, `2.4.4`, `2.4.5`, `2.4.6` | XRAY-1042533 |
| `@servicetitan/dte-pdf-editor` | npm | `1.76.1`, `1.76.2`, `1.76.3`, `1.76.4`, `1.76.5`, `1.76.6` | XRAY-1042458 |
| `@servicetitan/dte-unlayer` | npm | `0.150.1`, `0.150.2`, `0.150.3`, `0.150.4`, `0.150.5`, `0.150.6` | XRAY-1042498 |
| `@servicetitan/eh-module-communication` | npm | `0.2.1`, `0.2.2`, `0.2.3`, `0.2.4`, `0.2.5`, `0.2.6` | XRAY-1042503 |
| `@servicetitan/error-boundary` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042486 |
| `@servicetitan/eslint-config` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042548 |
| `@servicetitan/eslint-plugin` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042668 |
| `@servicetitan/eslint-plugin-decorators-declare` | npm | `12.8.15`, `12.8.16`, `12.8.17`, `12.8.18`, `12.8.19`, `12.8.20` | XRAY-1042402 |
| `@servicetitan/eslint-plugin-folder-schema` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042665 |
| `@servicetitan/eslint-plugin-mobx-6` | npm | `12.8.15`, `12.8.16`, `12.8.17`, `12.8.18`, `12.8.19` | XRAY-1042596 |
| `@servicetitan/eslint-plugin-processors-stub` | npm | `12.8.15`, `12.8.16`, `12.8.17`, `12.8.18`, `12.8.19`, `12.8.20` | XRAY-1042447 |
| `@servicetitan/examples` | npm | `1.2.5`, `1.2.6`, `1.2.7`, `1.2.8`, `1.2.9`, `1.2.10` | XRAY-1042535 |
| `@servicetitan/feature-spotlight` | npm | `3.9.1`, `3.9.2`, `3.9.3`, `3.9.4`, `3.9.5`, `3.9.6` | XRAY-1042511 |
| `@servicetitan/folder-lint` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042681 |
| `@servicetitan/forge` | npm | `0.5.1`, `0.5.2`, `0.5.3`, `0.5.4`, `0.5.5`, `0.5.6` | XRAY-1042621 |
| `@servicetitan/form` | npm | `41.3.1`, `41.3.2`, `41.3.3`, `41.3.4`, `41.3.5`, `41.3.6` | XRAY-1042415 |
| `@servicetitan/form-state` | npm | `41.3.1`, `41.3.2`, `41.3.3`, `41.3.4`, `41.3.5`, `41.3.6` | XRAY-1042627 |
| `@servicetitan/grid` | npm | `0.0.63`, `0.0.64`, `0.0.65`, `0.0.66`, `0.0.67`, `0.0.68` | XRAY-1042580 |
| `@servicetitan/hammer-icon` | npm | `1.2.1`, `1.2.2`, `1.2.3`, `1.2.4`, `1.2.5`, `1.2.6` | XRAY-1042586 |
| `@servicetitan/hammer-react` | npm | `1.42.2`, `1.42.3`, `1.42.4`, `1.42.5`, `1.42.6`, `1.42.7` | XRAY-1042416 |
| `@servicetitan/hammer-token` | npm | `3.1.1`, `3.1.2`, `3.1.3`, `3.1.4`, `3.1.5`, `3.1.6` | XRAY-1042475 |
| `@servicetitan/hash-browser-router` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042453 |
| `@servicetitan/help-center` | npm | `1.0.8`, `1.0.9`, `1.0.10`, `1.0.11`, `1.0.12`, `1.0.13` | XRAY-1042663 |
| `@servicetitan/html-sketchapp` | npm | `4.2.8`, `4.2.9`, `4.2.10`, `4.2.11`, `4.2.12`, `4.2.13` | XRAY-1042544 |
| `@servicetitan/install` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042611 |
| `@servicetitan/intl` | npm | `7.2.1`, `7.2.2`, `7.2.3`, `7.2.4`, `7.2.5`, `7.2.6` | XRAY-1042617 |
| `@servicetitan/json-render-react` | npm | `0.4.6`, `0.4.7`, `0.4.8`, `0.4.9`, `0.4.10`, `0.4.11` | XRAY-1042530 |
| `@servicetitan/kendo-theme` | npm | `0.0.27`, `0.0.28`, `0.0.29`, `0.0.30`, `0.0.31`, `0.0.32` | XRAY-1042508 |
| `@servicetitan/ko-bridge` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042432 |
| `@servicetitan/launchdarkly-service` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042632 |
| `@servicetitan/lazy-module` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042523 |
| `@servicetitan/ld-type-generator` | npm | `0.2.1`, `0.2.2`, `0.2.3`, `0.2.4`, `0.2.5`, `0.2.6` | XRAY-1042577 |
| `@servicetitan/line-item-editor` | npm | `1.5.1`, `1.5.2`, `1.5.3`, `1.5.4`, `1.5.5`, `1.5.6` | XRAY-1042634 |
| `@servicetitan/link-item` | npm | `41.3.1`, `41.3.2`, `41.3.3`, `41.3.4`, `41.3.5`, `41.3.6` | XRAY-1042563 |
| `@servicetitan/log-service` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042463 |
| `@servicetitan/marketing-direct-mail-components` | npm | `20.1.1`, `20.1.2`, `20.1.3`, `20.1.4`, `20.1.5`, `20.1.6` | XRAY-1042640 |
| `@servicetitan/marketing-email-components` | npm | `20.2.3`, `20.2.4`, `20.2.5`, `20.2.6`, `20.2.7`, `20.2.8` | XRAY-1042631 |
| `@servicetitan/marketing-form` | npm | `0.1.2`, `0.1.3`, `0.1.4`, `0.1.5`, `0.1.6`, `0.1.7` | XRAY-1042603 |
| `@servicetitan/marketing-global-route` | npm | `1.14.1`, `1.14.2`, `1.14.3`, `1.14.4`, `1.14.5`, `1.14.6` | XRAY-1042612 |
| `@servicetitan/marketing-integration-widgets` | npm | `1.0.40`, `1.0.41`, `1.0.42`, `1.0.43`, `1.0.44`, `1.0.45` | XRAY-1042641 |
| `@servicetitan/marketing-route` | npm | `1.2.1`, `1.2.2`, `1.2.3`, `1.2.4`, `1.2.5`, `1.2.6` | XRAY-1042595 |
| `@servicetitan/marketing-ui` | npm | `9.3.1`, `9.3.2`, `9.3.3`, `9.3.4`, `9.3.5`, `9.3.6` | XRAY-1042633 |
| `@servicetitan/marketing-widgets` | npm | `1.0.1`, `1.0.2`, `1.0.3`, `1.0.4`, `1.0.5`, `1.0.6` | XRAY-1042451 |
| `@servicetitan/measure-sheet-data` | npm | `2.6.1`, `2.6.2`, `2.6.3`, `2.6.4`, `2.6.5`, `2.6.6` | XRAY-1042669 |
| `@servicetitan/mfe-quick-actions` | npm | `0.5.49`, `0.5.50`, `0.5.51`, `0.5.52`, `0.5.53`, `0.5.54` | XRAY-1042609 |
| `@servicetitan/micro-frontend` | npm | `0.0.4`, `0.0.5`, `0.0.6`, `0.0.7`, `0.0.8`, `0.0.9` | XRAY-1042672 |
| `@servicetitan/microfront` | npm | `0.0.2`, `0.0.3`, `0.0.4`, `0.0.5`, `0.0.6`, `0.0.7` | XRAY-1042652 |
| `@servicetitan/microfront-auth` | npm | `0.0.5`, `0.0.6`, `0.0.7`, `0.0.8`, `0.0.9`, `0.0.10` | XRAY-1042642 |
| `@servicetitan/microfront-tests` | npm | `0.0.11`, `0.0.12`, `0.0.13`, `0.0.14`, `0.0.15`, `0.0.16` | XRAY-1042518 |
| `@servicetitan/microfront-utils` | npm | `1.4.1`, `1.4.2`, `1.4.3`, `1.4.4`, `1.4.5`, `1.4.6` | XRAY-1042660 |
| `@servicetitan/modularpayments-webfields` | npm | `1.0.53`, `1.0.54`, `1.0.55`, `1.0.56`, `1.0.57`, `1.0.58` | XRAY-1042420 |
| `@servicetitan/moneyout-api-client` | npm | `1.29.1`, `1.29.2`, `1.29.3`, `1.29.4`, `1.29.5`, `1.29.6` | XRAY-1042639 |
| `@servicetitan/mpa-components` | npm | `2.5.1`, `2.5.2`, `2.5.3`, `2.5.4`, `2.5.5`, `2.5.6` | XRAY-1042435 |
| `@servicetitan/navigation` | npm | `14.1.1`, `14.1.2`, `14.1.3`, `14.1.4`, `14.1.5`, `14.1.6` | XRAY-1042559 |
| `@servicetitan/notifications` | npm | `41.3.1`, `41.3.2`, `41.3.3`, `41.3.4`, `41.3.5`, `41.3.6` | XRAY-1042433 |
| `@servicetitan/onboarding-ui` | npm | `18.5.1`, `18.5.2`, `18.5.3`, `18.5.4`, `18.5.5`, `18.5.6` | XRAY-1042397 |
| `@servicetitan/quick-actions` | npm | `1.15.2`, `1.15.3`, `1.15.4`, `1.15.5`, `1.15.6`, `1.15.7` | XRAY-1042470 |
| `@servicetitan/react-hooks` | npm | `7.7.1`, `7.7.2`, `7.7.3`, `7.7.4`, `7.7.5`, `7.7.6` | XRAY-1042542 |
| `@servicetitan/react-ioc` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042608 |
| `@servicetitan/responsive` | npm | `6.1.1`, `6.1.2`, `6.1.3`, `6.1.4`, `6.1.5`, `6.1.6` | XRAY-1042666 |
| `@servicetitan/restrict-imports` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042561 |
| `@servicetitan/schema-comparison` | npm | `0.1.3`, `0.1.4`, `0.1.5`, `0.1.6`, `0.1.7`, `0.1.8` | XRAY-1042676 |
| `@servicetitan/skeleton` | npm | `9.2.4`, `9.2.5`, `9.2.6`, `9.2.7`, `9.2.8`, `9.2.9` | XRAY-1042570 |
| `@servicetitan/standalone-core-feature-gates` | npm | `1.11.4`, `1.11.5`, `1.11.6`, `1.11.7`, `1.11.8`, `1.11.9` | XRAY-1042428 |
| `@servicetitan/standalone-feature-flags` | npm | `2.3.2`, `2.3.3`, `2.3.4`, `2.3.5`, `2.3.6`, `2.3.7` | XRAY-1042571 |
| `@servicetitan/standalone-root` | npm | `1.11.3`, `1.11.4`, `1.11.5`, `1.11.6`, `1.11.7`, `1.11.8` | XRAY-1042505 |
| `@servicetitan/standalone-tm-api` | npm | `1.1.1`, `1.1.2`, `1.1.3`, `1.1.4`, `1.1.5`, `1.1.6` | XRAY-1042616 |
| `@servicetitan/standalone-ui` | npm | `2.2.4`, `2.2.5`, `2.2.6`, `2.2.7`, `2.2.8`, `2.2.9` | XRAY-1042565 |
| `@servicetitan/startup` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042606 |
| `@servicetitan/startup-jest` | npm | `2.2.1`, `2.2.2`, `2.2.3`, `2.2.4`, `2.2.5`, `2.2.6` | XRAY-1042517 |
| `@servicetitan/startup-mfe-compat` | npm | `0.5.1`, `0.5.2`, `0.5.3`, `0.5.4`, `0.5.5`, `0.5.6` | XRAY-1042613 |
| `@servicetitan/startup-utils` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042529 |
| `@servicetitan/stylelint-config` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042546 |
| `@servicetitan/suppress-warnings` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042656 |
| `@servicetitan/table` | npm | `41.3.1`, `41.3.2`, `41.3.3`, `41.3.4`, `41.3.5`, `41.3.6` | XRAY-1042414 |
| `@servicetitan/tanstack-query-mobx` | npm | `6.2.1`, `6.2.2`, `6.2.3`, `6.2.4`, `6.2.5`, `6.2.6` | XRAY-1042646 |
| `@servicetitan/temporal-lite` | npm | `3.4.1`, `3.4.2`, `3.4.3`, `3.4.4`, `3.4.5`, `3.4.6` | XRAY-1042507 |
| `@servicetitan/testing-library` | npm | `6.6.1`, `6.6.2`, `6.6.3`, `6.6.4`, `6.6.5`, `6.6.6` | XRAY-1042636 |
| `@servicetitan/thoughtspot-theme` | npm | `1.7.1`, `1.7.2`, `1.7.3`, `1.7.4`, `1.7.5`, `1.7.6` | XRAY-1042587 |
| `@servicetitan/time-zones` | npm | `3.8.1`, `3.8.2`, `3.8.3`, `3.8.4`, `3.8.5`, `3.8.6` | XRAY-1042424 |
| `@servicetitan/titan-chat-ui` | npm | `7.1.3`, `7.1.4`, `7.1.5`, `7.1.6`, `7.1.7`, `7.1.8` | XRAY-1042593 |
| `@servicetitan/titan-chat-ui-anvil2` | npm | `9.0.1`, `9.0.2`, `9.0.3`, `9.0.4`, `9.0.5`, `9.0.6` | XRAY-1042538 |
| `@servicetitan/titan-chat-ui-common` | npm | `9.0.1`, `9.0.2`, `9.0.3`, `9.0.4`, `9.0.5`, `9.0.6` | XRAY-1042524 |
| `@servicetitan/titan-chat-ui-cypress` | npm | `2.1.3`, `2.1.4`, `2.1.5`, `2.1.6`, `2.1.7`, `2.1.8` | XRAY-1042650 |
| `@servicetitan/titan-chatbot-api` | npm | `9.0.1`, `9.0.2`, `9.0.3`, `9.0.4`, `9.0.5`, `9.0.6` | XRAY-1042550 |
| `@servicetitan/titan-chatbot-client` | npm | `2.1.3`, `2.1.4`, `2.1.5`, `2.1.6`, `2.1.7`, `2.1.8` | XRAY-1042545 |
| `@servicetitan/titan-chatbot-ui` | npm | `7.1.3`, `7.1.4`, `7.1.5`, `7.1.6`, `7.1.7`, `7.1.8` | XRAY-1042452 |
| `@servicetitan/titan-chatbot-ui-anvil2` | npm | `9.0.1`, `9.0.2`, `9.0.3`, `9.0.4`, `9.0.5`, `9.0.6` | XRAY-1042418 |
| `@servicetitan/titan-chatbot-ui-cypress` | npm | `9.0.1`, `9.0.2`, `9.0.3`, `9.0.4`, `9.0.5`, `9.0.6` | XRAY-1042670 |
| `@servicetitan/tokens` | npm | `12.9.1`, `12.9.2`, `12.9.3`, `12.9.4`, `12.9.5`, `12.9.6` | XRAY-1042311 |
| `@servicetitan/toolbelt-shared-registry` | npm | `1.14.1`, `1.14.2`, `1.14.3`, `1.14.4`, `1.14.5`, `1.14.6` | XRAY-1042585 |
| `@servicetitan/uikit-docs` | npm | `22.11.1`, `22.11.2`, `22.11.3`, `22.11.4`, `22.11.5`, `22.11.6` | XRAY-1042436 |
| `@servicetitan/unit-tests` | npm | `0.0.2`, `0.0.3`, `0.0.4`, `0.0.5`, `0.0.6`, `0.0.7` | XRAY-1042578 |
| `@servicetitan/va-mfe-loader` | npm | `1.1.1`, `1.1.2`, `1.1.3`, `1.1.4`, `1.1.5`, `1.1.6` | XRAY-1042477 |
| `@servicetitan/web-components` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6` | XRAY-1042540 |
| `@servicetitan/widget-platform` | npm | `5.6.1`, `5.6.2`, `5.6.3`, `5.6.4`, `5.6.5`, `5.6.6` | XRAY-1042536 |
| `@servicetitan/widget-platform-monolith` | npm | `5.6.1`, `5.6.2`, `5.6.3`, `5.6.4`, `5.6.5`, `5.6.6` | XRAY-1042555 |
| `@thiennq/docs-viewer` | npm | `1.6.2` | XRAY-1042280 |
| `@umacloud/cli-darwin-arm64` | npm | `1.0.74` | XRAY-1042751 |
| `@umacloud/cli-darwin-x64` | npm | `1.0.74` | XRAY-1042707 |
| `@umacloud/cli-linux-arm64` | npm | `1.0.74` | XRAY-1042694 |
| `@umacloud/cli-linux-musl-arm64` | npm | `1.0.74` | XRAY-1042701 |
| `@umacloud/cli-linux-musl-x64` | npm | `1.0.74` | XRAY-1042695 |
| `@umacloud/cli-linux-x64` | npm | `1.0.74` | XRAY-1042714 |
| `@umacloud/cli-win32-x64` | npm | `1.0.74` | XRAY-1042700 |
| `@umacloud/knowledge` | npm | `1.0.74` | XRAY-1042732 |
| `@workbench-stack/core` | npm | `3.9.8` | XRAY-1042762 |
| `babel-plugin-linaria-css-to-undefined` | npm | `0.3.1`, `0.3.2`, `0.3.3`, `0.3.4`, `0.3.5`, `0.3.6`, `0.3.7`, `0.3.8`, `0.3.9` | XRAY-1042346 |
| `cache-manager` | npm | `7.2.10` | XRAY-1042326 |
| `cacheable` | npm | `2.5.1` | XRAY-1042289 |
| `cacheable-request` | npm | `13.0.20` | XRAY-1042344 |
| `conv-context-next` | npm | `1.0.1`, `1.0.2`, `1.0.3` | XRAY-1042674 |
| `ecto` | npm | `5.0.1` | XRAY-1042534 |
| `editable-contracts` | npm | `0.0.12`, `0.0.13`, `0.0.14`, `0.0.15`, `0.0.16`, `0.0.17`, `0.0.18`, `0.0.19`, `0.0.20`, `0.0.21`, `0.0.22`, `0.0.23`, `0.0.24`, `0.0.25` | XRAY-1042313 |
| `eslint-plugin-folder-schema` | npm | `1.0.6`, `1.0.7`, `1.0.8`, `1.0.9`, `1.0.10`, `1.0.11`, `1.0.12`, `1.0.13`, `1.0.14`, `1.0.15`, `1.0.16`, `1.0.17`, `1.0.18`, `1.0.19` | XRAY-1042315 |
| `example-js-project` | npm | `1.0.2`, `1.0.3`, `1.0.4` | XRAY-1042434 |
| `file-entry-cache` | npm | `11.1.6` | XRAY-1042327 |
| `flat-cache` | npm | `6.1.24` | XRAY-1042337 |
| `folder-lint` | npm | `1.0.6`, `1.0.7`, `1.0.8`, `1.0.9`, `1.0.10`, `1.0.11`, `1.0.12`, `1.0.13`, `1.0.14`, `1.0.15`, `1.0.16`, `1.0.17`, `1.0.18`, `1.0.19` | XRAY-1042355 |
| `frontend-orb` | npm | `4.4.1`, `4.4.2`, `4.4.3`, `4.4.4`, `4.4.5`, `4.4.6`, `4.4.7`, `4.4.8`, `4.4.9`, `4.4.10` | XRAY-1042360 |
| `hamus.js` | npm | `0.4.1` |  |
| `http-metrics-middleware` | npm | `2.2.2` |  |
| `keyv` | npm | `6.0.0` | XRAY-1042297 |
| `native-frontend-orb` | npm | `1.1.4`, `1.1.5`, `1.1.6`, `1.1.7`, `1.1.8`, `1.1.9`, `1.1.10`, `1.1.11` | XRAY-1042318 |
| `picasso-plugin-hammer` | npm | `2.11.6` | XRAY-1042746 |
| `picasso-plugin-q` | npm | `2.11.6` |  |
| `picasso.js` | npm | `2.11.6` |  |
| `pob-test-package-in-monorepo` | npm | `5.2.1`, `5.2.2`, `5.2.3`, `5.2.4`, `5.2.5`, `5.2.6`, `5.2.7`, `5.2.8`, `5.2.9` | XRAY-1042348 |
| `pob-test-typescript-package-in-monorepo` | npm | `4.2.1`, `4.2.2`, `4.2.3`, `4.2.4`, `4.2.5`, `4.2.6`, `4.2.7`, `4.2.8`, `4.2.9`, `4.2.10` | XRAY-1042307 |
| `qlik-chart-modules` | npm | `1.1.1` |  |
| `qlik-modifiers` | npm | `0.10.1` | XRAY-1042748 |
| `qlik-object-conversion` | npm | `0.17.2` |  |
| `rwc-client` | npm | `0.29.10`, `0.29.11`, `0.29.12` | XRAY-1042680 |
| `server-hemera-mongo` | npm | `0.0.12` | XRAY-1042735 |
| `sn-listbox` | npm | `0.3.3` |  |
| `tslint-folder-schema` | npm | `1.0.6`, `1.0.7`, `1.0.8`, `1.0.9`, `1.0.10`, `1.0.11`, `1.0.12`, `1.0.13`, `1.0.14`, `1.0.15`, `1.0.16`, `1.0.17`, `1.0.18`, `1.0.19`, `1.0.20` | XRAY-1042367 |
| `umadev` | npm | `1.0.74` | XRAY-1042704 |
| `verdaccio-okta-oauth` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6`, `38.1.7`, `38.1.8`, `38.1.9`, `38.1.10`, `38.1.11`, `38.1.12`, `38.1.13`, `38.1.14`, `38.1.15` | XRAY-1042295 |
| `verdaccio-tarball-local-storage` | npm | `38.1.1`, `38.1.2`, `38.1.3`, `38.1.4`, `38.1.5`, `38.1.6`, `38.1.7`, `38.1.8`, `38.1.9`, `38.1.10`, `38.1.11`, `38.1.12`, `38.1.13`, `38.1.14`, `38.1.15` | XRAY-1042298 |
| `workbench-browser-server` | npm | `0.0.2` | XRAY-1042696 |
| `github.com/jaredwray/keyv` | golang | `v6.0.1+incompatible`, `v6.0.2-0.20260804114834-c9627446c233+incompatible` | XRAY-1043650 |
| `github.com/jaredwray/cacheable` | golang | `v0.0.0-20260804100608-893f73f5082d` | XRAY-1043647 |
| `github.com/jaredwray/ecto` | golang | `v5.0.1+incompatible`, `v5.0.2-0.20260804102746-5687c7ba63eb+incompatible` | XRAY-1043649 |
| `github.com/techtoboggan/claude-desktop-hardened-linux` | golang | `v0.0.0-20260804101346-1652b9de0c6a` | XRAY-1043648 |
| `github.com/adieuu-llc/adieuu-2026` | golang | `v0.4.9`, `v0.4.10`, `v0.4.11`, `v0.0.0-20260805040439-27421527967b` | XRAY-1043643 |
| `github.com/rainb0w-clwn/node-cache-manager-fs-binary-ts` | golang | `v0.0.0-20260804104622-4cb4a1e10ea7` | XRAY-1043644 |
| `github.com/evilgodfahim/kal` | golang | `v0.0.0-20260805062327-23dc26d5459b` | XRAY-1043645 |
| `github.com/juxtaposition1/v.a.p.e` | golang | `v0.0.0-20260805081246-648cd8543c4f`, `v0.0.0-20260805084238-a34d6435a226`, `v0.0.0-20260805085748-6b70acca383d`, `v0.0.0-20260805091749-3577fc492f9c`, `v0.0.0-20260805094244-a5ad050e5764`, `v0.0.0-20260805095815-e2821268cb56`, `v0.0.0-20260805102734-fa13efcb0021`, `v0.0.0-20260805103721-6c35385e306e`, `v0.0.0-20260805105744-2e3821fe0134` | XRAY-1043646 |

## Indicators of compromise (IOCs)

### Files and paths

```
math_init.js
setup.mjs
/tmp/tmp.dpkg_14527.lock
.vscode/tasks.json
.vscode/setup.mjs
.claude/math_init.js
.claude/settings.json
.claude/setup.mjs
.github/workflows/codeql_analysis.yml
format-results.txt
```

### GitHub artifacts

```
dependabot/github_actions/format/setup-formatter
chore: update config
Co-authored-by: claude <claude@users.noreply.github.com>
Add CodeQL Analysis
github-advanced-security[bot] <github-advanced-security[bot]@users.noreply.github.com>
Shai-Hulud: Here We Go Again
thebeautifulmarchoftime
thebeautifulsnadsoftime
IfYouBlockThisAPIKeyItWillCrashTheLiveProductionServersOfAllThirdPartyClients
```

### Network and infrastructure

| Type | Value |
| :---- | :---- |
| Ethereum contract | `0xE1f2395ee43e45A1556EC6438a88c31B83493103` |
| Contract selector | `0x53ed5143` |
| C2 path | `/router` |
| npm publish User-Agent | `npm/11.13.1 node/v24.10.0 <platform> <architecture> workspaces/false` |

The npm registry, GitHub, Fulcio, Rekor, Oven Bun releases, and public Ethereum RPC providers are legitimate services abused by the malware. Do not block them based on this incident alone. Combine service access with the paths, commit messages, contract address, selector, and package mutations above.

### Payload hashes

| Payload | SHA-256 |
| :---- | :---- |
| `Math_Symbol.js` / `math_init.js` | `9fc2570b7cef51c1b8df116d144d11ff4096357be7d2c4c6367cfc2509cf1bcc` |
| `setup.mjs` | `fd3ca4007b225fdf8de7af4345a19179d5efa8c4bb9205f88cda806e5684b1eb` |
| VS Code `tasks.json` | `927387d0cfac1118df4b383decc2ea6ba49c9d2f98b47098bcbcba1efc026e1f` |
| Claude `settings.json` | `14eb4ce01dd4307759887ff819359b70d7d9ff709ecde039a5abc1aac325b128` |
| Injected GitHub Actions workflow | `3f3f42d072bd36860ab7bd7fb5e10ac0d22c741c13c89505ccd6ec0ea572eea7` |
| Runner memory scraper | `29ac906c8bd801dfe1cb39596197df49f80fff2270b3e7fbab52278c24e4f1a7` |

[image1]: /img/RealTimePostImage/post/hulud-august/image1.png
[image2]: /img/RealTimePostImage/post/hulud-august/image2.png
[image3]: /img/RealTimePostImage/post/hulud-august/image3.png
[image4]: /img/RealTimePostImage/post/hulud-august/image4.png
[image5]: /img/RealTimePostImage/post/hulud-august/image5.png
[image6]: /img/RealTimePostImage/post/hulud-august/image6.png
[image7]: /img/RealTimePostImage/post/hulud-august/image7.png
[image8]: /img/RealTimePostImage/post/hulud-august/image8.png
[image9]: /img/RealTimePostImage/post/hulud-august/image9.png
[image10]: /img/RealTimePostImage/post/hulud-august/image10.png
[image11]: /img/RealTimePostImage/post/hulud-august/image11.png
[image12]: /img/RealTimePostImage/post/hulud-august/image12.png
[image13]: /img/RealTimePostImage/post/hulud-august/label_impact_search.jpg