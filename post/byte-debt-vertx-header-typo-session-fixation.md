---
excerpt: "A one-letter typo, Content-Xength, is accepted as Content-Length by the Eclipse Vert.x HTTP/1.x decoder (CVE-2026-102479). We chain it into response-queue desync and cross-user session fixation behind real reverse proxies."
title: "Byte Debt: From an HTTP Header Typo to Cross-User Session Fixation"
date: "October 28, 2026"
description: "Afek Berger, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/byte-debt-vertx-header-typo-session-fixation/image1.png
type: realTimePost
minutes: '7'

---

![](/img/RealTimePostImage/post/byte-debt-vertx-header-typo-session-fixation/image1.png)

# Byte Debt: From an HTTP Header Typo to Cross-User Session Fixation

Recently, a huge wave of web related vulnerabilities flooded the internet with php2shell as the most famous web vulnerability in years. As such our team decided to investigate an intriguing HTTP parsing anomaly tracked as CVE-2026-102479. 
It centers on a header parsing discrepancy within the Eclipse Vert.x HTTP/1.x decoder, where non standard headers such as `Content-Xength` are erroneously accepted as valid `Content-Length` header. 

Categorized as a high-severity vulnerability from the start, our research demonstrates how this primitive can be chained to achieve arbitrary response-queue desynchronization against shared reverse proxy connections. In this blog we are going to break down the root cause, exploit mechanics, and necessary prerequisites for real-world impact.

## The Bug

The bug is in the HTTP/1 `VertxHttpRequestDecoder` to avoid string allocations the decoder optimizes header lookups by checking name length and sampling specific byte offsets instead of verifying every character. For 14 byte headers, it validates the prefix and suffix, completely skipping offset 8 (the letter ‘L’).

Because that byte is never checked, Vert.x treats `Content-Xength` as a genuine `Content-Length header`. A front-end reverse proxy ignores the typo as an arbitrary custom header, Vert.x parses it as request framing, and the HTTP request boundary instantly desyncs.

 It was fixed in version 5.1.10 by [this commit](https://github.com/eclipse-vertx/vert.x/commit/317c778d7fdd92a2fb0757dabc68a31f8c98edb0). 

## Request smuggling, briefly

This bug leads to a request smuggling primitive, a technique James Kettle popularized at PortSwigger with [*HTTP Desync Attacks: Request Smuggling Reborn*](https://portswigger.net/research/http-desync-attacks). In short, a front-end reverse proxy and a backend server each decide independently where one HTTP request ends and the next begins. If they disagree, a front end can forward what it thinks is a clean request, while the backend reads a different number of bytes as that request body, leaving a fragment behind that gets misread as the start of whoever request comes next on that same reused connection.

In classic HTTP request smuggling (CL.TE or TE.CL), the desync comes down to how each header signals where the body ends:

* `Content-Length` specifies a fixed byte count declared upfront, the server simply counts down those bytes and stops.  
* `Transfer-Encoding: chunked` has no fixed total size. The body arrives in pieces, each declaring its own hex size, and only stops when the server hits an inline terminating chunk (`0\r\n\r\n`).

Because that `0` chunk acts as an immediate stop sign, a chunk-aware parser halts right there, completely ignoring whatever number was in `Content-Length`. If one server measures by fixed byte count while the other stops at the `0` marker, their boundaries split, leaving the leftover bytes trapped in the pipeline to poison the next request.

Our bug does not need conflicting headers at all, just a single misspelled one.

## Setup

The backend is a Quarkus app, sitting behind nginx (and haproxy, for cross-proxy confirmation) in Docker, with real backend connection pooling turned on, the realistic production setup rather than a one-off lab shortcut.

## First win: making a connection hang, then starving someone else's request

Our first instinct was the classic move, send a real `Content-Length` *and* a fake `Content-Xength` on the same request, hoping Vert.x would read the wrong header and leave an exact chunk of leftover data queued up to poison the next request. That was blocked outright, thanks to Netty's own duplicate `Content-Length` rejection (a defense from [CVE-2019-20445](https://nvd.nist.gov/vuln/detail/cve-2019-20445)) that kills the request with an instant `400` before it ever reaches the app.

Here is what actually works, send a Content-Xength: 50 header without a body, the front end sees no declared body and happily assumes the request is finished transferring the request to Vert.x. Meanwhile Vert.x ignores the typo, decides it is owed 50 bytes, and just sits there waiting. The result is an instant connection hang, tying up backend server threads while you walk away without ever sending another byte that can lead to potential DoS.

Aim that trick at an endpoint that ignores bodies and Vert.x will reply instantly, but it will not forget what it is owed. The connection keeps listening for those declared bytes while the front end marks the exchange complete and returns the connection to its idle pool. The next innocent request arrives, and Vert.x silently swallows it as part of your phantom body, never routed, never logged, completely erased, turning a simple hang into a surgical, silent denial of service against the next stranger in line.  
![](/img/RealTimePostImage/post/byte-debt-vertx-header-typo-session-fixation/image2.png)

## Pushing further: the double-desync

Turning this exact mismatch into full response poisoning can potentially be done by the technique laid out in [HTTP/1.1 Must Die: The Desync Endgame](https://portswigger.net/research/http1-must-die). The concept is simple, instead of leaving that byte debt open, you pay it off with data you completely control.

In short, it looks like this: request A opens the byte debt. Request B arrives with its body hiding two spliced requests, C and D. 

A's debt consumes B's headers completely. The backend skips B entirely, parses C, and hands you the response. It then parses D, but because the front end only expects one reply, D sits orphaned in the socket, waiting to be served to the next visitor.

To make the debt swallow B's headers perfectly, the byte count must match what the proxy actually outputs on the wire, because proxies like Nginx often inject their own headers along the way. In our lab we used [calibrate blind technique](https://portswigger.net/blog/http-1-1-must-die-conquering-the-0-cl-challenge#solution-b-calculating-the-offset-of-the-injected-headers), in which you scan a window of candidate byte counts and use whether the throwaway request C comes back as a clean page or a garbled error as the oracle.

![](/img/RealTimePostImage/post/byte-debt-vertx-header-typo-session-fixation/image3.png)  
We tested seven separate proxies: Nginx, HAProxy, Envoy, Traefik, Caddy, Apache httpd, and nghttpx. Every single one caught it the exact same way, but unfortunately, before recycling a backend connection into the pool, the front end peeks at the socket, spots D's unread response, and discards the dirty connection instead of handing it to a victim. That single check stopped us cold.

## The breakthrough: the dangling byte

We needed a way to prevent D from generating an immediate response, the solution was leaving a single dangling byte on D. 

The backend parses D headers, realizes it is still owed one byte of body, and simply pauses so no response is generated. When the front end checks the socket, it finds an empty buffer, assumes the connection is clean, and returns it to the pool. 

The next real visitor arrives, and the very first byte of their request satisfies D debt. The backend instantly fires D response back to them instead of answering their own traffic.

More on that [technique](https://portswigger.net/research/can-ai-do-novel-security-research#the-dangling-byte-technique). 

![](/img/RealTimePostImage/post/byte-debt-vertx-header-typo-session-fixation/image4.png)

We rebuilt the exploit from scratch against our own stack and reproduced it live, end to end, as session fixation.

We turned request D into a genuine `POST /login` using attacker credentials. When an unsuspecting visitor arrived with no cookies, the server handed them D response, a 303 redirect setting a session cookie for Alice. A follow-up request confirmed the planted session was live, dropping the victim straight into Alice's account, balance, and private data.

It worked deterministically across every proxy we tested, including Caddy and nghttpx, which had been the most aggressive at closing dirty connections under the previous setup.

**Live run, nginx:**

![](/img/RealTimePostImage/post/byte-debt-vertx-header-typo-session-fixation/image5.png)

That 100% hit rate relied on a single connection. Against a realistic 16-connection pool, spraying poisons roughly 25–35% of subsequent traffic: not guaranteed on the very next request, but still severe.

## What you can actually do with it

* **Session fixation:** The victim's browser silently receives a cookie for your account. If they make a purchase or upload private documents, they do it inside your account, leaving the data for you to view later.  
    
* **Upgraded XSS:** Reflected XSS usually requires tricking someone into clicking a suspicious link. Smuggling fires the payload directly into an innocent user browser as they browse normally.  
    
* **Stealth phishing:** If any endpoint redirects based on user input, you can bounce a victim directly to a phishing site with what looks like a trusted, same-site redirect.


None of this requires exotic flaws, just everyday features like a login form, an echoed field, or a redirect parameter.

## Scope, not scare

`vertx-core` has around 2,100 Maven dependents and north of 300 million cumulative downloads, but those figures span the entire history of the project. The actual exposure window is narrow: three minor release branches shipped over a few months (`5.0.0`–`5.0.12`, `5.1.0`–`5.1.9`, and `5.2.0`), patched in `5.1.10` and `5.2.1`. The takeaway isn't that Vert.x as a whole is broken, it is that if you deployed the modern 5.x line during that window, you are potentially vulnerable. 

## Popular Affected OpenSource Projects 

Our team was able to POC this vulnerability on several popular open source projects that use Vert.x webserver in the vulnerable version, in certain setups behind a frontend proxies such as:

| Project | GitHub Link | GitHub Stars | Maven |
| :---- | :---- | :---- | :---- |
| **TechEmpower/FrameworkBenchmarks** | [TechEmpower/FrameworkBenchmarks](https://github.com/TechEmpower/FrameworkBenchmarks) | 8,105 | Not published benchmark suite, built from source. |
| **strimzi/strimzi-kafka-bridge (0.33.0)** | [strimzi/strimzi-kafka-bridge](https://github.com/strimzi/strimzi-kafka-bridge) | 345 | io.strimzi:kafka-bridge published, but mainly distributed as the GA container image PoC'd. |
| **apache/camel-quarkus** | [apache/camel-quarkus](https://github.com/apache/camel-quarkus) | 302 | 509 dependent artifacts on camel-quarkus-core |

   
Note: All projects were reported directly regarding their potential vulnerability when using the affected Vert.x webserver version behind frontend proxies.

## Fix

Upgrade `io.vertx:vertx-core` to **5.1.10**, **5.2.1**, or newer. This patches the canonicalization flaw at the root, eliminating both the connection-starvation DoS and the response-poisoning chain

