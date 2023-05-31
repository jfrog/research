---
description: CVE-2023-2968, HIGH, npm proxy undefined variable remote DoS
title: npm proxy undefined variable remote DoS
date_published: "2023-05-30"
last_updated: "2023-05-30"
xray_id: XRAY-520917
vul_id: CVE-2023-2968
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

Undefined variable usage in npm package "proxy" leads to remote denial of service

## Component

proxy

## Affected versions

(,2.1.1), Fixed in 2.1.1

## Description

A remote attacker can trigger a denial of service in the socket.remoteAddress variable, by sending a crafted HTTP request. Usage of the undefined variable raises a TypeError exception.

## PoC

The following simple program is vulnerable to this issue -

```javascript
import * as http from 'http';
import { createProxy } from 'proxy';

const server = createProxy(http.createServer());
server.listen(31285, () => {
	var port = server.address().port;
	console.log('HTTP(s) proxy server listening on port %d',
port);
});
```

An attacker can crash the program by sending a valid HTTP GET request followed by invalid tail data



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

No references are supplied for this issue

