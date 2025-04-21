---
description: CVE-2025-32948 High severity. PeerTube ActivityPub Playlist Creation Blind SSRF and DoS
title: PeerTube ActivityPub Playlist Creation Blind SSRF and DoS
date_published: "2025-04-14"
last_updated: "2025-04-14"
xray_id:
vul_id: CVE-2025-32948
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
This vulnerability allows any attacker to cause the server to stop functioning, or in special cases send requests to arbitrary URLs (Blind SSRF).

## Component

[PeerTube](https://github.com/Chocobozzz/PeerTube)



## Affected versions

(, 7.1.1)



## Description

If federation is enabled (which is the default), PeerTube listens for POST requests to the **/inbox** path. This path is used for receiving ActivityPub activities. One of the possible activities is the Create Activity, which creates different objects on the server. One of the objects that may be created is a playlist. Part of the parsing of playlist ActivityPub objects includes fetching the playlist elements. The function that gets the list of the playlist items to fetch is **fetchElementUrls**. It is called from **createOrUpdateVideoPlaylist**. Afterwards, the **rebuildVideoPlaylistElements** function is called, which in turn calls the **buildElementsDBAttributes**, that calls **fetchRemotePlaylistElement** for each element. If the activity has an object instead of a string in the **url** field, the object will eventually be passed into the **got** library that is used by PeerTube, and will be parsed as additional options for the fetch. If the object will have valid options, they will be used by the **got** libraries. Such an example could be **{“enableUnixSockets”: true, “url”: “unix:/….”}**, which will cause the library to fetch from a UNIX socket (which won’t be protected by the **got-ssrf** library). Also the HTTP method can be changed, and some other options. In the case that the key isn’t valid, an error will be thrown, and will later be thrown again by the **_destroy** function in **got**, and will not be caught, causing the server to crash.

It is also possible to trigger the attack by causing the server to actively fetch activities from a remote server. This can be done in different ways, for example by using the **/api/v1/search/video-channels** path, and passing the **search** argument with a URL that can be used for the attack. This can be done only if users have the ability to search remote URIs (**search.remote_uri** in the configuration), which by default is enabled for registered users.



## PoC

This PoC assumes that there is a PeerTube instance on the machine listening on ports 3000 (client) and 9000 (server). We also assume that there are 2 existing users on the instance: the default root user and a low privileged user.



1. First, using a browser, log in to the PeerTube instance with the low privileged user’s credentials, and use the inspection screen to copy the authorization token of the user.

1. In a terminal, run the following command (you will need to install the **flask** package for python if it is not installed on the system):

   ```
   python malicious_rest_server.py
   ```

   This will start a server listening on port 1234.

1. In another terminal, run the following command (insert the user token in the proper place):

   ```
   curl -v 'http://localhost:3000/api/v1/search/video-channels?search=http://localhost:1234/accounts/root_crash' -H 'Authorization: Bearer user_token'
   ```

   This technique is based on PeerTube’s search for channels. After fetching the outbox of a user, it will not be possible to ask for the same user again using this technique until the refresh interval will pass. This means that every time you want to run this curl command you should change something in the username (for example `http://localhost:1234/accounts/root1_crash` instead of `http://localhost:1234/accounts/root_crash`) .

## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix release](https://github.com/Chocobozzz/PeerTube/releases/tag/v7.1.1)

[PoC Materials](https://drive.google.com/file/d/1zmXFNutT4ACOJZGmxhU22nhu9Fbn4ui2/view?usp=drive_link)
