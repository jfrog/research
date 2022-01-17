---
title: QCMAP Web Interface RCE
date_published: "2020-10-14"
last_updated: "2020-10-14"
xray_id: XRAY-194063
vul_id: CVE-2020-3657
cvss: 9.8
severity: critical
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
Command injection and stack overflow in the Qualcomm QCMAP Web Interface leads to remote code execution

## Component

Qualcomm QCMAP (closed source)

## Affected versions

QCMAP before October 2020

## Description

Remote code execution can happen by sending a carefully crafted POST query when Device configuration is accessed from a tethered client through webserver due to lack of array bound check.

The issue resides in the `QCMAP_ConnectionManager` binary.

Part of the basic functionality of the media server is to allow the user to set media directories to publish from. This can be done, for example, via the web interface.

At the implementation level, the CGI handler at `cgi-bin/qcmap_web_cgi` passes data from the web form to the `QCMAP_Web_CLIENT` binary which parses the request. The sent data is expected to be in the format `var1=val1&var2=val2& var3=val3…`. The first variable is expected to be the `page` variable. If it is set to `SetMediaDir` the code parses the next variables to set the DLNA media directory. It then sends the variables to the `QCMAP_ConnectionManager` binary, which takes care of the request in the function `qmi_qcmap_msgr_set_dlna_media_dir` and passes it to `QCMAP_MediaService::SetDLNAMediaDir`. In this function, the code splits the sent directory by the `,` character, and for each portion, it calls `snprintf` to create a command, which is then sent as an argument to the `system` function. There is no check on the user input to make sure that it doesn’t include malicious characters, thus it is possible to pass a string with shell metacharacters (such as `;`) and run arbitrary commands.

## PoC

`http://x.x.x.x/cgi-bin/qcmap_web_cgi?page=SetMediaDir&dir=fakedir;sleep%2010`

## Vulnerability mitigations

No vulnerability mitigations are supplied for this issue

## References

[JFrog Blogpost](https://jfrog.com/blog/major-vulnerabilities-discovered-in-qualcomm-qcmap/)
