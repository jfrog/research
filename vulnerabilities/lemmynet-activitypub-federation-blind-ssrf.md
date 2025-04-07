---
description: CVE-2025-25194 Medium severity. Blind SSRF found inside the WebFinger mechanism
title: LemmyNet activitypub_federation WebFinger Blind SSRF 
date_published: "2025-02-10"
last_updated: "2025-02-10"
xray_id:
vul_id: CVE-2025-25194
cvss: 4.0
severity: medium
discovered_by: Natan Nehorai
type: vulnerability
---
## Summary
This vulnerability allows a user to bypass any predefined hardcoded URL path or security anti-localhost mechanism and perform an arbitrary GET request to any Host, Port and URL using a Webfinger request.

## Component

[activitypub_federation](https://crates.io/crates/activitypub-federation)



## Affected versions

(,0.19.8]



## Description

The Webfinger endpoint takes a remote domain for checking accounts as a feature, however, as per the ActivityPub spec (https://www.w3.org/TR/activitypub/#security-considerations), on the security considerations section at B.3, access to Localhost services should be prevented while running in production.

It was discovered that an adversary can bypass the existing localhost checks by Gaining control over the query’s path, bypassing the domain’s restriction using DNS resolving mechanism or bypassing the domain’s restriction using official Fully Qualified Domain Names.



## PoC

1. Activate a local HTTP server listening to port 1234 with a “secret.txt” file:
   `python3 -m http.server 1234`

1. Open the “main.rs” file inside the “example” folder on the activitypub-federated-rust project, and modify the “beta@localhost” string into `hacker@localh.st:1234/secret.txt?something=1#`
   
1. Run the example using the following command:
   `cargo run --example local_federation axum`
   
1. View the console of the Python’s HTTP server and see that a request for a “secret.txt” file was performed.




## Vulnerability Mitigations

No mitigations are provided for this vulnerability.



## References

[GHSA](https://github.com/LemmyNet/lemmy/security/advisories/GHSA-7723-35v7-qcxw)