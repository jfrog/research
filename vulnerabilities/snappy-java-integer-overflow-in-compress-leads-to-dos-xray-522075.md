---
description: CVE-2023-34454, MEDIUM, snappy-java integer overflow in compress leads to DoS
title: snappy-java integer overflow in compress leads to DoS
date_published: "2023-06-19"
last_updated: "2023-06-19"
xray_id: XRAY-522075
vul_id: CVE-2023-34454
cvss: 5.9
severity: medium
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

snappy-java integer overflow in compress leads to DoS

## Component

org.xerial.snappy:snappy-java

## Affected versions

(,1.1.10.1)

## Description

snappy-java is a fast compressor/decompressor for Java. Due to unchecked multiplications, an integer overflow may occur in versions prior to 1.1.10.1, causing an unrecoverable fatal error.

The function `compress(char[] input)` in the file `Snappy.java` receives an array of characters and compresses it. It does so by multiplying the length by 2 and passing it to the rawCompress` function.

Since the length is not tested, the multiplication by two can cause an integer overflow and become negative. The rawCompress function then uses the received length and passes it to the natively compiled maxCompressedLength function, using the returned value to allocate a byte array.

Since the maxCompressedLength function treats the length as an unsigned integer, it doesn?t care that it is negative, and it returns a valid value, which is casted to a signed integer by the Java engine. If the result is negative, a `java.lang.NegativeArraySizeException` exception will be raised while trying to allocate the array `buf`. On the other side, if the result is positive, the `buf` array will successfully be allocated, but its size might be too small to use for the compression, causing a fatal Access Violation error.

The same issue exists also when using the `compress` functions that receive double, float, int, long and short, each using a different multiplier that may cause the same issue. The issue most likely won?t occur when using a byte array, since creating a byte array of size 0x80000000 (or any other negative value) is impossible in the first place.

Version 1.1.10.1 contains a patch for this issue.

## PoC

```java
package org.example;
import org.xerial.snappy.Snappy;

import java.io.*;

public class Main {

    public static void main(String[] args) throws IOException {
        char[] uncompressed = new char[0x40000000];
        byte[] compressed = Snappy.compress(uncompressed);
    }
}
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[https://github.com/xerial/snappy-java/blob/05c39b2ca9b5b7b39611529cc302d3d796329611/src/main/java/org/xerial/snappy/Snappy.java#L169](https://github.com/xerial/snappy-java/blob/05c39b2ca9b5b7b39611529cc302d3d796329611/src/main/java/org/xerial/snappy/Snappy.java#L169)

[https://github.com/xerial/snappy-java/blob/05c39b2ca9b5b7b39611529cc302d3d796329611/src/main/java/org/xerial/snappy/Snappy.java#L422](https://github.com/xerial/snappy-java/blob/05c39b2ca9b5b7b39611529cc302d3d796329611/src/main/java/org/xerial/snappy/Snappy.java#L422)

[https://github.com/xerial/snappy-java/blob/master/src/main/java/org/xerial/snappy/Snappy.java](https://github.com/xerial/snappy-java/blob/master/src/main/java/org/xerial/snappy/Snappy.java)

[https://github.com/xerial/snappy-java/commit/d0042551e4a3509a725038eb9b2ad1f683674d94](https://github.com/xerial/snappy-java/commit/d0042551e4a3509a725038eb9b2ad1f683674d94)

[https://github.com/xerial/snappy-java/security/advisories/GHSA-fjpj-2g6w-x25r](https://github.com/xerial/snappy-java/security/advisories/GHSA-fjpj-2g6w-x25r)

