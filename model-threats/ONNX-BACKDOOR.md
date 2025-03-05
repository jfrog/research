---
description: ONNX model with architectural backdoor causing unexpected outputs
title: ONNX-BACKDOOR
type: modelThreat
---


## Overview

An ONNX model may be backdoored to produce unexpected outputs under certain "trigger" inputs, which may lead to context-specific damage depending on the model's usage.

ONNX models consist of a directed computational graph where layers and operators define how input data flows through the network.

Attackers can introduce backdoors by:

- Embedding **hidden layers** that activate under specific conditions.
- Using **malicious graph structures** that bypass key computations under adversary-defined triggers.
- Embed **conditional execution paths** that trigger the backdoor only under specific inputs.

![](/img/onnx_backdoor.png)

The backdoor logic usually lies dormant under normal input conditions, but can be made to activate with a "trigger" input. For example - in models that take image files as input, the trigger could be adding a red pixel to the input image in a very specific location.

Once the backdoor is activated, the model will produce attacker-chosen outputs instead of outputs calculated via the model's intended logic.

A backdoored model can be extremely dangerous, for example - if attackers manage to compromise a computer vision model embedded in cars that's responsible for identifying street signs, they could cause car collisions under very specific conditions, which would be hard to trace back to the compromised model.



## Time of Infection

[] Model Load

**[v] Model Query**

[] Other



## Additional Information

* https://hiddenlayer.com/innovation-hub/shadowlogic/
* https://arxiv.org/pdf/2206.07840
