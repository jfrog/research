---
description: Medium severity. The UaString::toUtf16() function in Unified Automation C++ based OPC UA Client Server SDK is vulnerable to 1-byte out of bound read issue which can allow a remote unauthenticated attacker to perform Denial of Service
title: Unified Automation C++ based OPC UA Client Server SDK 1-byte out of bounds read
date_published: "2022-06-01"
last_updated: "2022-06-01"
xray_id: XRAY-75754
vul_id:
cvss:
severity: medium
discovered_by: Omer Kaspi
type: vulnerability
---
## Summary
The UaString::toUtf16() function in Unified Automation C++ based OPC UA Client Server SDK is vulnerable to 1-byte out of bound read issue which can allow a remote unauthenticated attacker to perform Denial of Service

## Component

[Unified Automation C++ based OPC UA Client Server SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html)
​

## Affected versions

Unified Automation C++ based OPC UA Client Server SDK (, 1.7.6], fixed in 1.7.7
​
## Description

[Unified Automation C++ based OPC UA Client Server SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html) is a SDK used to develop an OPC UA server in C++, Developed by the Unified Automation.

The `UaString::toUtf16` function may be vulnerable to 1-byte out of bound read vulnerability:
```c
UaByteArray *__thiscall UaString::toUtf16(UaString *this, UaByteArray *result)
{
  UaByteArray *v2; // eax
  unsigned int *v3; // [esp+Ch] [ebp-70h]
  unsigned int *v4; // [esp+10h] [ebp-6Ch]
  unsigned int *v5; // [esp+14h] [ebp-68h]
  unsigned int *v6; // [esp+18h] [ebp-64h]
  unsigned int *v7; // [esp+1Ch] [ebp-60h]
  UaByteArray resulta; // [esp+28h] [ebp-54h]
  unsigned __int16 cValTmp; // [esp+30h] [ebp-4Ch]
  unsigned int cVal; // [esp+34h] [ebp-48h]
  int iLenUsed; // [esp+38h] [ebp-44h]
  unsigned __int16 *pUTF16Data; // [esp+3Ch] [ebp-40h]
  char c; // [esp+43h] [ebp-39h]
  int i; // [esp+44h] [ebp-38h]
  UaUInt32Array unicodeCharacters; // [esp+4Ch] [ebp-30h]
  int uniCodeLen; // [esp+5Ch] [ebp-20h]
  int iLen; // [esp+60h] [ebp-1Ch]
  char *pOther; // [esp+64h] [ebp-18h]
  const UaStringPrivate *d; // [esp+68h] [ebp-14h]
  const UaString *thisa; // [esp+6Ch] [ebp-10h]
  int v21; // [esp+78h] [ebp-4h]

  thisa = this;
  d = UaString::d_func(this);
  pOther = OpcUa_String_GetRawString(d);
  iLen = UaStringPrivate::size(d);
  if ( pOther )
  {
    uniCodeLen = 0;
    UaUInt32Array::UaUInt32Array(&unicodeCharacters);
    v21 = 0;
    UaUInt32Array::resize(&unicodeCharacters, iLen);
    for ( i = 0; i < iLen; ++i )
    {
      c = pOther[i];
      if ( c >= 128 )
      {
        if ( (c & 0xE0) == 192 )
        {
          *UaUInt32Array::operator[](&unicodeCharacters, uniCodeLen) = (c & 0x1F) << 6;
          c = pOther[++i];
          v7 = UaUInt32Array::operator[](&unicodeCharacters, uniCodeLen);
          *v7 |= c & 0x3F;
          ++uniCodeLen;
        }
        else if ( (c & 0xF0) == 0xE0 )
        {
          *UaUInt32Array::operator[](&unicodeCharacters, uniCodeLen) = (c & 0xF) << 12;
          c = pOther[++i];
          v6 = UaUInt32Array::operator[](&unicodeCharacters, uniCodeLen);
          *v6 |= (c & 0x3F) << 6;
          c = pOther[++i];
          v5 = UaUInt32Array::operator[](&unicodeCharacters, uniCodeLen);
          *v5 |= c & 0x3F;
          ++uniCodeLen;
        }
…

```

The function uses `i` to access the string stored in `this` when the character read is 0xE0 it read 2 other characters without checking that `i` doesn’t pass the `iLen` size, this can cause one byte out of bound read after the NULL terminator of the string.
This can cause denial of service if the string is located near a non accessible page.

## PoC

No PoC is supplied for this issue
​

## Vulnerability Mitigations


No mitigations are supplied for this issue


## References

