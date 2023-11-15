---
description: CVE-2023-5245, MEDIUM, Using MLeap for loading a saved model (zip archive) can lead to path traversal/arbitrary file creation and possibly remote code execution.
title: MLeap Path Traversal RCE
date_published: "2023-11-15"
last_updated: "2023-11-15"
xray_id: XRAY-532656
vul_id: CVE-2023-5245
cvss: 7.5
severity: medium
discovered_by: David Fadida
type: vulnerability

---

## Summary

Using MLeap for loading a saved model (zip archive) can lead to path traversal/arbitrary file creation and possibly remote code execution.

## Component

[ml.combust.mleap.mleap-tensorflow](https://mvnrepository.com/artifact/ml.combust.mleap/mleap-tensorflow)

## Affected versions

[0.18.0,0.23.0], Fixed in 0.23.1

## Description

`FileUtil.extract()` enumerates all zip file entries and extracts each file without validating whether file paths in the archive are outside the intended directory.

When creating an instance of `TensorflowModel` using the `saved_model` format and an exported TensorFlow model, the `apply()` function invokes the vulnerable implementation of `FileUtil.extract()`.

Arbitrary file creation can directly lead to code execution

## PoC

Example of a vulnerable usage of MLeap -

```scala
package example

import ml.combust.mleap.core.types._
import ml.combust.mleap.tensor.Tensor
import ml.combust.mleap.tensorflow.TensorflowModel
import org.tensorflow

import java.nio.file.{Files, Paths}

object LoadModelFromZip extends App {
  // Read zip file
  def readZipFileAsByteArray(filePath: String): Array[Byte] = {
    val fileBytes = Files.readAllBytes(Paths.get(filePath))
    fileBytes
  }
  // Stub 
  val _file = "/models/malicious.zip"
  val modelAsBytes = readZipFileAsByteArray(_file)
  // Create a model from zip file
  val model = TensorflowModel(
        inputs = Seq(
          ("InputA", TensorType.Float()), ("InputB", TensorType.Float())
        ),
        outputs = Seq(("MyResult", TensorType.Float())),
        format = Option("saved_model"),
        modelBytes = modelAsBytes
      )
  // Invoke FileUtil.extract()
  model.apply(Tensor.create(Array(2.0, 1.0, 34.0), Seq(-1)))
}

```



## Vulnerability Mitigations

No mitigations are supplied for this issue

## References

[Fixing PR](https://github.com/combust/mleap/pull/866#issuecomment-1738032225)

