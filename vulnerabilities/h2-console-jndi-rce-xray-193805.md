---
description: CVE-2021-42392 Critical severity. Unsafe JNDI loading in H2 database console leads to remote code execution
title: H2 console JNDI RCE
date_published: "2022-01-06"
last_updated: "2022-01-07"
xray_id: XRAY-193805
vul_id: CVE-2021-42392
cvss: 9.8
severity: critical
discovered_by: Andrey Polkovnychenko
type: vulnerability
---
## Summary
Unsafe JNDI loading in H2 database console leads to remote code execution

## Component

[H2 Database](https://www.h2database.com/html/main.html)

## Affected versions

H2 Database (, 2.0.204], fixed in 2.0.206

## Description

Several code paths in the [H2 database](https://www.h2database.com/html/main.html) framework pass unfiltered attacker-controlled URLs to the `javax.naming.Context.lookup` function, which allows for remote codebase loading.

The most severe attack vector of this issue is through the H2 console.

The H2 database contains an embedded web-based console, which allows easy management of the database. It’s available by default on http://localhost:8082 when running the H2 package JAR.

Access to the console is protected by a login form, which allows passing the `driver` and `url` fields to the corresponding fields of `JdbcUtils.getConnection`. This leads to unauthenticated RCE, since the username and password are not validated before performing the lookup with the potentially malicious URL.

Although the issue is critical, it does have some mitigating factors -
1. On vanilla distributions of the H2 database, by default the H2 console only listens to localhost connections – making the default setting safe.
2. Many vendors may be running the H2 database, but not running the H2 console. Although there are other vectors to exploit this issue other than the console, these other vectors are context-dependent and less likely to be exposed to remote attackers.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

Vendors may wish to upgrade their Java (JRE/JDK) version to enable the `trustURLCodebase` mitigation.
This mitigation is enabled by default on the following versions of Java (or any later version) –

* 6u211
* 7u201
* 8u191
* 11.0.1

The mitigation will deny loading of remote classes via JNDI, but can be bypassed by sending a serialized "gadget" Java object through LDAP, as long as the respective "gadget" class is included in the classpath (depends on the server that runs the H2 database).

## References

[(JFrog) JNDI-Related Vulnerability Discovered in H2 Database Console ](https://jfrog.com/blog/the-jndi-strikes-back-unauthenticated-rce-in-h2-database-console/)