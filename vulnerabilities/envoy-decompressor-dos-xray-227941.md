---
description: CVE-2022-29225 High severity. Memory exhaustion in Envoy proxy decompressors leads to denial of service
title: Envoy proxy decompressor memory exhaustion DoS
date_published: "2022-06-09"
last_updated: "2022-06-09"
xray_id: XRAY-227941
vul_id: CVE-2022-29225
cvss: 7.5
severity: high
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
A memory exhaustion issue in Envoy Proxy's decompressors can allow a remote attacker to perform denial of service

## Component

[Envoy Proxy](https://www.envoyproxy.io/)



## Affected versions

Envoy Proxy (,1.19.5)|(,1.20.4)|(,1.21.3)|(,1.22.1), fixed in [1.19.5]|[1.20.4]|[1.21.3]|[1.22.1]



## Description

The [Envoy proxy](https://www.envoyproxy.io/) has the possibility to decompress Gzip and Brotli data. These features can be enabled via configuration, by adding the relevant filters. For example, to enable Brotli decompression, the following filter could be added under `http_filters` in the `envoy.yaml` configuration file:
```yaml
name: decompressor
typed_config:
	"@type": type.googleapis.com/envoy.extensions.filters.http.decompressor.v3.Decompressor
	decompressor_library:
		name: basic
        	typed_config:
				"@type": type.googleapis.com/envoy.extensions.compression.brotli.decompressor.v3.Brotli
```

The code that is in charge of decompressing the user supplied data does not implement a size limit for the output buffer, allowing the buffering of virtually unlimited amounts of data by accumulating all the extracted data into one large buffer before sending it upstream. An attacker can send a simple Brotli [Zip Bomb](https://en.wikipedia.org/wiki/Zip_bomb) (a small zip file that decompresses to a very large file) that can cause severe performance issues or crash the Envoy process due to memory exhaustion.

Note that while the vulnerability's root cause exists in both the Gzip and Brotli decompressors, a crashing payload was only demonstrated on the Brotli decompressor (since no Gzip payload was able to exhaust enough memory to cause a crash)



## PoC

`curl -v http://10.0.0.1:10000 -H "Content-Encoding: br" -H "Expect:" --data-binary @10GB.br`

Where `10GB.br` is a Brotli-compressed file that decompresses to 10GB



## Vulnerability Mitigations

If upgrading is not possible, make sure that your configuration does not allow Brotli decompression. The Brotli decompressor (`type.googleapis.com/envoy.extensions.compression.brotli.decompressor.v3.Brotli`) can either be completely removed, or replaced with the Gzip decompressor (`type.googleapis.com/envoy.extensions.compression.gzip.decompressor.v3.Gzip`)



## References

[(JFrog) Denial of Service Vulnerability in Envoy Proxy – CVE-2022-29225](https://jfrog.com/blog/denial-of-service-vulnerability-in-envoy-proxy-cve-2022-29225/)

[NVD](https://nvd.nist.gov/vuln/detail/CVE-2022-29225)