---
description: TensorFlow SavedModel with Lambda Layers containing malicious code
title: TFLOW-LAMBDA
type: modelThreat
---


## Overview

A TensorFlow SavedModel may contain a "Lambda" layer, which contains embedded Python code in binary format. **This code may contain malicious instructions** which will be executed when the model is loaded.

The TensorFlow SavedModel format is a legacy format used by TensorFlow to store ML models. A SavedModel is a directory that contains a complete TensorFlow program, including weights and computation. It does not require the original model building code to run.

![](/img/savedmodel_format.png)

The SavedModel directory contains the Keras model metadata in a file called `keras_metadata.pb`, this is a [ProtoBuf](https://protobuf.dev/)-serialized binary which contains Keras Layers denoted as `_tf_keras_layer` nodes. These layers contain a standard Keras Model Configuration in JSON format.

The Model Configuration specifies all the layers of the model, and may specify a **Lambda** layer.

The Lambda layer specifies custom operations defined by the model author, which are defined simply by a raw Python code object (Python Bytecode).

![](/img/hdf5_lambda.png)

**Since arbitrary Python Bytecode can contain any operation, including malicious operations**, loading an untrusted TensorFlow SavedModel is considered to be dangerous.



## Time of Infection

**[v] Model Load**

[] Model Query

[] Other



## Evidence Extraction and False Positive Elimination

To safely determine if the suspected TensorFlow SavedModel contains malicious code -

1. Identify the `keras_metadata.pb` file in your SavedModel directory

2. Extract any raw Python bytecode in `Lambda` layers present in `_tf_keras_layer` nodes, this can be done with the following Python code snippet -

   ```python
   import json
   from tensorflow.python.keras.protobuf.saved_metadata_pb2 import SavedMetadata
   
   SUSPECTED_MODEL_PATH = "/path/to/savedmodel/keras_metadata.pb"
   
   saved_metadata = SavedMetadata()
   with open(SUSPECTED_MODEL_PATH, "rb") as f:
       saved_metadata.ParseFromString(f.read())
   
   lambda_code = [layer["config"]["function"]["items"][0]
       for layer in [json.loads(node.metadata)
           for node in saved_metadata.nodes
           if node.identifier == "_tf_keras_layer"]
       if layer["class_name"] == "Lambda"]
   
   print(lambda_code)
   ```

3. Decompile the raw Python bytecodes, ex. using [pycdc](https://github.com/zrax/pycdc)

4. Examine the decompiled Python code to determine if it contains any malicious instructions

   

JFrog conducts extraction, decompilation and detailed analysis on each TensorFlow SavedModel in order to determine whether any malicious code is present.



## Additional Information

* https://github.com/Azure/counterfit/wiki/Abusing-ML-model-file-formats-to-create-malware-on-AI-systems:-A-proof-of-concept