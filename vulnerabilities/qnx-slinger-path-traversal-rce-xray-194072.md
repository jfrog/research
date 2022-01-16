---
title: QNX slinger path traversal RCE
date_published: "2020-08-12"
last_updated: "2020-08-12"
xray_id: XRAY-194072
vul_id: CVE-2020-6932
cvss: 9.8
severity: critical
discovered_by: Ilya Khivrich
type: vulnerability
---
## Summary
Path traversal in the slinger web server on BlackBerry QNX allows unauthenticated network attackers to run arbitrary executables and read arbitrary files with the privileges of the web server by sending a simple crafted packet

## Component

[QNX slinger](http://www.qnx.com/developers/docs/6.5.0/index.jsp?topic=%2Fcom.qnx.doc.neutrino_utilities%2Fs%2Fslinger.html)

## Affected versions

slinger [6.4.0, 6.6.0], fixed in 7.0

## Description

BlackBerry QNX is a microkernel-based operating system, widely used in embedded devices in the automotive and other industries. [slinger](http://www.qnx.com/developers/docs/6.3.2/neutrino/utilities/s/slinger.html) is a small web server meant for constrained devices that can serve files over HTTP and execute CGI scripts.

Attackers can trigger the exploit by sending a simple crafted packet containing URL-encoded path traversal operators (such as `/../`). This allows the attacker to access arbitrary files on the filesystem, outside of the web server's document root folder. The attacker can then expose sensitive data by reading general files or launch executables present on the system, passing them arbitrary parameters by including these in the URL. slinger normally runs under a restricted user account (-2 or 32767), and depending on system configuration, this can limit the potential for this attack. The public [exploit](https://jfrog.com/blog/follow-the-data-a-hidden-directory-traversal-vulnerability-in-qnx-slinger/) demonstrates running system executables which the slinger account can access in the default configuration.

The slinger web server performs URL decoding after sanitizing the URL for path traversal operators, instead of the other way around. This allows the attacker to insert special characters such as `/` or `..` , encoded as `%2f` and `%2e%2e`. slinger interprets them as path traversal operators and will read or execute the indicated file if it has permissions to it. The attacker can also specify parameters for executables after the `?` URL element. Note that executables marked with the `suid` bit may run under elevated privileges when invoked this way.

The original exploit was discovered by the Vdoo Research Team. The fix addresses this issue by correcting the order of the URL decoding and sanitization operations.

## PoC

`GET /cgi-bin/%2e%2e%2f%2e%2e%2f%2e%2e%2fusr%2fsbin%2flogger?whaaaaa`

## Vulnerability mitigations

* Remove or disable the slinger web server on systems in which it is not necessary.
* Remove filesystem permissions so that the slinger account (-2 or 32767) cannot access any files outside its web root folder.
* Remove filesystem permissions so that the slinger account (-2 or 32767) cannot access any files with the `suid` bit set.

## References

[JFrog Blogpost](https://jfrog.com/blog/follow-the-data-a-hidden-directory-traversal-vulnerability-in-qnx-slinger/)
