---
description: CVE-2025-32947 High severity. PeerTube ActivityPub Crawl Infinite Loop DoS
title: PeerTube ActivityPub Crawl Infinite Loop DoS
date_published: "2025-04-14"
last_updated: "2025-04-14"
xray_id:
vul_id: CVE-2025-32947
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
This vulnerability allows any attacker to cause the server to stop responding to requests due to an infinite loop.

## Component

[PeerTube](https://github.com/Chocobozzz/PeerTube)



## Affected versions

(, 7.1.1)



## Description

If federation is enabled (which is the default), PeerTube listens for POST requests to the **/inbox** path. This path is used for receiving ActivityPub activities. The function **crawlCollectionPage** is in charge of iterating through an ActivityPub OrderedCollection object that is sent to the server. Ordered collections may be separated into pages. If the ordered collection has the **first** property, the code fetches the first page, and then uses every page’s **next** property for fetching the next page. 

```js
const limit = ACTIVITY_PUB.FETCH_PAGE_LIMIT
let i = 0
let nextLink = firstBody.first

while (nextLink && i < limit) {
    let body: any

    if (typeof nextLink === 'string') {
      // Don't crawl ourselves
      const remoteHost = new URL(nextLink).host
      if (remoteHost === WEBSERVER.HOST) continue

      url = nextLink

      const res = await fetchAP<ActivityPubOrderedCollection<T>>(url)
      body = res.body
    } else {
      // nextLink is already the object we want
      body = nextLink
    }

    nextLink = body.next
    i++
    ...
  }
```

This code is meant to iterate through the pages, up to a maximum amount of **ACTIVITY_PUB.FETCH_PAGE_LIMIT** (2000) pages. When reaching a URL that has the same host as the server, the loop continues without incrementing the variable **i** or changing the **nextLink** variable. This means that the loop will never end. In our tests the server was busy running the endless loop and failed to respond to any other requests.

It is also possible to trigger the attack by causing the server to actively fetch activities from a remote server. This can be done in different ways, for example by using the **/api/v1/search/video-channels** path, and passing the **search** argument with a URL that can be used for the attack. This can be done only if users have the ability to search remote URIs (**search.remote_uri** in the configuration), which by default is enabled for registered users.



## PoC

This PoC assumes that there is a PeerTube instance on the machine listening on ports 3000 (client) and 9000 (server). We also assume that there is a channel called **root_channel**, belonging to the root user. For simplifying the PoC, we set the **prevent_ssrf** configuration to **false**, allowing us to create an attacking server easily on the same machine. Note that running this PoC will cause PeerTube’s server to stop responding, and it will need to be killed.



1. In a terminal, run the following command (you will need to install the **flask** package for python if it is not installed on the system):

   ```
   python malicious_rest_server.py
   ```

   This will start a server listening on port 1234.

1. In another terminal, run the following command (you will need to install the **cryptography** and **requests** packages for python if they are not installed on the system):

   ```
   python send_inbox_activity.py --stuck
   ```

   This script will create, sign and send a Create Activity to **http://localhost:9000/inbox**.

1. If everything was configured correctly, the PeerTube server won’t function normally anymore.

## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix release](https://github.com/Chocobozzz/PeerTube/releases/tag/v7.1.1)

[PoC Materials](https://drive.google.com/file/d/1zmXFNutT4ACOJZGmxhU22nhu9Fbn4ui2/view?usp=drive_link)
