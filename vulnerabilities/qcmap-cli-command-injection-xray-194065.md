---
title: QCMAP CLI command injection
date_published: "2020-10-14"
last_updated: "2020-10-14"
xray_id: XRAY-194065
vul_id: CVE-2020-25859
cvss: 6.7
severity: medium
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
Insufficient input validation in the QCMAP_CLI utility in the Qualcomm QCMAP software suite allows authenticated unprivileged local attackers to perform arbitrary code execution by sending crafted CLI commands.

## Component

Qualcomm QCMAP (closed source)

## Affected versions

QCMAP before October 2020

## Description

Qualcomm manufactures the MDM (Mobile Data Modem) family of SoCs, which provides various mobile connectivity features in a single package. One of the software suites is the QCMAP suite, which is in charge of running many services in the mobile access point. Among others, QCMAP contains a Command Line Interface (CLI) utility called QCMAP_CLI. From within this CLI, the user can change different settings on the device; one of the possible options is to set the gateway URL. QCMAP is used in many kinds of networking devices, primarily mobile hotspots and LTE routers.

Attackers can trigger the exploit by sending a series of crafted CLI commands. A [public exploit exists](https://jfrog.com/blog/major-vulnerabilities-discovered-in-qualcomm-qcmap/)) and demonstrates the running of arbitrary code in the CLI shell. Attackers must be able to run CLI code on the device locally before they can exploit the vulnerability, and they can only achieve privilege escalation if QCMAP_CLI can be run via `sudo` or `setuid`.

The library implementation has a bug in the `QCMAP_LAN::EnableGatewayUrl()` function in the `QCMAP_ConnectionManager` binary. In this function, the code calls `snprintf()` to create a string which includes the URL, and then calls `system()` to create a new process. There is no validation on the user input to make sure that it doesn’t include malicious characters; thus it is possible to pass a string with shell metacharacters (such as  ‘;’) and run arbitrary commands. This issue appears twice in some of the implementations of this function.

The original exploit was developed by JFrog researchers. There are two related CVEs for this component: CVE-2020-3657 and CVE-2020-25858.

## PoC

No PoC is supplied for this issue

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/major-vulnerabilities-discovered-in-qualcomm-qcmap/)
