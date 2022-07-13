---
description: Medium severity. The UaInt32Array::create() function in Unified Automation C based PubSub Stack is vulnerable to NULL dereference which can allow an authenticated remote attacker to cause denial of service
title: Unified Automation PubSub stack NULL dereference DoS
date_published: "2022-06-01"
last_updated: "2022-06-01"
xray_id: XRAY-75753
vul_id: 
cvss:
severity: medium
discovered_by: Uriya Yavnieli
type: vulnerability
---
## Summary
The UaInt32Array::create() function in Unified Automation C based PubSub Stack is vulnerable to NULL dereference which can allow a remote attacker to cause denial of service

## Component

[Unified Automation C++ Based OPC UA PubSub SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html)
[Unified Automation ANSI C Based OPC UA Client & Server SDK](https://www.unified-automation.com/products/server-sdk/ansi-c-ua-server-sdk.html)
[Unified Automation HighPerf SDK](https://www.unified-automation.com/products/pubsub-sdk/highperf-ua-pubsub-sdk.html)
## Affected versions

Unified Automation C++ based OPC UA Client Server SDK (, 1.7.6], fixed in 1.7.7
Unified Automation AnsiC SDK (, 1.9.2], fixed in 1.9.3
Unified Automation HighPerf SDK (, 1.5.2], fixed in 1.6.0


## Description

Unified Automation is a Bundle used to develop an OPC UA PubSub support in C++ and C, Developed by the Unified Automation.

There is a possible NULL deref in `UaInt32Array::create()`:
```cpp
void __cdecl UaInt32Array::create(UaInt32Array *const this, OpcUa_UInt32_0 length)
{
    UaInt32Array::clear(this);
    if ( length )
    {
        this->m_data = (OpcUa_Int32_0 *)OpcUa_Memory_Alloc(4 * length);
        memset(this->m_data, 0, 4LL * length);
        this->m_noOfElements = length;
    }
}
```
There is a call to `memset()` after `OpcUa_Memory_Alloc()` is called without checking if `this->m_data` is NULL. It might be NULL if the requested length is too big.

UaInt32Array::create() is called from `PubSubServer::DataSetDispatcherDataItemTargetVariable::DataSetDispatcherDataItemTargetVariable()` when parsing a `fieldMetadata.ValueRank` that is passed in a PubSubConfig that will eventually end up in the length parameter.

## PoC

No PoC is supplied for this issue
​

## Vulnerability Mitigations


No mitigations are supplied for this issue


## References

