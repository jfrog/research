---
description: CVE-2024-10524, MEDIUM, GNU Wget is vulnerable to an SSRF attack when accessing partially-user-controlled shorthand URLs
title: Wget shorthand URLs SSRF
date_published: "2024-11-19"
last_updated: "2024-11-19"
xray_id: JFSA-2024-001063927
vul_id: CVE-2024-10524
cvss: 6.5
severity: medium
discovered_by: Goni Golan
type: vulnerability

---

## Summary

GNU Wget is vulnerable to an SSRF attack when accessing partially-user-controlled shorthand URLs

## Component

[GNU Wget](https://www.gnu.org/software/wget/)

## Affected versions

(,1.24.5], Fixed in 1.25.0

## Description

GNU Wget is vulnerable to an SSRF attack when accessing partially-user-controlled shorthand URLs



## PoC

Consider an application that uses Wget to access a remote resource using shorthand HTTP, and passes the user’s credentials in the `userinfo` part of the URL. For example:

`wget user_input@example.com/file`

An attacker can supply the (seemingly legitimate) input `myuser:mypass`  which would result in the command line - `wget myuser:mypass@example.com/file`. This causes wget to unexpectedly issue an FTP request for the domain `myuser`, requesting the file `mypass@example.com/file`.

This allows the attacker to perform an SSRF attack, since they completely control the requested host and partially control the requested path (the path suffix is usually not controlled by the attacker)



## Vulnerability Mitigations

Add an explicit schema to any shorthand URLs accessed with Wget, for example replace -

`wget input@myserver`

with -

`wget https://input@myserver`



## References

[JFrog research blog](https://jfrog.com/blog/cve-2024-10524-wget-zero-day-vulnerability/)

[Fix commit](https://git.savannah.gnu.org/cgit/wget.git/commit/?id=c419542d956a2607bbce5df64b9d378a8588d778)

