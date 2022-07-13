---
description: High severity. The replaceArgEscapes() function in Unified Automation C-based PubSub Stack is vulnerable to an out of bounds write issue. An authenticated remote attacker can cause denial of service or in some cases achieve remote code execution
title: Unified Automation PubSub stack authenticated out-of-bounds write
date_published: "2022-06-01"
last_updated: "2022-06-01"
xray_id: XRAY-75751
vul_id:
cvss:
severity: high
discovered_by: Omer Kaspi
type: vulnerability
---
## Summary
The `replaceArgEscapes()` function in Unified Automation C-based PubSub Stack is vulnerable to an out of bounds write issue. An authenticated remote attacker can cause denial of service or in some cases achieve remote code execution
## Component

[Unified Automation C++ Based OPC UA PubSub SDK](https://www.unified-automation.com/products/server-sdk/c-ua-server-sdk.html)
​

## Affected versions

Unified Automation C++ based OPC UA Client Server SDK (, 1.7.6], fixed in 1.7.7
Unified Automation AnsiC SDK (, 1.9.2], fixed in 1.9.3
Unified Automation HighPerf SDK (, 1.5.2], fixed in 1.6.0


## Description

Unified Automation is a Bundle used to develop an OPC UA PubSub support in C++ and C, Developed by the Unified Automation.



`String::arg()` takes a string input and replaces every `%1` , `%2` (and so on) with an argument.
There are some uses in this function that looks like this:
`“%1.%2”.arg(s1).arg(s2)`
If `s1` itself contains `%1` then the next `arg()` call will paste `s2` where originally `s1` should have been placed.

`UaString::arg()` calls `findArgEscapes(ArgEscapeData *d, const UaString *s)` which sets `d->occurences` to the number of the lowest argument id in the format string (i.e for `“%1%1%2”` the function will count only the `“%1”` in the string) and sets `d->escape_len` to the accumulated length of all of the arguments in the string (in the previous example it will be 4).
Later, `UaString::arg()` will call `replaceArgEscapes()` in order to replace the lowest argument id with the given argument string.
`replaceArgEscapes()` will allocate a buffer that should be big enough to contain the string after the replacements:

```c
UaString *replaceArgEscapes(UaString *result, const UaString *fmt_string, const ArgEscapeData *d, int field_width, const UaString *arg, const UaChar *fillChar)
{
	//..
v__field_width_abs = uaAbs<int>(&field_width);
v__fmt_string_size = UaString::size((UaString *)fmt_string);
v__arg_size = UaString::size((UaString *)arg);
v__size_without_escape_len = v__fmt_string_size - d->escape_len;
len = *uaMax<int>(&v__field_width_abs, &v__arg_size) * d->occurrences +
v__size_without_escape_len;
buf = (char *)OpcUa_Memory_Alloc(len + 1);
```
There is an integer overflow in this code. It calculates the required allocation size in this way:
`max(abs(field_width), arg_size) * d->occurences + (fmt_string_size - d->escape_len)`
Where the result will be assigned to an unsigned integer.
This calculation might lead to an integer overflow when this parameters are big numbers, for example if the format string is 0x10000 times `“%1”`, `arg_size` is 0x10001 bytes long and `field_width` is 1 bytes then `d->occurrences` will be 0x10000, the `fmt_string_size` will be 0x20000 and `d->escape_len` will be also 0x20000. These numbers brings the result of 0x10001*0x10000 + 0 = 0x10000. This will result in a buffer with a size that is smaller than expected.

Later, `replaceArgEscapes()` will copy the format string to the allocated buffer, where for each argument slot (“%1”) it will write the argument string. This will lead to write of the allocated buffer bounds and in certain cases also to remote code execution.


## PoC

No PoC is supplied for this issue
​

## Vulnerability Mitigations


No mitigations are supplied for this issue


## References

