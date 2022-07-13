---
description: Medium severity. The UaUniString::UaUniString() function in Unified Automation C++ based OPC UA Client Server SDK is vulnerable to out of bounds read issue which can allow a remote authenticated attacker to perform information leak of technical data
title: Unified Automation C++ based OPC UA Client Server SDK out of bounds read
date_published: "2022-06-01"
last_updated: "2022-06-01"
xray_id: XRAY-75755
vul_id:
cvss:
severity: medium
discovered_by: Omer Kaspi
type: vulnerability
---
## Summary
The UaUniString::UaUniString() function in Unified Automation C++ based OPC UA Client Server SDK is vulnerable to out of bounds read issue which can allow a remote authenticated attacker to perform information leak of technical data

## Component

[Unified Automation C++ based OPC UA Client Server SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html)
​

## Affected versions

Unified Automation C++ based OPC UA Client Server SDK (, 1.7.6], fixed in 1.7.7
​
## Description

[Unified Automation C++ based OPC UA Client Server SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html) is a SDK used to develop an OPC UA server in C++, Developed by the Unified Automation.

The `UaUniString::UaUniString` function is vulnerable to an out of bounds read vulnerability:
```c
void __thiscall UaUniString::UaUniString(UaUniString *this, const char *other)
{
…

  thisa = this;
  if ( other )
  {
    iWLen = 0;
    for ( i = 0; other[i]; ++i )
    {
      c = other[i];
      if ( c >= 128 )
      {
        if ( (c & 0xE0) == '\xC0' )
        {
          ++i;
          ++iWLen;
        }
        else if ( (c & 0xF0) == '\xE0' )
        {
          i += 2;
          ++iWLen;
        }
        else if ( (c & 0xF8) == '\xF0' )
        {
          i += 3;
          ++iWLen;
        }
        else if ( (c & 0xFC) == '\xF8' )
        {
          i += 4;
          ++iWLen;
        }
        else if ( (c & 0xFE) == '\xFC' )
        {
          i += 5;
          ++iWLen;
        }
      }
      else
      {
        ++iWLen;
      }
    }
    iLen = i;
    pData = OpcUa_Memory_Alloc(2 * iWLen + 2);
    iLenUsed = 0;
    for ( ia = 0; ia <= iLen; ++ia )
    {
      v5 = other[ia];
      if ( v5 >= 0x80 )
      {
	…
       else if ( (v5 & 0xF8) == '\xF0' )
        {
          pData[iLenUsed++] = '?';
          ia += 3;
        }
        else if ( (v5 & 0xFC) == '\xF8' )
        {
          pData[iLenUsed++] = '?';
          ia += 4;
        }
        else if ( (v5 & 0xFE) == '\xFC' )
        {
          pData[iLenUsed++] = '?';
          ia += 5;
        }
      }
      else
      {
        pData[iLenUsed++] = other[ia];
      }
    }


```
The function calculates in the first loop the length of the converted string which is `iWLen`, when it gets to a special character(for example 0xE0) it increments the index of `other` in more than 1 without checking if it would skip over the `other`’s null terminator thus calculating a length bigger than the original string’s length.
The function allocates the new utf16 array for the converted string based on `iWLen`
Later, the second loop copies the string with the length that was calculated before, this would copy any character under 0x80 into the new buffer except some special characters that would be returned as ‘?’.
Because the new string buffer will be written up to `iLen` which is the out of bound length the new string will contain data that is after the original string, in the heap.
By using the `index_range` parameter in a "Read" request in the OPC UA protocol, the server calls this function and returns the data to the client.


## PoC

No PoC is supplied for this issue
​

## Vulnerability Mitigations


No mitigations are supplied for this issue


## References

