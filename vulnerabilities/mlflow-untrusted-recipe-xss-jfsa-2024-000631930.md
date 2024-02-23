---
description: CVE-2024-27132, HIGH, MLflow untrusted recipe XSS.
title: Insufficient sanitization in MLflow leads to XSS when running an untrusted recipe.
date_published: "2024-02-23"
last_updated: "2024-02-23"
xray_id: JFSA-2024-000631930
vul_id: CVE-2024-27132
cvss: 
severity: High
discovered_by: Uriya Yavnieli
type: vulnerability

---

## Summary

Insufficient sanitization in MLflow leads to XSS when running an untrusted recipe.

## Component

mlflow

## Affected versions

(,2.9.2]

## Description

Insufficient sanitization in MLflow leads to XSS when running an untrusted recipe.
This issue leads to a client-side RCE when running an untrusted recipe in Jupyter Notebook.
The vulnerability stems from lack of sanitization over template variables.

## PoC

The following mlflow code would be vulnerable to this issue, when using an untrusted Recipe -

```python
from mlflow.recipes import Recipe
from mlflow.pyfunc import PyFuncModel
from IPython.core.debugger import set_trace
regression_recipe = Recipe(profile="local")
# Run the full recipe
regression_recipe.run()
# Inspect the model training results
regression_recipe.inspect(step="train")
# Load the trained model
regression_model_recipe: PyFuncModel = regression_recipe.get_artifact("model")
```



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix PR](https://github.com/mlflow/mlflow/pull/10873)

