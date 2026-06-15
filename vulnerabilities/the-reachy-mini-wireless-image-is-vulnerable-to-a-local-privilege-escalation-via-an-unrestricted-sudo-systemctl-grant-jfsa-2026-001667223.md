---
description: CVE-2026-53605, HIGH, The Reachy Mini Wireless image is vulnerable to a Local Privilege Escalation via an Unrestricted sudo systemctl Grant

title: The Reachy Mini Wireless image is vulnerable to a Local Privilege Escalation via an Unrestricted sudo systemctl Grant

date_published: "2026-06-15"
last_updated: "2026-06-15"
xray_id: JFSA-2026-001667223
vul_id: CVE-2026-53605
cvss: 
severity: high
discovered_by: 
type: vulnerability

---

## Summary

The Reachy Mini Wireless image is vulnerable to a Local Privilege Escalation via an Unrestricted sudo systemctl Grant


## Component



## Affected versions



## Description

The Reachy Mini Wireless image ships the daemon user (pollen) with a passwordless sudoers entry for /usr/bin/systemctl that carries no subcommand or argument restriction. An attacker who obtains code execution as pollen, for example, could escalate to full root in three commands, with no additional vulnerability required. 

## PoC



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References



