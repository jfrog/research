---
description: CVE-2023-34453, MEDIUM, snappy-java integer overflow in shuffle leads to DoS
title: snappy-java integer overflow in shuffle leads to DoS
date_published: "2023-06-19"
last_updated: "2023-06-19"
xray_id: XRAY-522076
vul_id: CVE-2023-34453
cvss: 5.9
severity: medium
discovered_by: Ori Hollander
type: vulnerability

---

## Summary

snappy-java integer overflow in shuffle leads to DoS

## Component

org.xerial.snappy:snappy-java

## Affected versions

(,1.1.10.1)

## Description

snappy-java is a fast compressor/decompressor for Java. Due to unchecked multiplications, an integer overflow may occur in versions prior to 1.1.10.1, causing a fatal error.

The function `shuffle(int[] input)` in the file `BitShuffle.java` receives an array of integers and applies a bit shuffle on it. It does so by multiplying the length by 4 and passing it to the natively compiled shuffle function. Since the length is not tested, the multiplication by four can cause an integer overflow and become a smaller value than the true size, or even zero or negative. In the case of a negative value, a `java.lang.NegativeArraySizeException` exception will raise, which can crash the program. In a case of a value that is zero or too small, the code that afterwards references the shuffled array will assume a bigger size of the array, which might cause exceptions such as `java.lang.ArrayIndexOutOfBoundsException`.

The same issue exists also when using the `shuffle` functions that receive a double, float, long and short, each using a different multiplier that may cause the same issue.

Version 1.1.10.1 contains a patch for this vulnerability.



## PoC

```java
package org.example;
import org.xerial.snappy.BitShuffle;

import java.io.*;


public class Main {

    public static void main(String[] args) throws IOException {
        int[] original = new int[0x40000000];
        byte[] shuffled = BitShuffle.shuffle(original);
        System.out.println(shuffled[0]);
    }
}
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[https://github.com/xerial/snappy-java/blob/05c39b2ca9b5b7b39611529cc302d3d796329611/src/main/java/org/xerial/snappy/BitShuffle.java#L107](https://github.com/xerial/snappy-java/blob/05c39b2ca9b5b7b39611529cc302d3d796329611/src/main/java/org/xerial/snappy/BitShuffle.java#L107)

[https://github.com/xerial/snappy-java/blob/master/src/main/java/org/xerial/snappy/BitShuffle.java](https://github.com/xerial/snappy-java/blob/master/src/main/java/org/xerial/snappy/BitShuffle.java)

[https://github.com/xerial/snappy-java/commit/820e2e074c58748b41dbd547f4edba9e108ad905](https://github.com/xerial/snappy-java/commit/820e2e074c58748b41dbd547f4edba9e108ad905)

[https://github.com/xerial/snappy-java/security/advisories/GHSA-pqr6-cmr2-h8hf](https://github.com/xerial/snappy-java/security/advisories/GHSA-pqr6-cmr2-h8hf)

