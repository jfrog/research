---
description: CVE-2022-xxxx Medium severity. The ua_decode_extensionobject() function in Unified Automation C based PubSub Stack is vulnerable to type confusion issue which can allow a remote authenticated attacker to achieve denial of service and arbitrary read
title: Unified Automation PubSub stack ua_decode_extensionobject type confusion
date_published: "2022-06-01"
last_updated: "2022-06-01"
xray_id: XRAY-75752
vul_id:
cvss:
severity: medium
discovered_by: Omer Kaspi
type: vulnerability
---
## Summary
The ua_decode_extensionobject() function in Unified Automation C based PubSub Stack is vulnerable to type confusion which can allow a remote authenticated attacker to achieve denial of service and arbitrary read
## Component

[Unified Automation C++ Based OPC UA PubSub SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html)
[Unified Automation ANSI C Based OPC UA Client & Server SDK](https://www.unified-automation.com/products/server-sdk/ansi-c-ua-server-sdk.html)
[Unified Automation HighPerf SDK](https://www.unified-automation.com/products/pubsub-sdk/highperf-ua-pubsub-sdk.html)
​

## Affected versions

Unified Automation C++ based OPC UA Client Server SDK (, 1.7.6], fixed in 1.7.7
Unified Automation AnsiC SDK (, 1.9.2], fixed in 1.9.3
Unified Automation HighPerf SDK (, 1.5.2], fixed in 1.6.0


## Description

Unified Automation is a Bundle used to develop an OPC UA PubSub support in C++ and C, Developed by the Unified Automation.

The `ua_decocde_extensionobject` function may be vulnerable to a type confusion vulnerability:
```c
int __cdecl ua_decode_extensionobject(int *a1, void *a2)
{
  const char *v3; // eax
  char v4[12]; // [esp+Ch] [ebp-20h]
  char **v5; // [esp+18h] [ebp-14h]
  Int type_id; // [esp+23h] [ebp-9h]
  int v7; // [esp+28h] [ebp-4h]

  v5 = 0;
  j__ua_nodeid_init(a2);
  v7 = j__ua_decode_nodeid(a1, a2 + 12);
  if ( v7 )
    return v7;
  v7 = j__ua_decode_uint8(a1, type_id);
  if ( !v7 )
  {
    *(a2 + 6) = 0;
    *(a2 + 14) = 0;
    if ( !j__ua_nodeid_is_null(a2 + 12) )
    {
      v5 = j__ua_type_table_lookup_binary_encoding(a2 + 12, a2 + 6);
      if ( v5 )
      {
        j__ua_nodeid_set_numeric(a2, *(a2 + 10), v5[3]);
        *(a2 + 14) = *(a2 + 10);
      }
      else
      {
        j__trace_log(64, 16, aUaDecodeExtens, *(a2 + 10));
…
           }
    }
    switch ( type_id )
    {
      case 0:
        *(a2 + 10) = 0;
        return 0;
      case 1:
        if ( v5 )
        {
          v7 = ua_decode_encodeableobject(a1, v5, a2);
          if ( !v7 )
            return 0;
        }
        else
        {
          v7 = j__ua_decode_bytestring(a1, a2 + 32);
          if ( !v7 )
          {
            *(a2 + 10) = 2;
            return 0;
          }
        }
        break;
…
    }
  }

…
    }
  }
…
  return v7;
}


```

The function uses `a2 + 12` to store the node id on the parsed extension object, it then tries to search it in namespace using `j__ua_type_table_lookup_binary_encoding` if it fails to find it and the object’s `type_id` is 1 which is binary encoding, it parses the object as bytestring.
Further down the execution path of the pubsub SDK, the SDK’s functions treat this object as valid which can cause unexpected behavior, we managed to crash the server using a malicous pubsub configuration by making the pubsub SDK to treat the length field of the bytestring as a pointer in `w_cfg = (ua_uadpdatasetwritermessagedatatype *)w->config_object->message_settings.body.obj` in function `writergroup_datasetmsg_init_order`
Given a big enough string this can cause arbitrary read from any location in memory by treating the length field as pointer

## PoC

No PoC is supplied for this issue
​

## Vulnerability Mitigations


No mitigations are supplied for this issue


## References

