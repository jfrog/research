---
description: CVE-2022-36114 Low severity. Cargo is vulnerable to zip-bomb attacks.
title: Rust Cargo zip-bomb DoS 
date_published: "2022-09-14"
last_updated: "2022-09-14"
xray_id: 
vul_id: CVE-2022-36114
cvss: 4.8
severity: low
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
Cargo is vulnerable to zip-bomb attacks when a user downloads a malicious package from sources other than crates.io

## Component

[Cargo](https://github.com/rust-lang/cargo)

## Affected versions

Rust (,1.63], fixed in Rust 1.64

## Description

[Rust](https://github.com/rust-lang/rust) uses [Cargo](https://github.com/rust-lang/cargo) as its package manager. Cargo, by default, downloads "crates" from [crates.io](https://crates.io/). Crates are essentially TAR files compressed with GZip. Crates.io limits the decompression size of uploaded crates to avoid [zip bombs](https://en.wikipedia.org/wiki/Zip_bomb).

On the other hand, the Cargo client does not apply a size limit on crates that it downloads from the registry. Although it might be safe to assume that crates downloaded from crates.io are fine due to the tests mentioned above, crates downloaded from other sources cannot be assumed to be safe. An attacker could upload to an alternate registry a specially crafted package that extracts significantly more data than its size, exhausting the memory space of the Cargo process and/or the disk space on the machine that uses Cargo to download the package.

## PoC

No PoC is supplied for this issue



## Vulnerability Mitigations

Users of alternate registries should exercise care in which packages they download, by only including trusted dependencies in their projects.

## References

[(Rust) Security advisories for Cargo (CVE-2022-36113, CVE-2022-36114)](https://blog.rust-lang.org/2022/09/14/cargo-cves.html)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-36114)