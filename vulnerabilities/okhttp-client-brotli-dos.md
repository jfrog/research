---
description: CVE-2023-3782, MEDIUM, OkHttp client Brotli DoS
title: OkHttp client Brotli DoS
date_published: "2023-07-19"
last_updated: "2023-07-19"
xray_id: XRAY-526161
vul_id: CVE-2023-3782
cvss: 5.9
severity: medium
discovered_by: Omer Kaspi
type: vulnerability

---

## Summary

DoS of the OkHttp client when using a BrotliInterceptor and surfing to a malicious web server, or when an attacker can perform MitM to inject a Brotli zip-bomb into an HTTP response

## Component

com.squareup.okhttp3:okhttp-brotli

## Affected versions

(,)

## Description

A DoS issue lies in the `intercept()` function, if the user added `BrotliInterceptor` as an interceptor and does not add content encoding, the okhttp client will add the http header for Brotli encoding and will automatically try to decompress responses.
The code does not guard against decompression bombs, which could crash the process due to memory exhaustion. With Brotli a file that weight several KBs can be decompressed into 10GB.

## PoC

The following client code will crash when surfing to an HTTP server that serves a [Brotli zip bomb](https://github.com/bones-codes/bombs/raw/master/http/10GB/10GB.html.br.bz2) -

```java
import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.brotli.BrotliInterceptor;
import java.io.IOException;
public class JavassistIntTruncationExample
{
public static void main(String argv[]) throws IOException {
    OkHttpClient client = new OkHttpClient.Builder()
            .addInterceptor(BrotliInterceptor.INSTANCE)
            .build();
    Request request = new Request.Builder()
            .url("http://127.0.0.1:8080")
            .build();
    Call call = client.newCall(request);
    Response response = call.execute();
    System.out.println(response.body().bytes().length);
}
}
```



## Vulnerability Mitigations

Remove any usage of the `BrotliInterceptor` class. If Brotli functionality is needed, a fixed version of the class [can be found here](https://github.com/square/okhttp/blob/parent-4.11.0/okhttp-brotli/src/main/kotlin/okhttp3/brotli/BrotliInterceptor.kt)



## References

[https://github.com/square/okhttp/issues/7738](https://github.com/square/okhttp/issues/7738)

