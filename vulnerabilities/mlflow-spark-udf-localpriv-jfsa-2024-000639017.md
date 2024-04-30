---
description: CVE-2024-27134, HIGH, Excessive directory permissions in MLflow leads to local privilege escalation when using spark_udf.
title: MLflow spark_udf localpriv
date_published: "2024-02-23"
last_updated: "2024-02-23"
xray_id: JFSA-2024-000639017
vul_id: CVE-2024-27134
cvss: 
severity: high
discovered_by: Uriya Yavnieli
type: vulnerability

---

## Summary

Excessive directory permissions in MLflow leads to local privilege escalation when using spark_udf.

## Component

mlflow

## Affected versions

(,)

## Description

Excessive directory permissions in MLflow leads to local privilege escalation when using spark_udf. This behavior can be exploited by a local attacker to gain elevated permissions by using a ToCToU attack. The issue is only relevant when the spark_udf() MLflow API is called.

## PoC

Any MLflow code that uses `spark_udf` would be vulnerable to this issue, for example -

```python
from pyspark.sql import SparkSession
spark = SparkSession.builder.appName('SparkFrog').getOrCreate()
predict = mlflow.pyfunc.spark_udf(spark, 'iris_model')
```



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix PR](https://github.com/mlflow/mlflow/pull/10874)

