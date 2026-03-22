---
excerpt: JFrog Security researchers have identified new, previously unreported compromised package versions related to the CanisterWorm npm supply chain attack.
title: New compromised versions detected in CanisterWorm attack
date: "March 22, 2026"
description: "Shavit Satou, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/canisterworm_npm.png
type: realTimePost
minutes: '5'

---

# New compromised versions detected in CanisterWorm attack

## 1\. Brief overview of attack

The CanisterWorm campaign is a sophisticated, worm-enabled npm supply chain attack initially brought to light by security researchers via previous reports (such as [Socket’s](https://socket.dev/blog/canisterworm-npm-publisher-compromise-deploys-backdoor-across-29-packages) and [Endor Lab](https://www.endorlabs.com/learn/canisterworm)’s). The threat actors behind the attack (tracked as "TeamPCP") have successfully compromised legitimate npm publisher namespaces, such as `@emilgroup` and `@teale.io`, by pushing new versions, that include malicious payloads, into SDK packages.

At the core of CanisterWorm is an elaborate execution and persistence mechanism:

- **Execution via hooks:** The malware is triggered during installation via a malicious `postinstall` script inside `package.json`, which drops a Python backdoor onto the infected host.  
- **Persistence:** On Linux environments, it utilizes `systemd --user` to create a persistent background service named `pgmon`.  
- **C2 via ICP:** The backdoor continuously polls an Internet Computer Protocol (ICP) canister acting as a dead-drop command and control channel (specifically `https://tdtqy-oyaaa-aaaae-af2dq-cai.raw.icp0.io/`). It retrieves secondary payloads, saving them to `/tmp/pglog` and tracking the execution state in `/tmp/.pg_state`.  
- **Credential Harvesting Scope:** The malware explicitly scans for `_authToken` values within local project `.npmrc` files, the user's home directory (`~/.npmrc`), and system-wide configurations (`/etc/npmrc`). It also targets the `NPM_TOKEN` and `NPM_TOKENS` environment variables, and executes `npm config get //registry.npmjs.org/:_authToken`.  
- **Propagation:** The worm is capable of autonomously spreading using a `deploy.js` script. It uses the extracted npm tokens to query the npm registry at npmjs.com (`/-/v1/search`) for all packages maintained by the compromised user. It then automatically increments the package's patch version and pushes the malicious update using `npm publish --access public --tag latest`.

## 2\. New compromised versions

Through our continuous monitoring and threat intelligence pipeline, we have identified the complete scope of packages compromised by the CanisterWorm attack.

Crucially, **we have detected extra package versions** not previously reported in other public disclosures. If you are using any of these specific packages, you must assume your environment is compromised:

### Uniquely Identified by Our Research Team:

- `@emilgroup/discount-sdk` (1.5.1)  
- `@emilgroup/document-uploader` (0.0.10)  
- `@emilgroup/docxtemplater-util` (1.1.2)  
- `@emilgroup/numbergenerator-sdk-node` (1.3.1)  
- `@emilgroup/partner-portal-sdk` (1.1.1)  
- `@emilgroup/setting-sdk` (0.2.1)  
- `@emilgroup/task-sdk` (1.0.2)  
- `@emilgroup/task-sdk-node` (1.0.2)

## 3\. Remediation guidance

If you suspect an infection or identify any of the compromised package versions in your environment, perform the following remediation steps immediately.

### Step 1: Containment

CanisterWorm's primary threat is its capability to self-propagate using stolen tokens. You must cut off its access immediately:

- **Rotate ALL npm publishing tokens** and any CI/CD environment secrets available on the compromised host. This includes tokens found in `~/.npmrc`, project-level `.npmrc`, `/etc/npmrc`, and the `NPM_TOKEN` or `NPM_TOKENS` environment variables.  
- Ensure that the scope of your new credentials is fully restricted using granular access policies (e.g., read-only vs. publish) and set expiration dates, rather than relying on traditional permanent tokens.  
- Audit your npm logs and package histories to verify no unauthorized publishes have occurred from your own namespace.

### Step 2: Eradication of Persistence

On Linux systems, the worm persists by installing a background service via `systemd`. You need to stop and disable it to prevent further remote payload execution:

```shell
systemctl --user stop pgmon.service && systemctl --user disable pgmon.service
```

### Step 3: Cleanup of Malicious Payloads

The threat actor's Python script downloads a secondary payload to a temporary location. You must remove the staging artifacts:

```shell
rm -f ~/.config/systemd/user/pgmon.service
rm -rf ~/.local/share/pgmon/
rm -f /tmp/pglog
rm -f /tmp/.pg_state
```

### Step 4: Package Removal

You must purge the infected package dependencies from your project entirely:

- **Delete your `node_modules` folder and clear the cache:**

```shell
rm -rf node_modules
npm cache clean --force
```

- **Downgrade to known safe versions:** Update your `package.json` to lock the affected SDK packages to the prior, non-compromised versions (e.g., locking `@emilgroup` packages to versions released before the attack window).  
- **Reinstall dependencies:**

```shell
npm install
```

### Step 5: Registry Cleanup

If your own publisher tokens were compromised and the worm successfully published malicious versions under your namespace:

- You must manually **unpublish** the compromised patch versions from the npm registry. Deleting local files or simply publishing a new version is not sufficient to protect downstream users who might install the compromised version.

### Step 6: Long-Term Prevention

To protect your environment from similar supply chain attacks moving forward:

- **Global Script Disabling:** Consider running `npm config set ignore-scripts true` to prevent the silent execution of `postinstall` hooks globally.  
- **Selective Script Execution:** Use tools like `@lavamoat/allow-scripts` to review and explicitly permit only necessary lifecycle scripts.  
- **System policies:** Implement policies (such as SELinux/AppArmor) to prevent unauthorized writes to `~/.config/systemd/user/`.  
- [**JFrog Curation**](https://jfrog.com/curation/)**:** Implement automated dependency scanning and approval workflows with [JFrog Curation](https://jfrog.com/curation/) to ensure only vetted packages enter your supply chain.

### Complete List of Known Compromised Packages:

| Package Name | Compromised Versions | X-ray ID |
| :---- | :---- | :---- |
| @pypestream/floating-ui-dom | 2.15.1 | XRAY-955001 |
| @leafnoise/mirage | 2.0.3 | XRAY-954938 |
| @opengov/ppf-backend-types | 1.141.2 | XRAY-954962 |
| eslint-config-ppf | 0.128.2 | XRAY-954936 |
| react-leaflet-marker-layer | 0.1.5 | XRAY-954942 |
| react-leaflet-cluster-layer | 0.0.4 | XRAY-954943 |
| react-autolink-text | 2.0.1 | XRAY-954959 |
| opengov-k6-core | 1.0.2 | XRAY-954926 |
| jest-preset-ppf | 0.0.2 | XRAY-954956 |
| cit-playwright-tests | 1.0.1 | XRAY-954934 |
| eslint-config-service-users | 0.0.3 | XRAY-954950 |
| babel-plugin-react-pure-component | 0.1.6 | XRAY-954955 |
| @opengov/form-renderer | 0.2.20 | XRAY-955058 |
| @opengov/qa-record-types-api | 1.0.3 | XRAY-954970 |
| @opengov/form-builder | 0.12.3 | XRAY-954953 |
| @opengov/ppf-eslint-config | 0.1.11 | XRAY-954967 |
| @opengov/form-utils | 0.7.2 | XRAY-954958 |
| react-leaflet-heatmap-layer | 2.0.1 | XRAY-954931 |
| @virtahealth/substrate-root | 1.0.1 | XRAY-955055 |
| @airtm/uuid-base32 | 1.0.2 | XRAY-954937 |
| @emilgroup/setting-sdk | 0.2.3,0.2.2,0.2.1 | XRAY-955067 |
| @emilgroup/partner-portal-sdk | 1.1.3,1.1.2,1.1.1 | XRAY-955063 |
| @emilgroup/gdv-sdk-node | 2.6.3,2.6.2,2.6.1 | XRAY-955060 |
| @emilgroup/docxtemplater-util | 1.1.4,1.1.3,1.1.2 | XRAY-955062 |
| @emilgroup/accounting-sdk | 1.27.3,1.27.2,1.27.1 | XRAY-955054 |
| @emilgroup/task-sdk | 1.0.4,1.0.3,1.0.2 | XRAY-955056 |
| @emilgroup/setting-sdk-node | 0.2.3,0.2.2,0.2.1 | XRAY-955064 |
| @emilgroup/task-sdk-node | 1.0.4,1.0.3,1.0.2 | XRAY-954923 |
| @emilgroup/partner-sdk | 1.19.3,1.19.2,1.19.1 | XRAY-955065 |
| @emilgroup/numbergenerator-sdk-node | 1.3.3,1.3.2,1.3.1 | XRAY-955066 |
| @emilgroup/customer-sdk | 1.54.5,1.54.4,1.54.3,1.54.2,1.54.1 | XRAY-954924 |
| @emilgroup/commission-sdk | 1.0.3,1.0.2,1.0.1 | XRAY-955068 |
| @emilgroup/process-manager-sdk | 1.4.2,1.4.1 | XRAY-955069 |
| @emilgroup/changelog-sdk-node | 1.0.3,1.0.2 | XRAY-955061 |
| @emilgroup/document-sdk-node | 1.43.6,1.43.5,1.43.4,1.43.3,1.43.2,1.43.1 | XRAY-954947 |
| @emilgroup/commission-sdk-node | 1.0.3,1.0.2,1.0.1 | XRAY-955053 |
| @emilgroup/document-uploader | 0.0.12,0.0.11,0.0.10 | XRAY-955057 |
| @emilgroup/discount-sdk | 1.5.3,1.5.2,1.5.1 | XRAY-954929 |
| @emilgroup/discount-sdk-node | 1.5.2,1.5.1 | XRAY-955059 |
| @teale.io/eslint-config | 1.8.16,1.8.15,1.8.14,1.8.13,1.8.12,1.8.11,1.8.10,1.8.9 | XRAY-954945 |
| @emilgroup/insurance-sdk | 1.97.6,1.97.5,1.97.4,1.97.3,1.97.2,1.97.1 | XRAY-954928 |
| @emilgroup/account-sdk | 1.41.2,1.41.1 | XRAY-954949 |
| @emilgroup/account-sdk-node | 1.40.2,1.40.1 | XRAY-954927 |
| @emilgroup/accounting-sdk-node | 1.26.2,1.26.1 | XRAY-954965 |
| @emilgroup/api-documentation | 1.19.2,1.19.1 | XRAY-954960 |
| @emilgroup/auth-sdk | 1.25.2,1.25.1 | XRAY-954966 |
| @emilgroup/auth-sdk-node | 1.21.2,1.21.1 | XRAY-954964 |
| @emilgroup/billing-sdk | 1.56.2,1.56.1 | XRAY-954951 |
| @emilgroup/billing-sdk-node | 1.57.2,1.57.1 | XRAY-954948 |
| @emilgroup/claim-sdk | 1.41.2,1.41.1 | XRAY-954961 |
| @emilgroup/claim-sdk-node | 1.39.2,1.39.1 | XRAY-954925 |
| @emilgroup/customer-sdk-node | 1.55.2,1.55.1 | XRAY-954944 |
| @emilgroup/document-sdk | 1.45.2,1.45.1 | XRAY-954941 |
| @emilgroup/gdv-sdk | 2.6.2,2.6.1 | XRAY-954930 |
| @emilgroup/insurance-sdk-node | 1.95.2,1.95.1 | XRAY-954933 |
| @emilgroup/notification-sdk-node | 1.4.2,1.4.1 | XRAY-954957 |
| @emilgroup/partner-portal-sdk-node | 1.1.2,1.1.1 | XRAY-954952 |
| @emilgroup/partner-sdk-node | 1.19.2,1.19.1 | XRAY-954935 |
| @emilgroup/payment-sdk | 1.15.2,1.15.1 | XRAY-954963 |
| @emilgroup/payment-sdk-node | 1.23.2,1.23.1 | XRAY-954969 |
| @emilgroup/process-manager-sdk-node | 1.13.2,1.13.1 | XRAY-954939 |
| @emilgroup/public-api-sdk | 1.33.2,1.33.1 | XRAY-954940 |
| @emilgroup/public-api-sdk-node | 1.35.2,1.35.1 | XRAY-954946 |
| @emilgroup/tenant-sdk | 1.34.2,1.34.1 | XRAY-954932 |
| @emilgroup/tenant-sdk-node | 1.33.2,1.33.1 | XRAY-954954 |
| @emilgroup/translation-sdk-node | 1.1.2,1.1.1 | XRAY-954968 |

