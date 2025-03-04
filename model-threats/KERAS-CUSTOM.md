---
description: Keras model with Custom Layers calling malicious functions
title: KERAS-CUSTOM
type: modelThreat
---


## Overview

A Keras model may contain custom "Lambda" layers, which do not contain embedded Python code but rather trigger function calls to standard library functions with arbitrary arguments. **These function calls may trigger malicious payloads** which will be executed when the model is loaded.

The Keras v3 format is the latest format used by TensorFlow and Keras to store ML models.

![](/img/kerasv3_format.png)

Internally, this format is a ZIP archive which contains a JSON file called `config.json` which specifies the configuration of the ML Model.

The Model Configuration specifies all the layers of the model, and may specify a **Lambda** layer.

A Lambda layer can contain raw Python Bytecode (the code is embedded into the Keras model), but can alternatively contain references to standard library functions, without the need to embed Python Bytecode into the model.

For example, a Lambda layer can achieve arbitrary shell command execution when the model is loaded, by calling the `os.system` standard library function -

```json
"config": {
    "layers": [{
            "module": "keras.layers",
            "class_name": "Lambda",
            "config": {
                "arguments": {                    
                    "key": {
                        "class_name": "function",
                        "config": "system",
                        "module": "os"
                    },
                    "iterable": ["ls -l"],
                },
...      
```

**Since execution of arbitrary shell commands can include malicious operations**, loading an untrusted Keras v3 Model is considered to be dangerous.

This code execution technique is extremely effective and dangerous, since malicious models that only "reference" standard library functions (and do not embed Python bytecode) **are still allowed to be loaded even with Keras' [safe_mode](https://www.tensorflow.org/api_docs/python/tf/keras/models/load_model) protection enabled** -

```python
tf.keras.models.load_model("malicious_model.keras", safe_mode=True) # Will still load!
```



## Time of Infection

**[v] Model Load**

[] Model Query

[] Other



## Evidence Extraction and False Positive Elimination

To safely determine if the suspected Keras v3 model contains malicious code -

1. Extract and parse the `config.json` file from the Keras v3 model zip archive, to identify `Lambda` layers

2. For each layer with `class_name == "function"` , inspect the `module` and `config` (function) parameters

3. Examine whether the parameters include names of well known dangerous modules or functions, such as `system`, `subprocess`, `eval`, `exec` etc.

   

JFrog conducts extraction and detailed analysis on each Keras v3 model in order to determine whether any malicious code is present.



## Additional Information
