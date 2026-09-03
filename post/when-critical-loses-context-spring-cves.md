---
excerpt: "On August 20, 2026, Spring published 91 CVEs in a single day. CISA's ADP rated six of them Critical. When we checked those scores against Spring's own advisories, they didn't hold up."
title: "When \"Critical\" Loses Context: The Reality of Spring CVEs"
date: "September 3, 2026"
description: "Aviv Engelberg and Niv Lanyado, JFrog Security Researchers"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '7'

---

![](/img/RealTimePostImage/post/when-critical-loses-context-spring-cves/image1.png)

On August 20, 2026, [Spring published](https://spring.io/security) 91 CVEs in a single day. CISA's ADP rated six of them Critical. When we checked those scores against Spring's own advisories, they didn't hold up:

1. ***CVE-2026-47890*** and ***CVE-2026-59313*** have the same underlying weakness: a carriage return that corrupts a Server-Sent Events stream. **Spring scores both 2.6, Low, with the same vector**. CISA scores both 9.8, Critical.
2. ***CVE-2026-47891*** is a memory-exhaustion bug. **Nothing in the advisory or the fix touches confidentiality or integrity.** CISA's vector claims full compromise of both anyway.
3. ***CVE-2026-47892*** and ***CVE-2026-59283*** are **reachable only under specific, non-default application conditions**. CISA assigns both Low attack complexity without accounting for these prerequisites.
4. ***CVE-2026-47884*** is the one CVE here where CISA's Critical rating has a real basis: Spring's own advisory names a conditional path to RCE.

## How CVEs Got Faster Than the People Scoring Them

This is not a Spring problem, and it is not a new one. It is what happens when the volume of incoming vulnerabilities outgrows the capacity of anyone verifying them.

According to NIST, CVE submissions have grown by roughly 263% since 2020. NIST enriched around 42,000 records in 2025, more than in any year before it, and still lost ground. 2026 YTD sits at 58,482 CVEs - already 45.0% above all of 2024 (40,313) and 20.9% above all of 2025 (48,364), with four months still remaining in the year. By the end of that year the NVD's backlog of unprocessed vulnerabilities had passed 27,000, and projections for 2026 put annual disclosures above 60,000. In April 2026, NIST responded the only way it could: it stopped trying to enrich everything. Today the NVD analyzes:

1. CVEs in the KEV catalog.
2. CVEs in federal software.
3. CVEs in software defined as critical under [EO 14028](https://www.nist.gov/itl/executive-order-14028-improving-nations-cybersecurity/securing-critical-software/critical), which covers software that runs with elevated privilege or controls access to systems and data. Spring does not qualify, so its CVEs get no NIST enrichment at all.

Everything else is published and labeled "Not Scheduled," These records may still contain metadata supplied by vendors or CNAs, but they receive no NIST-added severity score, CWE, or product mapping.

## CVEs Rated Critical by CISA

| CVE | Component | CISA score | Score from Spring CVSS vector | Spring advisory | Fix commit |
| :---- | :---- | :---- | :---- | :---- | :---- |
| [CVE-2026-47884](https://nvd.nist.gov/vuln/detail/CVE-2026-47884) | org.springframework:spring-webmvc | 9.8 (Critical) | 5.8 (Medium) | [Advisory](https://spring.io/security/cve-2026-47884) | [Commit](https://github.com/spring-projects/spring-framework/commit/d31f7a5a801b) |
| [CVE-2026-47890](https://nvd.nist.gov/vuln/detail/CVE-2026-47890) | org.springframework:spring-webmvc, org.springframework:spring-webflux | 9.8 (Critical) | 2.6 (Low) | [Advisory](https://spring.io/security/cve-2026-47890) | [Commit](https://github.com/spring-projects/spring-framework/commit/1994e0ebd077) |
| [CVE-2026-47891](https://nvd.nist.gov/vuln/detail/CVE-2026-47891) | org.springframework:spring-web | 9.8 (Critical) | 4.3 (Medium) | [Advisory](https://spring.io/security/cve-2026-47891) | [Commit](https://github.com/spring-projects/spring-framework/commit/e12f0761f3bf) |
| [CVE-2026-47892](https://nvd.nist.gov/vuln/detail/CVE-2026-47892) | org.springframework:spring-webflux | 9.8 (Critical) | 4.8 (Medium) | [Advisory](https://spring.io/security/cve-2026-47892) | [Commit](https://github.com/spring-projects/spring-framework/commit/07cbd482a000) |
| [CVE-2026-59313](https://nvd.nist.gov/vuln/detail/CVE-2026-59313) | org.springframework:spring-webmvc | 9.8 (Critical) | 2.6 (Low) | [Advisory](https://spring.io/security/cve-2026-59313) | [Commit](https://github.com/spring-projects/spring-framework/commit/35921cc01f81) |
| [CVE-2026-59283](https://nvd.nist.gov/vuln/detail/CVE-2026-59283) | org.springframework:spring-expression | 9.1 (Critical) | 6.5 (Medium) | [Advisory](https://spring.io/security/cve-2026-59283) | [Commit](https://github.com/spring-projects/spring-framework/commit/0d08f8dfaf26) |

\* The CISA scores come from CISA-ADP entries in NVD. Spring scores are calculated from the CVSS 3.1 vectors linked in the official Spring advisories.

## Why the Gap Matters

These differences highlight the value of considering vendor assessments alongside external CVSS ratings. Maintainers often have detailed knowledge of the affected code path, the conditions required for exploitation, and the likely impact, allowing their analysis to better reflect practical risk.

## Why Spring's Assessments Are More Reasonable

To understand the differences, we reviewed each advisory, both CVSS vectors, the affected code path, the fix, and the available tests. Spring's assessments generally reflect the conditions required to reach each issue and the impact directly supported by the code, while CISA's Critical ratings assume broader and more damaging outcomes.

#### CVE-2026-47884 - Improper Path Limitation in XsltView

**CISA: 9.8 Critical | Spring: 5.8 Medium**

CISA rates this as full confidentiality, integrity, and availability compromise. Spring's advisory acknowledges both SSRF and RCE but scores it as low-confidentiality with changed scope - essentially rating the SSRF path. When the preconditions are met, RCE may be possible: the JDK's XSLT processor permits Java extension functions by default, and Spring does not restrict them, so an attacker-supplied stylesheet can call Runtime.exec() without any additional configuration. However, the preconditions themselves are narrow - the application must use XsltView (a legacy view technology - a public GitHub code search finds only 33 XsltViewResolver imports, versus over 8,000 for Thymeleaf and over 21,000 for JSP), have a catch-all /** mapping, and derive the view name from the request path.

![](/img/RealTimePostImage/post/when-critical-loses-context-spring-cves/image2.png)

Spring's 5.8 understates the impact when the conditions are met, but CISA's 9.8 overstates how commonly those conditions exist in real applications.

#### CVE-2026-47890 - SSE Stream Corruption While Rendering Fragments

**CISA: 9.8 Critical | Spring: 2.6 Low**

CISA claims full server compromise with no preconditions. The actual bug is a `\r` character that breaks SSE field boundaries when view fragments are streamed to clients. The bug affects spring-webmvc and spring-webflux — the former among the most widely deployed Java web libraries, referenced in roughly 129,000 pom.xml files on GitHub, the latter in about 9,400 - but the vulnerable path requires the fragments-over-SSE feature.

![](/img/RealTimePostImage/post/when-critical-loses-context-spring-cves/image3.png)

The application must also combine this with attacker-controlled data flowing through template rendering into those fragments while victims are actively consuming the stream. The impact is corrupted event data in other users' browsers: no server-side data is leaked, no code is executed, and no service is disrupted. Spring's 2.6 accurately reflects the narrow, client-side-only impact.

#### CVE-2026-47891 - maxInMemorySize Bypassed in Jaxb2XmlDecoder

**CISA: 9.8 Critical | Spring: 4.3 Medium**

CISA claims full confidentiality and integrity compromise. The bug is a memory-limit bypass in JAXB XML decoding that requires the optional Aalto XML async parser to be on the classpath — an uncommon dependency. The application must also actively decode XML through JAXB-annotated types, whether via @RequestBody, the functional ServerRequest API, WebClient's ClientResponse, or direct Jaxb2XmlDecoder calls. Even when all conditions are met, the impact is strictly resource exhaustion — the fix moves a byte counter, and nothing in the code path touches data confidentiality or integrity. **Of 27 Spring Framework CVEs rated Medium in 2026, CISA or NVD escalated four to Critical and seven to High. Eight kept their Medium rating, while eight have not received a separate CISA or NVD CVSS score.** Spring's availability-only score is the only one the code supports.

#### CVE-2026-47892 - Header Predicate Bypass in WebFlux Functional Endpoints

**CISA: 9.8 Critical | Spring: 4.8 Medium**

CISA scores this as trivially exploitable with full impact. The bug only affects applications that deploy WebFlux functional endpoints standalone via RouterFunctions.toHttpHandler() or RouterFunctions.toWebHandler() - the standard Spring Boot deployment with DispatcherHandler intercepts preflight requests before any handler invocation and is not affected. This is a rare, non-default deployment pattern. The bypass causes a crafted CORS preflight to pass header predicates unconditionally and actually execute the handler function without the required headers - so if the handler returns sensitive data or triggers side effects, those fire on a crafted OPTIONS request. That said, the impact is bounded by what that specific handler does, not system-wide. Spring's 4.8 reflects that the deployment prerequisite is niche and the impact is handler-dependent; CISA's 9.8 assumes universal exploitability and full server compromise, neither of which is supported by the code.

#### CVE-2026-59283 - SpEL SimpleEvaluationContext Safety Guard Bypass

**CISA: 9.1 Critical | Spring: 6.5 Medium**

CISA assumes low attack complexity and high integrity impact. The vulnerability is a safety guard bypass: when the SpEL compiler is active, compiled bytecode skips the runtime policy checks that SimpleEvaluationContext enforces in interpreted mode. The severity depends on whether expressions are ever compiled under a permissive context and later evaluated under a restricted one - in that scenario, the compiled bytecode retains full power. When only SimpleEvaluationContext is used, dangerous operations fail before compilation triggers, limiting impact to confidentiality leaks and memory pressure. Spring's score reflects this nuance - confidentiality low, availability high, integrity none - because assignment expressions are not compilable. The vulnerability requires two non-default configurations: explicit SimpleEvaluationContext usage and the SpEL compiler enabled in IMMEDIATE or MIXED mode, which is off by default. CISA's 9.1 treats these prerequisites as a given.

#### CVE-2026-59313 - SSE Stream Corruption in Functional MVC

**CISA: 9.8 Critical | Spring: 2.6 Low**

Identical root cause to CVE-2026-47890 - a `\r` that breaks SSE field boundaries - but across seven specific call sites spanning three SSE builder classes in the functional MVC, annotation-based MVC, and WebFlux APIs. The vulnerability requires attacker-controlled data to reach one of these SSE builder methods. The fix replaces split("\n") with a character-by-character loop that also handles `\r`. The impact is client-side stream corruption only. Spring assigns both this and CVE-2026-47890 the identical vector and score — 2.6 Low. **Of 8 Spring Framework CVEs rated Low in 2026, CISA or NVD escalated two to Critical, two to High, and one to Medium. Only one kept its Low rating, while two have not received a separate CISA or NVD CVSS score.**

## Conclusion: Two Scores, One Record, No Referee

Nothing in the CVE pipeline resolves a disagreement between a vendor's score and CISA's. CISA's ADP scores only records where the CNA supplied nothing, and Vulnrichment's own documentation treats a record carrying both scores as an error in the ADP container, with the CNA's data taking precedence. Spring published complete CVSS vectors in its advisories but did not carry them into the CVE records, so the ADP filled a vacuum that was never meant to stay open.

The gap that opened is not a matter of opinion. The vendor wrote the affected code, holds the report, writes the fix, and runs the tests. On CVE-2026-47891 the fix moves a byte counter; on CVE-2026-59313 it handles a carriage return, and the same weakness produces the same 9.8 twice. Nobody reading those commits arrives at full confidentiality and integrity compromise. A score assigned without them can, and did.

The correction requires no new policy. Until the vendor's vector reaches the CVE record, read the ADP container as an estimate made without the code. Where a vendor score and an external one disagree, that gap is a signal to verify. **Vendor-provided vectors should remain the primary assessment, while CISA's enrichment should be reserved only for records where no vendor score exists.**
