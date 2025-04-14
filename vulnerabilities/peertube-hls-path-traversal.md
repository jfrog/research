---
description: CVE-2025-32943 Low severity. A Path Traversal allows any authenticated user to leak the contents of arbitrary .m3u8 files from the server
title: PeerTube HLS Video Files Path Traversal
date_published: "2025-04-14"
last_updated: "2025-04-14"
xray_id:
vul_id: CVE-2025-32943
cvss: 3.7
severity: low
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
This vulnerability allows any authenticated user to leak the contents of arbitrary “.m3u8” files from the server.



## Component

[PeerTube](https://github.com/Chocobozzz/PeerTube)



## Affected versions

(, 7.1.1)



## Description

One of PeerTube’s API endpoints is `/static/streaming-playlists/hls/private/:videoUUID/:playlistName.m3u8`. This endpoint is used to fetch a `.m3u8` file of a private video. The code first checks that a valid video token was sent, and then sends the file contents. PeerTube does not sanitize the `playlistName` argument correctly. Instead of sanitizing the `playlistName` argument from `req.param`, (it tries to sanitize an optional playlistName argument from the query string)[https://github.com/Chocobozzz/PeerTube/blob/f0f44e1704db1187ed267ced69cec414974275f5/server/core/middlewares/validators/static.ts#L74]. An attacker can use the UUID of a public video, and insert `..%2f` in the `playlistName` field to traverse out of the video’s directory and into any other directory in the system and receive any `.m3u8` file. Reading a meaningful file might be difficult since there is a need to know the exact path of the specific `.m3u8` file wanted.

## PoC

This PoC assumes that there is a PeerTube instance on the machine listening on ports 3000 (client) and 9000 (server). Note that running this PoC will cause PeerTube’s server to shut down.
1. First, using a browser, log in to the PeerTube instance with any user’s credentials.
1. Upload a video to the server and make it private. Browse to the new uploaded video, and use the inspection screen to find and copy the video’s playlist UUID and .m3u8 filename. Save this information.
1. Upload another video and make it public. Use the inspection screen to find and copy the video’s UUID.
1. In a terminal, run the following commands (replace “public_uuid” with the UUID of the public video, “private_uuid” with the UUID of the private video, and “private_m3u8_file.m3u8” with the .m3u8 filename, all from step #1):

```
curl --path-as-is http://localhost:3000/static/streaming-playlists/hls/private/public_uuid/..%2fprivate_uuid%2fprivate_m3u8_file.m3u8 -H "x-peertube-video-password: 123"
```
The .m3u8 file will be returned.



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix release](https://github.com/Chocobozzz/PeerTube/releases/tag/v7.1.1)
