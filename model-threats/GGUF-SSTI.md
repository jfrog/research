---
description: GGUF model attempting template injection for arbitrary code execution
title: GGUF-SSTI
type: modelThreat
---


## Overview

A GGUF model may contain a [Jinja2](https://palletsprojects.com/projects/jinja/) template which may cause server-side template injection ([SSTI](https://portswigger.net/web-security/server-side-template-injection)) that leads to **execution of malicious Python code** when the model is loaded.

<u>Important Note</u> - The only publicly known case where loading a GGUF model leads to dangerous server-side template injection is related to the [CVE-2024-34359](https://github.com/abetlen/llama-cpp-python/security/advisories/GHSA-56xg-wfcc-g829) ("Llama Drama") vulnerability. This vulnerability is only exploitable when loading a GGUF model using a vulnerable version of the [llama-cpp-python](https://pypi.org/project/llama-cpp-python/) library (`llama-cpp-python` < 0.2.72). This means that arbitrary code execution <u>will not occur</u> when loading a malicious GGUF model into `llama-cpp-python` >= 0.2.72 or into other GGUF-compatible libraries, such as [ollama](https://ollama.com/download) .

The GGUF model format is a binary format optimized for quickly loading and storing models. One of the features of the GGUF model format, is the ability to store a **chat template** in the Model's metadata (`tokenizer.chat_template`).

![](/img/chat_template.png)

A chat template simply defines how a chat (prompt) interaction with the model will look like. The chat template in a GGUF model is written using the Jinja2 template language. Since the Jinja2 template language supports execution of arbitrary Python code, loading arbitrary Jinja2 templates from a GGUF model into an **unsandboxed** Jinja2 engine leads to arbitrary code execution.

For example - the following Jinja2 template, which can be inserted into a GGUF model's `chat_template` metadata parameter, will run the shell command `touch /tmp/retr0reg` if the GGUF model is loaded in an unsandboxed environment -

```
{% for x in ().__class__.__base__.__subclasses__() %}{% if "warning" in x.__name__ %}{{x()._module.__builtins__['__import__']('os').popen("touch /tmp/retr0reg")}}{%endif%}{% endfor %}
```



## Time of Infection

**[v] Model Load**

[] Model Query

[] Other



## Evidence Extraction and False Positive Elimination

To safely determine if the suspected GGUF model contains a malicious Jinja2 template -

1. Parse the GGUF model's metadata parameters and extract the `tokenizer.chat_template` string

2. Inspect the chat template data for suspicious strings such as `__class__`, `os`, `subprocess`, `eval` and `exec`

   

JFrog conducts metadata extraction and detailed analysis on each GGUF model in order to determine whether any malicious code is present.



## Additional Information

* https://github.com/abetlen/llama-cpp-python/security/advisories/GHSA-56xg-wfcc-g829
* https://github.com/huggingface/smol-course/blob/main/1_instruction_tuning/chat_templates.md
* https://techtonics.medium.com/secure-templating-with-jinja2-understanding-ssti-and-jinja2-sandbox-environment-b956edd60456