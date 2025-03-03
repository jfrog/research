---
description: TensorFlow H5 model with Lambda Layers containing malicious code
title: H5-LAMBDA
type: modelThreat
---


## Overview

A TensorFlow HDF5/H5 model may contain a "Lambda" layer, which contains embedded Python code in binary format. **This code may contain malicious instructions** which will be executed when the model is loaded.

The HDF5/H5 format is a legacy format used by TensorFlow and Keras to store ML models.

![](/img/hdf5_format.png)

Internally, this format contains an embedded JSON section called `model_config` which specifies the configuration of the ML Model.

The Model Configuration specifies all the layers of the model, and may specify a **Lambda** layer.

The Lambda layer specifies custom operations defined by the model author, which are defined simply by a raw Python code object (Python Bytecode).

![](/img/hdf5_lambda.png)

**Since arbitrary Python Bytecode can contain any operation, including malicious operations**, loading an untrusted HDF5/H5 Model is considered to be dangerous.



## Time of Infection

**[v] Model Load**

[] Model Query

[] Other



## Evidence Extraction and False Positive Elimination

To safely determine if the suspected HDF5 model contains malicious code -

1. Parse the `model_config` JSON embedded in the HDF5 model to identify `Lambda` layers

2. Extract and decode the Base64-encoded data of the `Lambda` layer to obtain a Python code object

3. Decompile the raw Python code object, ex. using [pycdc](https://github.com/zrax/pycdc)

4. Examine the decompiled Python code to determine if it contains any malicious instructions

   

JFrog conducts extraction, decompilation and detailed analysis on each TensorFlow HDF5 model in order to determine whether any malicious code is present.



## Additional Information

* https://hiddenlayer.com/innovation-hub/models-are-code/#Code-Execution-via-Lambda