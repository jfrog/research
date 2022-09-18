---
description: CVE-2022-36113 Low severity. A path traversal in Cargo leads to arbitrary file overwrite.
title: Rust Cargo symlink arbitrary file overwrite
date_published: "2022-09-14"
last_updated: "2022-09-14"
xray_id: 
vul_id: CVE-2022-36113
cvss: 4.6
severity: low
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
A path traversal in Cargo leads to arbitrary file overwrite when a user downloads a malicious package from sources other than crates.io

## Component

[Cargo](https://github.com/rust-lang/cargo)

## Affected versions

Rust (,1.63], fixed in Rust 1.64

## Description

[Rust](https://github.com/rust-lang/rust) uses [Cargo](https://github.com/rust-lang/cargo) as its package manager. Cargo, by default, downloads "crates" from [crates.io](https://crates.io/). Crates are essentially TAR files compressed with GZip. Crates.io has several security tests to assure that a crate is safe to upload. One of the tests assures that none of the entries in the TAR file is a hard or soft link. These tests are good and work correctly.

On the other hand, the Cargo client does not perform this test on crates that it downloads from the registry. Although it might be safe to assume that crates downloaded from crates.io are fine due to the tests mentioned above, crates downloaded from other sources cannot be assumed to be safe.

After a package is downloaded, Cargo extracts its source code in the `~/.cargo` folder on disk, making it available to the Rust projects it builds. To record when an extraction is successful, Cargo writes the text `ok` to the `.cargo-ok` file at the root of the extracted source code once all files are extracted.

Since the Cargo client does not check the package, it may contain a `.cargo-ok` symbolic link, which Cargo would extract. Then, when Cargo attempts to write `ok` into `.cargo-ok`, it would actually replace the first two bytes of the file the symlink points to with `ok`. This would allow an attacker to corrupt an arbitrary file on the machine that uses Cargo to extract the package.

## PoC

No PoC is supplied for this issue



## Vulnerability Mitigations

Users of alternate registries should exercise care in which packages they download, by only including trusted dependencies in their projects.

## References

[(Rust) Security advisories for Cargo (CVE-2022-36113, CVE-2022-36114)](https://blog.rust-lang.org/2022/09/14/cargo-cves.html)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-36113)