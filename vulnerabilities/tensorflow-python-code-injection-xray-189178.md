---
description: CVE-2021-41228 High severity. Insufficient input validation in TensorFlow allows an attacker to perform Python code injection when processing a malicious command line argument
title: TensorFlow Python code injection
date_published: "2021-11-16"
last_updated: "2021-11-16"
xray_id: XRAY-189178
vul_id: CVE-2021-41228
cvss: 7.8
severity: high
discovered_by: Omer Kaspi
type: vulnerability
---
## Summary
Insufficient input validation in TensorFlow allows an attacker to perform Python code injection when processing a malicious command line argument

## Component

[TensorFlow](https://github.com/tensorflow/tensorflow)

## Affected versions

TensorFlow [2.4.0, 2.4.4), fixed in 2.4.4

TensorFlow [2.5.0 ,2.5.2), fixed in 2.5.2

TensorFlow [2.6.0, 2.6.1), fixed in 2.6.1

## Description

[TensorFlow](https://github.com/tensorflow/tensorflow) is a popular Machine Learning platform that's well-known and widely used in the industry.

A code injection issue has been found in one of the tools shipped with TensorFlow, called `saved_model_cli`. This tool is used to save a ML model's state.

An attacker that can control the contents of the `--input_examples` argument, can provide a malicious input that runs arbitrary Python code, since the argument flows directly into `eval()`.

## PoC

No PoC is supplied for this issue

## Vulnerability Mitigations

Remove the `saved_model_cli` tool from your image

## References

[JFrog Blogpost](https://jfrog.com/blog/tensorflow-python-code-injection-more-eval-woes/)
