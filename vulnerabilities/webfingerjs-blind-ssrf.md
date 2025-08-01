---
description: CVE-2025-54590 Medium severity. Webfinger.js Blind SSRF
title: Webfinger.js Blind SSRF
date_published: "2025-07-28"
last_updated: "2025-07-28"
xray_id:
vul_id: CVE-2025-54590
cvss: 6.9
severity: medium
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
This vulnerability allows a user to perform an arbitrary GET request to any Host, Port and URL.



## Component

[webfinger.js](https://www.npmjs.com/package/webfinger.js)



## Affected versions

(, 2.8.0]



## Description

The lookup function takes a user address for checking accounts as a feature, however, as per the [ActivityPub spec](https://www.w3.org/TR/activitypub/#security-considerations), on the security considerations section at B.3, access to Localhost services should be prevented while running in production.

If the address is in the format of a user address (**user@host.com**), the host will be anything after the first found **@** symbol. Since no other test is done, an adversary may pass a specially crafted address such as **user@localhost:7000/admin/restricted_page?** and reach pages that would normally be out of reach.



## PoC

This PoC assumes that there is a server on the machine listening on port 3000, which receives requests for WebFinger lookups on the address **/api/v1/search_user**, and then calls the lookup function in webfinger.js with the user passed as an argument. For the sake of the example we assume that the server configured webfinger.js with **tls_only=false**.

1. Activate a local HTTP server listening to port 1234 with a “secret.txt” file:

`python3 -m http.server 1234`

1. Run the following command:

`curl "http://localhost:3000/api/v1/search_user?search=user@localhost:1234/secret.txt?"`

1. View the console of the Python’s HTTP server and see that a request for a “**secret.txt?/.well-known/webfinger?resource=acct:user@localhost:1234/secret.txt?**” file was performed.



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Advisory](https://github.com/advisories/GHSA-8xq3-w9fx-74rv)

