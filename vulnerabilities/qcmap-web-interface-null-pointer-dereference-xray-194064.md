---
description: CVE-2020-25858 High severity. A null pointer dereference in the QCMAP_Web_CLIENT binary in the Qualcomm QCMAP software suite allows authenticated network attackers to cause denial of service by sending a request with a crafted URL.
title: QCMAP Web Interface NULL pointer dereference
date_published: "2020-10-14"
last_updated: "2020-10-14"
xray_id: XRAY-194064
vul_id: CVE-2020-25858
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
A null pointer dereference in the QCMAP_Web_CLIENT binary in the Qualcomm QCMAP software suite allows authenticated network attackers to cause denial of service by sending a request with a crafted URL.

## Component

Qualcomm QCMAP (closed source)

## Affected versions

QCMAP before October 2020

## Description

Qualcomm manufactures the MDM (Mobile Data Modem) family of SoCs, which provides various mobile connectivity features in a single package. One of the software suites is the QCMAP suite, which is in charge of running many services in the mobile access point. These include a lighttpd-based web interface and a MiniDLNA-based media server. QCMAP is used in many kinds of networking devices, primarily mobile hotspots and LTE routers.

Attackers can trigger the exploit by issuing an HTTP request with a crafted URL. A [public exploit exists](https://jfrog.com/blog/major-vulnerabilities-discovered-in-qualcomm-qcmap/), which demonstrates how to invoke the web interface with an unexpected URL parameter format (`http://x.x.x.x/cgi-bin/qcmap_web_cgi?a`) to cause denial of service and crash the interface.

The `QCMAP_Web_CLIENT` library implementation has a bug in the `Tokenizer()` function, which parses the input data and performs the chosen operation. The input parameters are expected to be in the format `var1=val1&var2=val2& var3=val3...`.  The function invokes `strstr()` to search for a `=` character, and then uses its return value without checking (in several implementations, the call to `strstr()` is replaced by a call to `strchr()`, which behaves in the same way). If there is no `=` character, the search returns `NULL`, causing a [NULL pointer dereference](https://en.wikipedia.org/wiki/Null_pointer#Null_dereferencing). This crashes the process.

The original exploit was developed by JFrog researchers. There are two related CVEs for this component: CVE-2020-3657 and CVE-2020-25859.

## PoC

`http://x.x.x.x/cgi-bin/qcmap_web_cgi?a`

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/major-vulnerabilities-discovered-in-qualcomm-qcmap/)
