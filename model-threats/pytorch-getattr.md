---
description: PyTorch model using getattr maliciously
title: PYTORCH-GETATTR
type: modelThreat

---


## Overview

A PyTorch model may contain serialized Pickle data which will cause execution of potentially malicious Python code when the model is loaded. Specifically - the potentially malicious Python code may contain a reference to the getattr() function.

While `getattr()` is a basic method used in many legitimate codebases, it can be dangerous when misused.

## Potential Malicious Use of getattr

Consider this malicious example:

```python
class Exploit:
    def __init__(self):
        self.malicious_method = lambda: __import__('os').system('rm -rf /')

def dangerous_getattr(obj, method_name):
    # An attacker could potentially execute arbitrary system commands
    return getattr(obj, method_name)()

exploit = Exploit()
# This could potentially execute a destructive system command
dangerous_getattr(exploit, 'malicious_method')
```

In this example, `getattr()` allows dynamically calling a method that:

- Imports the `os` module
- Executes a destructive system command
- Could potentially delete critical system files
- Demonstrates how runtime attribute lookup can be exploited for unauthorized actions

## Evidence Extraction and False Positive Elimination

To safely determine if the `getattr()` use is benign:

1. Examine the specific parameters passed to `getattr()`
2. Verify the source and context of attribute access
3. Confirm the object and attribute namespaces are controlled and trusted
4. Validate that the retrieved attributes are limited to expected, safe operations

JFrog conducts a detailed parameter analysis to determine whether `getattr()` is used maliciously, by:

- Confirming the exact attributes being accessed
- Verifying no unexpected or dangerous method calls are used
- Ruling out potential arbitrary code execution scenarios
- Classifying the `getattr()` usage as safe if it meets the above safety criteria

This systematic approach transforms an initial flag from a potential security concern to a validated safe operation through careful, contextual examination.

## Additional Information

https://discuss.pytorch.org/t/securely-serializing-loading-untrusted-pytorch-models/119744
https://www.rapid7.com/db/modules/exploit/multi/http/torchserver_cve_2023_43654/