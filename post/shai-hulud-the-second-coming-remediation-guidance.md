---
excerpt: "Shai-Hulud remediation guide"
title: "CONTAIN, ROTATE, RECOVER: The 5-Phase Shai-Hulud Response Guide"
date: "November 26, 2025"
description: "David Cohen, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/shai-hulud-remediation/shai-hulud-kicked-by-frog.png
type: realTimePost
minutes: '5'
schema:  |
  {
   "@context": "https://schema.org",
   "@type": "TechArticle",
   "mainEntityOfPage": {
     "@type": "WebPage",
     "@id": "https://research.jfrog.com/post/shai-hulud-the-second-coming-remediation-guidance/"
   },
   "headline": "Shai-Hulud Protection Guide: Detect, Remove, Prevent",
     "description": "Complete guide to protecting against Shai-Hulud npm supply chain attacks. Includes detection scripts, credential rotation steps, and prevention strategies.",
   "author": {
     "@type": "Person",
     "name": "David Cohen"
   },
    "publisher": {
     "@type": "Organization",
     "@id":"https://jfrog.com/#organization",
     "name": "JFrog ",
     "logo": {
       "@type": "ImageObject",
       "url": "https://research.jfrog.com/assets/static/jfrog-logo-svg.5788598.74a3bea875bf053c65a0663c9ec9a0fd.svg"
     }
   },
   "datePublished": "2025-11-26",
   "dateModified": "2025-11-26"}

---

The [“**Shai-Hulud”**](https://jfrog.com/blog/shai-hulud-npm-supply-chain-attack-new-compromised-packages-detected/) worm and its evolved variant, [**“Sha1-Hulud the second coming”**](https://research.jfrog.com/post/shai-hulud-the-second-coming/), have introduced a highly efficient, **GitHub-weaponized exfiltration** vector into the supply chain. When an infected system is successfully compromised, the malware leverages a stolen token to create a public repository - typically identifiable by a **random name** and the description "**Sha1-Hulud: The Second Coming**" - which serves as a clandestine drop zone for stolen credentials.

Finding this repository means an active breach is in progress. Your response must be swift, systematic, and follow a strict order of operations to contain the leak and prevent further damage.

Before continuing: **DO NOT DELETE the GitHub repository** that was created by Shai Hulud. Follow the guidance below.

# Understanding the Compromise: What is Leaked?

The Shai-Hulud worm’s objective is to extract high-value credentials that facilitate lateral movement and further supply chain attacks. It achieves this by aggressively scanning the compromised developer environment. Using a stolen Developer GitHub Personal Access Token (PAT), the malware programmatically creates the exfiltration repository and commits files that categorize the stolen data.

## The Compromised Repository Structure

![](/img/RealTimePostImage/post/shai-hulud-remediation/example-repo.png)

The malware commits multiple `.json` files, all containing JSON objects that have been subjected to double Base64 encoding to provide a basic layer of obfuscation against simple secret scans:

* `actionsSecrets.json`: This file contains credentials specifically designed for the **GitHub Actions** environment. These secrets are often non-personal service tokens with broad permissions, making them extremely valuable to the attacker for automating malicious deployments or accessing corporate infrastructure.

<details>
<summary>View actionsSecrets.json example</summary>

```json
{
  "AWS_ACCESS_KEY_ID_SDK": "AKIA****KOI",
  "AWS_SECRET_ACCESS_KEY_DEV": "MGcv*****bUR",
  "GH_BOT_TOKEN": "ghp_*******8O8",
  "NPM_AUTH_TOKEN": "NpmToken.ff*******a86",
  "SECRET_KEY": "0eee*****a59",
  "COCOAPODS_TRUNK_TOKEN": "8efb*****d607",
  "TOKEN_ARTIFACTORY": "eyJ2*****SldU.eyJ*****ZGE2.YV7u*****oSQ",
  "PHUB_EVIDENCER_SECRET_KEY_PRO": "HgV*****pU=",
  "TENANT_ID": "6f2b*****94a9",
  "CLIENT_SELPHID_SECRET": "VOph*****flJ",
  "github_token": "ghs_7Q******sN",
  "EXPO_TOKEN": "i67u****teI-",
  "BROWSERSTACK_ACCESS_KEY": "N86j****nQzv",
  "CLIENTSECRET_PRO": "bta****2RVr0"
}
```

</details>

* `contents.json`: The primary file containing the victim's own GitHub token that was used to create the repository, along with initial system and account information.

<details>
<summary>View contents.json example</summary>

```json
{
  "system": {
    "platform": "darwin",
    "architecture": "arm64",
    "platformDetailed": "darwin",
    "architectureDetailed": "arm64",
    "hostname": "LT310",
    "os_user": {
      "homedir": "/Users/********",
      "username": "********",
      "shell": "/bin/zsh",
      "uid": 502,
      "gid": 20
    }
  },
  "modules": {
    "github": {
      "authenticated": true,
      "token": "ghp_bIQGBY8TW*************lGG2Z1d3rLz",
      "username": {
        "login": "********",
        "name": "M******",
        "email": null,
        "publicRepos": 6,
        "followers": 0,
        "following": 0,
        "createdAt": "2022-10-04T08:23:41Z"
      }
    }
  }
}
```

</details>

* `cloud.json`: Contains high-priority, high-risk credentials, specifically AWS, Azure, and Google Cloud Platform (GCP) access keys/secrets.

<details>
<summary>View cloud.json example</summary>

```json
{
  "aws": {
    "secrets": [
      {
        "name": "AWS_ACCESS_KEY_ID",
        "value": "AKIAIOSFODNN7EXAMPLE"
      },
      {
        "name": "AWS_SECRET_ACCESS_KEY",
        "value": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
      },
      {
        "name": "AWS_SESSION_TOKEN",
        "value": "FwoGZXIvYXdzEBYaDEXAMPLETOKEN1234567890abcdefg"
      }
    ]
  },
  "gcp": {
    "secrets": [
      {
        "name": "GCP_SERVICE_ACCOUNT_KEY",
        "value": "eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwiY2xpZW50X2VtYWlsIjoiZXhhbXBsZUBwcm9qZWN0LmlhbS5nc2VydmljZWFjY291bnQuY29tIn0="
      },
      {
        "name": "GCP_PROJECT_ID",
        "value": "example-project-123456"
      }
    ]
  },
  "azure": {
    "secrets": [
      {
        "name": "AZURE_CLIENT_ID",
        "value": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      },
      {
        "name": "AZURE_CLIENT_SECRET",
        "value": "Abc8Q~EXAMPLE_SECRET_VALUE_1234567890abcdef"
      },
      {
        "name": "AZURE_TENANT_ID",
        "value": "98765432-abcd-efgh-ijkl-1234567890ab"
      }
    ]
  }
}
```

</details>

* `environment.json`: A complete dump of the compromised system's environment variables (`process.env`), often revealing sensitive API keys, database connection strings, and internal service credentials.

![](/img/RealTimePostImage/post/shai-hulud-remediation/env_secrets.png)
**Example of GitHub repository created by Sha1-Hulud (2nd campaign) malware**

* `truffleSecrets.json`: Credentials found by an aggressive file system scan using an embedded version of the open-source tool, [TruffleHog](https://github.com/trufflesecurity/trufflehog).

<details>
<summary>View truffleSecrets.json example</summary>

```json
{
  "findings": [
    {
      "SourceMetadata": {
        "Data": {
          "Filesystem": {
            "file": "/home/runner/work/my-project/.git/config",
            "line": 12
          }
        }
      },
      "SourceName": "trufflehog - filesystem",
      "DetectorType": 8,
      "DetectorName": "Github",
      "DetectorDescription": "GitHub Personal Access Token",
      "Verified": true,
      "Raw": "ghp_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8",
      "ExtraData": {
        "rotation_guide": "https://howtorotate.com/docs/tutorials/github/"
      }
    },
    {
      "SourceMetadata": {
        "Data": {
          "Filesystem": {
            "file": "/home/runner/work/my-project/config/credentials.json",
            "line": 5
          }
        }
      },
      "SourceName": "trufflehog - filesystem",
      "DetectorType": 1039,
      "DetectorName": "JWT",
      "DetectorDescription": "JSON Web Token",
      "Verified": true,
      "Raw": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.POstGetfAytaZS82wHcjoTyoqhMyxXiWdR7Nn7A29DNSl0EiXLdwJ6xC6AfgZWF1bOsS_TuYI3OG85AmiExREkrS6tDfTQ2B3WXlrr-wp5AokiRbz3_oB4OxG-W9KcEEbDRcZc0nH3L7LzYptiy1PtAylQGxHTWZXtGz4ht0bAecBgmpdgXMguEIcoqPJ1n3pIWk_dUZegpqx0Lka21H6XxUTxiy8OcaarA8zdnPUnV6AmNP3ecFawIFYdvJB_cm-GvpCSbr8G8y_Mllj8f4x9nBH8pQux89_6gUY618iYv7tuPWBFfEbLxtF2pZS6YC1aSfLQxeNe8djT9YjpvRZA",
      "ExtraData": {
        "alg": "RS256",
        "exp": "2025-12-01 00:00:00 +0000 UTC",
        "iss": "https://auth.example.com"
      }
    },
    {
      "SourceMetadata": {
        "Data": {
          "Filesystem": {
            "file": "/home/runner/work/my-project/scripts/deploy.sh",
            "line": 23
          }
        }
      },
      "SourceName": "trufflehog - filesystem",
      "DetectorType": 15,
      "DetectorName": "PrivateKey",
      "DetectorDescription": "RSA Private Key",
      "Verified": false,
      "Raw": "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2Z3qX2BTLS4e....[TRUNCATED]....\n-----END RSA PRIVATE KEY-----",
      "Redacted": "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2Z3qX2BTLS4e"
    },
    {
      "SourceMetadata": {
        "Data": {
          "Filesystem": {
            "file": "/home/runner/work/my-project/.env",
            "line": 8
          }
        }
      },
      "SourceName": "trufflehog - filesystem",
      "DetectorType": 17,
      "DetectorName": "URI",
      "DetectorDescription": "URL with embedded credentials",
      "Verified": false,
      "Raw": "postgresql://admin:SuperSecret123@db.internal.example.com:5432/production",
      "Redacted": "postgresql://admin:********@db.internal.example.com:5432/production"
    },
    {
      "SourceMetadata": {
        "Data": {
          "Filesystem": {
            "file": "/home/runner/work/my-project/src/services/aws.js",
            "line": 15
          }
        }
      },
      "SourceName": "trufflehog - filesystem",
      "DetectorType": 1,
      "DetectorName": "AWS",
      "DetectorDescription": "AWS Access Key",
      "Verified": true,
      "Raw": "AKIAIOSFODNN7EXAMPLE",
      "RawV2": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    }
  ],
  "executionTime": 45230,
  "exitCode": 0,
  "verified_secrets": 3,
  "unverified_secrets": 2
}
```

</details>


## Persistency through GitHub Action

The Shai-Hulud (1st) and Sha1-Hulud (2nd) campaigns specifically target GitHub Actions environments with two distinct, high-impact mechanisms:

1. **Secret Exfiltration via Malicious Workflow:** The malware pushes a temporary, malicious workflow (e.g., `.github/workflows/formatter_123456789.yml` or `discussion.yaml`) to compromise repositories. This workflow's sole purpose is to list and collect all secrets defined in the repository's **GitHub Secrets** section and upload them as the **`actionsSecrets.json`** file to the exfiltration repo.
2. **Persistence via Self-Hosted Runner:** The malware registers the infected machine (if it is a CI runner or has the necessary permissions) as a **self-hosted runner** named something identifiable like **`SHA1HULUD`**, which allows the attacker continuous, remote access to the organization's network and resources.

This structured dump provides the attacker with a complete dossier for continued operation.

# The Incident Response Plan: Where to Start

## 1. Containment: Lock Down the Exfiltration Channel

* **Action: DO NOT DELETE THE GITHUB REPOSITORY**. Instead, immediately navigate to the suspicious **GitHub repository** and change its visibility from **Public to Private** in the settings. *In case you are not able to change the visibility, **clone the repository and then delete it***.
  <video src="/img/RealTimePostImage/post/shai-hulud-remediation/privatize-github-repo.mp4" controls></video>
* **Why:** This instantly terminates public access to the data, regardless of the encoding. The repository should not be deleted since it is your primary forensic evidence.

## 2. Eradication: Neutralize the GitHub Action and Remove the Malicious Package

**This step is mandatory *before* rotating credentials. If you rotate keys while the malware is still present, it will simply steal the new keys.**

### Action A: Disable / Remove Malicious Runner (Persistence)

* **Action**: Navigate to your **GitHub Settings** (or Organization/Enterprise Settings) → **Actions** → **Runners**.
* Find and **immediately disable or remove** any self-hosted runner named **`SHA1HULUD`** or any other unrecognized runner added recently.
* **Why:** This eliminates the attacker's persistent backdoor access to your build network.

### Action B: Clean Repositories (Workflow Removal)

* Check compromised repositories for new files in the `.github/workflows/` directory (e.g., `formatter_*.yml`). Revert/Delete these malicious workflow files.

### Action C: Remove the Malicious Packages

* **Remove:** Completely delete the project's dependency artifacts locally (`rm -rf node_modules`) and clear the local cache (`npm cache clean --force`).

* **Reinstall Safely**: Update your `package.json` to replace the malicious package’s version ([https://research.jfrog.com/post/shai-hulud-the-second-coming/](https://research.jfrog.com/post/shai-hulud-the-second-coming/)) with a known, safe version, then re-install the package locally (`npm ci`).

* **Re-publish package**: If you are a package maintainer and a malicious package was released under your name, ensure you **re-publish the package** with a new, safe release.

### How can I identify Shai-Hulud infected packages on my local disk?

* **Identify:** Use the detection script below to look on disk for a malicious package or a malicious indicators ([https://github.com/Cobenian/shai-hulud-detect](https://github.com/Cobenian/shai-hulud-detect))

```shell
# Clone the repository
git clone https://github.com/username/shai-hulud-detect.git
cd shai-hulud-detect

# Make the script executable
chmod +x shai-hulud-detector.sh

# Scan your project for Shai-Hulud indicators
./shai-hulud-detector.sh /path/to/your/project

# For comprehensive security scanning
./shai-hulud-detector.sh --paranoid /path/to/your/project
```

* **Why:** You must cut the root of the infection to prevent immediate re-compromise.

## 3. Triage: Decode Every Leaked Secret and List Exposed Services

* **Action:** Using the downloaded `.json` files from the GitHub repository created by the malware and decode their contents using the supplied script. Every file - `actionsSecrets.json, contents.json`, `cloud.json`, `environment.json`, etc. - must be decoded.

```shell
#!/bin/bash

# Execute this from inside the directory containing the stolen .json files.
echo "--- Starting Shai-Hulud Double-Base64 Decoding ---"

# Loop through all files matching the .json extension
for encoded_file in *.json; do
    
    # Check if the file actually exists (prevents running if no files match)
    if [ -f "$encoded_file" ]; then
        decoded_output="${encoded_file}.decoded"
        
        echo "Processing: $encoded_file -> Saving to: $decoded_output"
        
        # Double-decode the content and redirect output to the new file
        # The syntax for the double-decode: cat | base64 -d | base64 -d > output
        cat "$encoded_file" | base64 -d | base64 -d > "$decoded_output"
        
        # Check if the decode was successful (i.e., the output file is not empty)
        if [ -s "$decoded_output" ]; then
            echo "   ✅ Successfully decoded."
        else
            echo "   ❌ Decoding failed or resulted in an empty file."
        fi
    fi
done

echo "--- Decoding Complete. Review *.json.decoded files for leaked secrets. ---"
```

Script to decode the JSON files created by Sha1-hulud

```shell
chmod +x decode.sh # containing the code above, and being in the folder containing the jsons.

./decode.sh 
```

![](/img/RealTimePostImage/post/shai-hulud-remediation/decode-result.png)
**Result after decoding**

**Each .decoded file contains a JSON with all the leaked secrets.**

* **Why**: This step yields the definitive, un-obfuscated list of compromised secrets and the specific services they grant access to. This list is the foundation for your rotation plan.

## 4. Remediation: Rotate the leaked credentials

* **Action:** Rotate every credential identified in the decoded JSON files. Assume every secret listed is compromised and immediately usable by the attacker. This includes all GitHub PATs, npm tokens, all cloud service keys (AWS, Azure, GCP), all tokens gathered by TruffleHog and all credentials stolen from the Github Action execution. In short, all credentials present in the files.
* **Why:** Rotation renders the attacker's stolen goods worthless, eliminating their ability to move laterally or maintain access.

## 5. Post-Incident: Audit Logs for Persistence and Untrusted Connections

* **Action:** Examine the Leaked Service account’s Security Log (or Activity Log) for activity spanning the time *after* the Github repository was created. Look specifically for:
  * **Untrusted Connections**: The authorization of any unrecognized third-party OAuth applications, SSH keys, or webhooks.
  * **Unusual Activity**: Look for the creation of new tokens or unexpected login attempts.
  * If an untrusted service is found, immediately block it and do not re-enable it until a thorough forensic investigation confirms no further malicious payloads or backdoors were installed via that connection.
* **Why**: The Shai-Hulud worm is aggressive; its primary goal is exfiltration, but its secondary goal may be persistence. Identifying and blocking any unauthorized service or token is critical to preventing re-entry and ensuring a complete eviction.

## 6. Prevent future infection: use Curation/Immaturity Policy

The long-term solution is to prevent malicious packages from ever reaching developers or runners.

* **Action:** Implement **Curation/Immaturity Policies** within your artifact repository (e.g., JFrog Artifactory).
  * **Quarantine Unknown Packages:** Configure the repository to automatically block or quarantine any package (including new versions of existing packages) that has not been explicitly approved and scanned by your security team, [for example by using JFrog Curation](https://jfrog.com/help/r/jfrog-security-user-guide/products/curation/configure-curation/create-policies/list-of-available-conditions).
  * **Require Security Scanning:** Enforce a policy that scans all new dependencies for known vulnerabilities and malicious code signatures **before** they are proxied from the public registry (npm, PyPI) to your internal, trusted repository.
* **Why:** This creates a mandatory security gate, ensuring that the next supply chain attack, like Shai-Hulud, is quarantined at the repository level, isolating your developers from the threat.

<video src="/img/RealTimePostImage/post/shai-hulud-remediation/immature-policy.mp4" controls></video>

**JFrog [Xray](https://jfrog.com/xray/) and [Curation](https://jfrog.com/curation/) customers are fully protected from this attack vector, as all of the campaign's packages are already marked as malicious.**

In addition, for JFrog Curation customers - 

1. Consider enabling [Compliant Version Selection](https://jfrog.com/help/r/jfrog-security-user-guide/products/curation/configure-curation/fallback-behavior-for-blocked-packages) in order to keep developers safe without hurting their workflow. With CVS - the latest, non-malicious version of each package will be transparently served by Curation.
2. Consider enabling the [Package version is immature](https://jfrog.com/help/r/jfrog-security-user-guide/products/curation/configure-curation/create-policies/list-of-available-conditions) policy as show in the above video, in order to reject package versions which are too new. This will allow you to constantly stay immune to similar dependency hijack attacks.
3. Curation customers can utilize Catalog's new JFrog label, "Shai Hulud - The second coming", which enumerates all the compromised packages.
![](/img/RealTimePostImage/post/shai-hulud-v2-jfrog-catalog.png)

