---
description: Keras model with Lambda Layers containing malicious code
title: KERAS-LAMBDA
type: modelThreat
---


## Overview

A Keras model may contain a "Lambda" layer, which contains embedded Python code in binary format. **This code may contain malicious instructions** which will be executed when the model is loaded.

The Keras v3 format is the latest format used by TensorFlow and Keras to store ML models.

![](/img/kerasv3_format.png)

Internally, this format is a ZIP archive which contains a JSON file called `config.json` which specifies the configuration of the ML Model.

The Model Configuration specifies all the layers of the model, and may specify a **Lambda** layer.

The Lambda layer specifies custom operations defined by the model author, which are defined simply by a raw Python code object (Python Bytecode).

![](/img/hdf5_lambda.png)

**Since arbitrary Python Bytecode can contain any operation, including malicious operations**, loading an untrusted Keras v3 Model is considered to be dangerous.



## Time of Infection

**[v] Model Load**

[] Model Query

[] Other



## Evidence Extraction and False Positive Elimination

To safely determine if the suspected Keras v3 model contains malicious code -

1. Extract and parse the `config.json` file from the Keras v3 model zip archive, to identify `Lambda` layers

2. Extract and decode the Base64-encoded data of the `Lambda` layer to obtain a Python code object

3. Decompile the raw Python code object, ex. using [pycdc](https://github.com/zrax/pycdc)

4. Examine the decompiled Python code to determine if it contains any malicious instructions

   

JFrog conducts extraction, decompilation and detailed analysis on each Keras v3 model in order to determine whether any malicious code is present.



## Additional Information

* https://hiddenlayer.com/innovation-hub/models-are-code/#Code-Execution-via-Lambda