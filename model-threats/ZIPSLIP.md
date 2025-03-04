---
description: Zip-based model attempting ZipSlip path traversal
title: ZIPSLIP
type: modelThreat
---


## Overview

A Zip-based model may contain path-traversal file entries, which may lead to **arbitrary file overwrite** when interacting with the model.

Many ML models such as Keras v3, PyTorch and MLeap come serialized as a ZIP archive. 

As part of standard usage with these models, the model library may extract some or all of the files from the ZIP archive.

The ZIP format in general is potentially vulnerable to a path traversal attack nicknamed "Zip Slip" where some zip file entries can point to path **outside of the intended extraction directory**. This is usually achieved in one of two ways -

1. A file entry that contains path traversal characters, such as - `../../../../../etc/passwd`

2. A file entry that contains a symbolic link

   

When vulnerable libraries extract these file entries, the file is extracted outside of the intended extraction directory and can overwrite critical system files, in the worst case leading to arbitrary code execution.

As demonstrated in [CVE-2023-5245](https://research.jfrog.com/vulnerabilities/mleap-path-traversal-rce-xray-532656/), some Zip-based models are indeed vulnerable to the "Zip Slip" attack, therefore each Zip-based model should be inspected for malicious file entries before it is loaded and queried.

It is extremely easy for attackers to generate "Zip Slip" payloads with automated public tools such as [evilarc](https://github.com/ptoomey3/evilarc/tree/master).



## Time of Infection

[] Model Load

**[v] Model Query**

[] Other



## Evidence Extraction and False Positive Elimination

To safely determine if the suspected zip archive contains malicious entries with path traversal characters,  it is possible to employ a detection similar to the following Python code snippet -

```python
import zipfile
import os

def is_zip_slip_archive(zip_path):
    """
    Checks if a ZIP file contains files with path traversal sequences.
    :param zip_path: Path to the ZIP file.
    :return: True if the ZIP contains malicious paths, otherwise False.
    """
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_file:
            for fpath in zip_file.namelist():
                # Check if the path attempts to escape the intended directory
                if fpath.startswith("..") or "../" in fpath:
                    print(f"Potential Zip Slip vulnerability detected: {fpath}")
                    return True            
    except zipfile.BadZipFile:
        print("Error: Not a valid ZIP file.")
        return False
    
    print("No Zip Slip vulnerability detected.")
    return False
```



JFrog conducts detailed analysis on each Zip-based model in order to determine whether any malicious file entries are present.



## Additional Information

* https://jfrog.com/blog/machine-learning-bug-bonanza-exploiting-ml-clients-and-safe-models/
