---
description: CVE-2021-38305 High severity. Insufficient input validation in Yamale allows an attacker to perform Python code injection when processing a malicious schema file
title: Yamale schema code injection
date_published: "2021-10-05"
last_updated: "2021-10-05"
xray_id: XRAY-182135
vul_id: CVE-2021-38305
cvss: 7.8
severity: high
discovered_by: Andrey Polkovnychenko
type: vulnerability
---
## Summary
Insufficient input validation in Yamale allows an attacker to perform Python code injection when processing a malicious schema file

## Component

[Yamale](https://github.com/23andMe/Yamale)

## Affected versions

Yamale (,3.0.8), fixed in 3.0.8

## Description

[Yamale](https://github.com/23andMe/Yamale) is a popular schema validator for [YAML](https://github.com/Animosity/CraftIRC/wiki/Complete-idiot's-introduction-to-yaml) that’s used by over 200 repositories.

A code injection vulnerability occurs when parsing a malicious schema file, due to the `parser.parse` method which invokes an insecure call to `eval` with user-controlled input.

An attacker that can control the contents of the schema file that’s supplied to Yamale (`-s/--schema` command line parameter), can provide a seemingly valid schema file that will cause arbitrary Python code to run.

This issue may be exploited remotely if some piece of the vendor code allows an attacker to control the schema file, for example:
```
subprocess.run(["yamale", "-s", remote_userinput, "/path/to/file_to_validate"])
```
This scenario is much more likely to be exploited as part of a [parameter injection](https://staaldraad.github.io/post/2019-11-24-argument-injection/) attack

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

No vulnerability mitigations are supplied for this issue

## References

[(JFrog) Newly discovered code injection vulnerability in Yamale](https://jfrog.com/blog/23andmes-yamale-python-code-injection-and-properly-sanitizing-eval/)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2021-38305)