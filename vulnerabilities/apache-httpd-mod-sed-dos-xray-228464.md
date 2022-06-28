---
description: CVE-2022-30522 Medium severity. Very large input data to Apache's mod_sed filter module leads to denial of service
title: Apache httpd mod_sed DoS
date_published: "2022-06-09"
last_updated: "2022-06-09"
xray_id: XRAY-228464
vul_id: CVE-2022-30522
cvss: 7.5
severity: medium
discovered_by: Brian Moussalli
type: vulnerability
---
## Summary
Very large input data may cause Apache's mod_sed filter to abort, resulting in a denial of service
​

## Component

[Apache's mod_sed filter module](https://httpd.apache.org/docs/trunk/mod/mod_sed.html)
​

## Affected versions

Apache (, 2.4.53], fixed in 2.4.54
​
## Description

The [Apache HTTP Server](https://github.com/apache/httpd) is the most popular web server in the world. One of its main features is the possibility to use filter modules for various purposes.

One such module, `mod_sed`, provides the webmaster the same possibilities offered by [GNU's stream editor, sed](https://www.gnu.org/software/sed/). This module can be installed as an InputFilter or as an OutputFilter if someone wishes to edit requests or responses before they're processed by the server, or before being sent back to the client. 

A bug found in `mod_sed`'s buffer manipulation logic may cause to the abort of the process handling the HTTP request. This occurs when the `mod_sed` module is required to to handle inputs larger than 2GB of data.

An Apache deployment is vulnerable to remote exploitation if -

1. The server enables `mod_sed` in `httpd.conf` -

   ```
   LoadModule sed_module /usr/lib/apache2/modules/mod_sed.so
   ```

2. The server configures `mod_sed` to perform any kind of processing on incoming requests, by using `AddInputFilter`. For example - 

   ```
   <Directory />
   	AllowOverride none
   	Require all denied
   	AddInputFilter Sed html
   	InputSed "s/\(.)/Z/g"
   </Directory>
   ```

​		(note that the vulnerability can be triggered for **any** `InputSed` patterm)



## PoC

`python -c 'print("A")*(2*2**30)' | curl -X POST -d@- http://host`
​

## Vulnerability Mitigations


The `LimitRequestBody` configuration directive can be used to limit POST requests' sizes. We recommend setting the limit to 1GB of data or less in `httpd.conf`:   `LimitRequestBody 1073741824`
​

## References

[Apache advisory](https://httpd.apache.org/security/vulnerabilities_24.html)

[(JFrog) CVE-2022-30522 – Denial of Service (DoS) Vulnerability in Apache httpd “mod_sed” filter](https://jfrog.com/blog/cve-2022-30522-denial-of-service-dos-vulnerability-in-apache-httpd-mod_sed-filter/)