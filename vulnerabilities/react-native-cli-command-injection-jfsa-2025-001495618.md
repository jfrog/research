---
description: CVE-2025-11953, CRITICAL, React Native CLI Command Injection
title: React Native CLI Command Injection
date_published: "2025-11-03"
last_updated: "2025-11-03"
xray_id: JFSA-2025-001495618
vul_id: CVE-2025-11953
cvss: 9.8
severity: critical
discovered_by: Or Peles
type: vulnerability

---

## Summary

Command injection in React Native CLI allows remote attackers to perform remote code execution by sending HTTP requests.

## Component

@react-native-community/cli-server-api

## Affected versions

[4.8.0,20.0.0)

## Description

The Metro Development Server, which is opened by the React Native CLI, binds to external interfaces by default. The server exposes an endpoint that is vulnerable to OS command injection. This allows unauthenticated network attackers to send a POST request to the server and run arbitrary executables. On Windows, the attackers can also execute arbitrary shell commands with fully controlled arguments.



## PoC

Assuming the Metro Development Server is running on `metro-server-host` on port 8081 - 

```shell
curl -X POST http://metro-server-host:8081/open-url -H "Content-Type: application/json" -d "{\"url\":\"cmd /c echo abc ^> c:\\temp\\poc.txt\"}"
```



## Vulnerability Mitigations

For improved security, or if upgrading is not possible, prefer binding the development server to the localhost interface explicitly, by including the “--host 127.0.0.1” flag, per the examples below -

```shell
npx react-native start --host 127.0.0.1
npx react-native-community/cli start --host 127.0.0.1
```



## References

[JFrog Technical Blog](https://jfrog.com/blog/cve-2025-11953-critical-react-native-community-cli-vulnerability)

[Fix Commit](https://github.com/react-native-community/cli/commit/15089907d1f1301b22c72d7f68846a2ef20df547)

